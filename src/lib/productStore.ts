import type { Product } from '../types';
import { SAMPLE_PRODUCTS } from '../data/sampleProducts';
import {
  isSupabaseConfigured,
  fetchSupabaseProducts,
  insertSupabaseProduct,
  updateSupabaseProduct,
  deleteSupabaseProduct,
} from './supabase';

const LOCAL_STORAGE_KEY = 'vaidehi_custom_products_v1';
const SHOW_SAMPLES_KEY = 'vaidehi_show_sample_products';
const HIDDEN_SAMPLE_IDS_KEY = 'vaidehi_hidden_sample_ids';

export interface ProductStoreState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  isBackendConnected: boolean;
  showSampleProducts: boolean;
}

/**
 * Load locally stored custom products (for when Supabase credentials are not yet set)
 */
export const getLocalProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse local products from storage', e);
    return [];
  }
};

export const saveLocalProducts = (products: Product[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save local products to storage', e);
  }
};

const DEMO_MODE_STORAGE_KEY = 'vaidehi_demo_mode_active';

export const getShowSamplesPreference = (): boolean => {
  try {
    const pref = localStorage.getItem(DEMO_MODE_STORAGE_KEY);
    // Never mix sample products into real catalogue by default: strictly requires explicit 'true'
    return pref === 'true';
  } catch {
    return false;
  }
};

export const setShowSamplesPreference = (show: boolean): void => {
  try {
    localStorage.setItem(DEMO_MODE_STORAGE_KEY, String(show));
    // Clear legacy key to avoid old default:true leakage
    localStorage.removeItem(SHOW_SAMPLES_KEY);
  } catch {
    // ignore
  }
};

export const getHiddenSampleIds = (): string[] => {
  try {
    const raw = localStorage.getItem(HIDDEN_SAMPLE_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const hideSampleProduct = (id: string): void => {
  try {
    const current = getHiddenSampleIds();
    if (!current.includes(id)) {
      localStorage.setItem(HIDDEN_SAMPLE_IDS_KEY, JSON.stringify([...current, id]));
    }
  } catch {
    // ignore
  }
};

/**
 * High-level unified product repository:
 * Fetches from Supabase if connected, otherwise combines local products + sample products.
 * Never drops or overwrites existing database rows or sample items.
 */
export const loadAllCatalogueProducts = async (
  showSamples: boolean
): Promise<{ products: Product[]; isSupabase: boolean; error: string | null }> => {
  const hiddenSampleIds = new Set(getHiddenSampleIds());

  if (isSupabaseConfigured()) {
    const { products, error } = await fetchSupabaseProducts();
    if (error) {
      console.warn('Supabase fetch error, falling back to local storage', error);
      const local = getLocalProducts();
      const localCodes = new Set(local.map((p) => p.code.trim().toUpperCase()));
      const activeSamples = showSamples
        ? SAMPLE_PRODUCTS.filter(
            (s) => !localCodes.has(s.code.trim().toUpperCase()) && !hiddenSampleIds.has(s.id)
          )
        : [];
      const combined = [...local, ...activeSamples];
      return { products: combined, isSupabase: false, error };
    }

    // Retain all Supabase database products, plus any non-duplicate sample products if showSamples is true
    const dbCodes = new Set(products.map((p) => p.code.trim().toUpperCase()));
    const dbIds = new Set(products.map((p) => p.id));
    const activeSamples = showSamples
      ? SAMPLE_PRODUCTS.filter(
          (s) =>
            !dbCodes.has(s.code.trim().toUpperCase()) &&
            !dbIds.has(s.id) &&
            !hiddenSampleIds.has(s.id)
        )
      : [];

    const finalProducts = [...products, ...activeSamples];
    return { products: finalProducts, isSupabase: true, error: null };
  } else {
    const local = getLocalProducts();
    const localCodes = new Set(local.map((p) => p.code.trim().toUpperCase()));
    const activeSamples = showSamples
      ? SAMPLE_PRODUCTS.filter(
          (s) => !localCodes.has(s.code.trim().toUpperCase()) && !hiddenSampleIds.has(s.id)
        )
      : [];
    const combined = [...local, ...activeSamples];
    return { products: combined, isSupabase: false, error: null };
  }
};

/**
 * Add product to store (Supabase or Local).
 * Uses SQL INSERT for a single row in Supabase products table.
 */
export const addProductToStore = async (
  productData: Omit<Product, 'id'>
): Promise<{ product: Product | null; error: string | null }> => {
  if (isSupabaseConfigured()) {
    return await insertSupabaseProduct(productData);
  } else {
    const newProduct: Product = {
      ...productData,
      id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const current = getLocalProducts();
    const updated = [newProduct, ...current];
    saveLocalProducts(updated);
    return { product: newProduct, error: null };
  }
};

/**
 * Update product in store (Supabase or Local).
 * Uses SQL UPDATE for the target row only.
 */
export const updateProductInStore = async (
  id: string,
  updates: Partial<Product>
): Promise<{ error: string | null }> => {
  if (isSupabaseConfigured()) {
    if (id.startsWith('sample-')) {
      // Editing a sample product promotes it to an actual row in Supabase
      const sampleItem = SAMPLE_PRODUCTS.find((s) => s.id === id);
      const newProductPayload: Omit<Product, 'id'> = {
        code: updates.code ?? sampleItem?.code ?? '',
        name: updates.name ?? sampleItem?.name ?? '',
        gender: (updates.gender ?? sampleItem?.gender ?? 'Female') as 'Female' | 'Male' | 'Unisex',
        category: (updates.category ?? sampleItem?.category ?? 'Sets') as any,
        description: updates.description ?? sampleItem?.description ?? '',
        original_price: updates.original_price ?? sampleItem?.original_price ?? 0,
        selling_price: updates.selling_price ?? sampleItem?.selling_price ?? 0,
        images: updates.images ?? sampleItem?.images ?? [],
        in_stock: updates.in_stock ?? sampleItem?.in_stock ?? true,
      };
      const res = await insertSupabaseProduct(newProductPayload);
      if (res.product && !res.error) {
        hideSampleProduct(id);
      }
      return { error: res.error };
    }
    return await updateSupabaseProduct(id, updates);
  } else {
    const current = getLocalProducts();
    const index = current.findIndex((p) => p.id === id);
    if (index === -1) {
      if (id.startsWith('sample-')) {
        // Promote sample to local storage
        const sampleItem = SAMPLE_PRODUCTS.find((s) => s.id === id);
        const promoted: Product = {
          id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          code: updates.code ?? sampleItem?.code ?? '',
          name: updates.name ?? sampleItem?.name ?? '',
          gender: (updates.gender ?? sampleItem?.gender ?? 'Female') as 'Female' | 'Male' | 'Unisex',
          category: (updates.category ?? sampleItem?.category ?? 'Sets') as any,
          description: updates.description ?? sampleItem?.description ?? '',
          original_price: updates.original_price ?? sampleItem?.original_price ?? 0,
          selling_price: updates.selling_price ?? sampleItem?.selling_price ?? 0,
          images: updates.images ?? sampleItem?.images ?? [],
          in_stock: updates.in_stock ?? sampleItem?.in_stock ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        saveLocalProducts([promoted, ...current]);
        hideSampleProduct(id);
        return { error: null };
      }
      return { error: 'Product not found in local catalogue' };
    }
    current[index] = {
      ...current[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveLocalProducts(current);
    return { error: null };
  }
};

/**
 * Delete product from store (Supabase or Local).
 * Uses SQL DELETE for the target row only.
 */
export const deleteProductFromStore = async (id: string): Promise<{ error: string | null }> => {
  if (id.startsWith('sample-')) {
    hideSampleProduct(id);
    return { error: null };
  }
  if (isSupabaseConfigured()) {
    return await deleteSupabaseProduct(id);
  } else {
    const current = getLocalProducts();
    const updated = current.filter((p) => p.id !== id);
    saveLocalProducts(updated);
    return { error: null };
  }
};
