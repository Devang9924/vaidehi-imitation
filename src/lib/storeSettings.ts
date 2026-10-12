import { supabase, isSupabaseConfigured } from './supabase';
import type { StoreSettings, OrderMode } from '../types';

export type { StoreSettings, OrderMode } from '../types';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  order_mode: 'whatsapp',
  razorpay_enabled: false,
  cod_enabled: false,
};

const LOCAL_SETTINGS_KEY = 'vaidehi_store_settings_v1';
export const SETTINGS_UPDATED_EVENT = 'vaidehi_settings_updated';

/**
 * Read cached settings synchronously from localStorage (or defaults)
 */
export const getCachedStoreSettings = (): StoreSettings => {
  if (typeof window === 'undefined') return DEFAULT_STORE_SETTINGS;
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (!raw) return DEFAULT_STORE_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      order_mode: (parsed.order_mode === 'online_checkout' ? 'online_checkout' : 'whatsapp') as OrderMode,
      razorpay_enabled: Boolean(parsed.razorpay_enabled),
      cod_enabled: Boolean(parsed.cod_enabled),
      updated_at: parsed.updated_at,
    };
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
};

/**
 * Save settings to localStorage
 */
const saveCachedStoreSettings = (settings: StoreSettings): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT, { detail: settings }));
  } catch {
    // Ignore storage quota errors
  }
};

/**
 * Fetch authoritative store settings from Supabase (or fallback gracefully to local cache)
 */
export const fetchStoreSettings = async (): Promise<{ settings: StoreSettings; error: string | null }> => {
  const cached = getCachedStoreSettings();

  if (!isSupabaseConfigured() || !supabase) {
    return { settings: cached, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('order_mode, razorpay_enabled, cod_enabled, updated_at')
      .eq('id', 'default')
      .maybeSingle();

    if (error) {
      // Table may not yet exist in Supabase; use cached/default settings safely
      return { settings: cached, error: null };
    }

    if (data) {
      const liveSettings: StoreSettings = {
        order_mode: data.order_mode === 'online_checkout' ? 'online_checkout' : 'whatsapp',
        razorpay_enabled: Boolean(data.razorpay_enabled),
        cod_enabled: Boolean(data.cod_enabled),
        updated_at: data.updated_at,
      };
      saveCachedStoreSettings(liveSettings);
      return { settings: liveSettings, error: null };
    }

    // No row found: return cached/default
    return { settings: cached, error: null };
  } catch (err: any) {
    return { settings: cached, error: err.message || null };
  }
};

/**
 * Convenience helper to get the active settings asynchronously
 */
export const getActiveStoreSettings = async (): Promise<StoreSettings> => {
  const { settings } = await fetchStoreSettings();
  return settings;
};

/**
 * Update store settings in Supabase (Admin Only) and local cache
 */
export const updateStoreSettings = async (
  newSettings: Partial<StoreSettings>
): Promise<{ success: boolean; settings: StoreSettings; error: string | null }> => {
  const current = getCachedStoreSettings();
  const updated: StoreSettings = {
    ...current,
    ...newSettings,
    updated_at: new Date().toISOString(),
  };

  // Always update local cache first
  saveCachedStoreSettings(updated);

  if (!isSupabaseConfigured() || !supabase) {
    return { success: true, settings: updated, error: null };
  }

  try {
    const { error } = await supabase.from('store_settings').upsert({
      id: 'default',
      order_mode: updated.order_mode,
      razorpay_enabled: updated.razorpay_enabled,
      cod_enabled: updated.cod_enabled,
      updated_at: updated.updated_at,
    });

    if (error) {
      console.warn('Could not persist settings to Supabase (using local cache):', error.message);
      return { success: true, settings: updated, error: error.message };
    }

    return { success: true, settings: updated, error: null };
  } catch (err: any) {
    console.warn('Settings persistence error:', err.message);
    return { success: true, settings: updated, error: err.message };
  }
};
