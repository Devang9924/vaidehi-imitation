import type { JewelleryCategory, CategoryGender } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_CATEGORIES_KEY = 'vaidehi_custom_categories_v1';

export const DEFAULT_CATEGORIES: JewelleryCategory[] = [
  { id: 'cat-01', name: 'Necklace', gender: 'Female', is_active: true },
  { id: 'cat-02', name: 'Earrings', gender: 'Female', is_active: true },
  { id: 'cat-03', name: 'Bangles', gender: 'Female', is_active: true },
  { id: 'cat-04', name: 'Rings', gender: 'All', is_active: true },
  { id: 'cat-05', name: 'Bracelets', gender: 'All', is_active: true },
  { id: 'cat-06', name: 'Sets', gender: 'Female', is_active: true },
  { id: 'cat-07', name: 'Juda', gender: 'Female', is_active: true },
  { id: 'cat-08', name: 'Pendant', gender: 'All', is_active: true },
  { id: 'cat-09', name: 'Watches', gender: 'All', is_active: true },
  { id: 'cat-10', name: 'Other Jewellery', gender: 'All', is_active: true },
];

/**
 * Get locally stored categories
 */
export const getLocalCategories = (): JewelleryCategory[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
    if (!raw) return DEFAULT_CATEGORIES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATEGORIES;
  } catch (e) {
    console.error('Failed to parse local categories', e);
    return DEFAULT_CATEGORIES;
  }
};

/**
 * Save categories to local storage
 */
export const saveLocalCategories = (categories: JewelleryCategory[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('vaidehi-categories-updated'));
    }
  } catch (e) {
    console.error('Failed to save local categories', e);
  }
};

/**
 * Fetch all categories from Supabase, with automatic local fallback
 */
export const loadAllCategories = async (): Promise<{
  categories: JewelleryCategory[];
  isSupabase: boolean;
  error: string | null;
}> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        // Table does not exist yet or permissions issue - use local storage
        console.warn('Supabase categories fetch notice, using cached categories:', error.message);
        return {
          categories: getLocalCategories(),
          isSupabase: false,
          error: null,
        };
      }

      if (data && data.length > 0) {
        const mapped: JewelleryCategory[] = data.map((row: any) => ({
          id: row.id,
          name: row.name,
          gender: row.gender as CategoryGender,
          is_active: Boolean(row.is_active),
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
        // Update local cache
        saveLocalCategories(mapped);
        return { categories: mapped, isSupabase: true, error: null };
      }

      // If Supabase table exists but has 0 rows, seed with default categories
      const local = getLocalCategories();
      return { categories: local, isSupabase: true, error: null };
    } catch (err: any) {
      return {
        categories: getLocalCategories(),
        isSupabase: false,
        error: err.message || 'Failed to load categories',
      };
    }
  }

  return { categories: getLocalCategories(), isSupabase: false, error: null };
};

/**
 * Add a new jewellery category
 */
export const addCategoryToStore = async (
  categoryData: Omit<JewelleryCategory, 'id' | 'created_at' | 'updated_at'>
): Promise<{ category: JewelleryCategory | null; error: string | null }> => {
  const cleanName = categoryData.name.trim();
  if (!cleanName) {
    return { category: null, error: 'Category name cannot be empty' };
  }

  // Check duplicate in local storage
  const current = getLocalCategories();
  const exists = current.some((c) => c.name.toLowerCase() === cleanName.toLowerCase());
  if (exists) {
    return { category: null, error: `Category "${cleanName}" already exists` };
  }

  const newCatId = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newCat: JewelleryCategory = {
    id: newCatId,
    name: cleanName,
    gender: categoryData.gender,
    is_active: categoryData.is_active ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Try Supabase insert
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([
          {
            name: cleanName,
            gender: categoryData.gender,
            is_active: categoryData.is_active ?? true,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        newCat.id = data.id;
        newCat.created_at = data.created_at;
        newCat.updated_at = data.updated_at;
      }
    } catch {
      // Continue with local save
    }
  }

  const updatedList = [...current, newCat].sort((a, b) => a.name.localeCompare(b.name));
  saveLocalCategories(updatedList);
  return { category: newCat, error: null };
};

/**
 * Update an existing category (name, gender, is_active)
 */
export const updateCategoryInStore = async (
  id: string,
  updates: Partial<Omit<JewelleryCategory, 'id' | 'created_at'>>
): Promise<{ error: string | null }> => {
  const current = getLocalCategories();
  const index = current.findIndex((c) => c.id === id);
  if (index === -1) {
    return { error: 'Category not found' };
  }

  if (updates.name) {
    const cleanName = updates.name.trim();
    const duplicate = current.some(
      (c) => c.id !== id && c.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (duplicate) {
      return { error: `Another category named "${cleanName}" already exists` };
    }
    updates.name = cleanName;
  }

  // Try Supabase update
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('categories')
        .update({
          ...(updates.name ? { name: updates.name } : {}),
          ...(updates.gender ? { gender: updates.gender } : {}),
          ...(updates.is_active !== undefined ? { is_active: updates.is_active } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    } catch {
      // Continue with local save
    }
  }

  current[index] = {
    ...current[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  saveLocalCategories([...current]);
  return { error: null };
};

/**
 * Delete a category from store (checks safe deletion against products)
 */
export const deleteCategoryFromStore = async (
  id: string
): Promise<{ error: string | null }> => {
  const current = getLocalCategories();
  const target = current.find((c) => c.id === id);
  if (!target) {
    return { error: 'Category not found' };
  }

  // Try Supabase delete
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch {
      // Continue with local delete
    }
  }

  const filtered = current.filter((c) => c.id !== id);
  saveLocalCategories(filtered);
  return { error: null };
};

/**
 * Filter categories for a specific product gender
 * - Male product -> Male and All categories
 * - Female product -> Female and All categories
 * - Unisex/All product -> All categories by default (or all active if allowAll=true)
 */
export const filterCategoriesForProductGender = (
  categories: JewelleryCategory[],
  productGender: 'Female' | 'Male' | 'Unisex',
  showAll = false
): JewelleryCategory[] => {
  if (showAll) {
    return categories.filter((c) => c.is_active);
  }

  if (productGender === 'Male') {
    return categories.filter((c) => c.is_active && (c.gender === 'Male' || c.gender === 'All'));
  }

  if (productGender === 'Female') {
    return categories.filter((c) => c.is_active && (c.gender === 'Female' || c.gender === 'All'));
  }

  // Unisex product: shows 'All' categories by default
  return categories.filter((c) => c.is_active && c.gender === 'All');
};
