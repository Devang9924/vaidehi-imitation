import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Product, CustomerReview, ReviewFormData, ReviewStatus } from '../types';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project') &&
    supabaseAnonKey.length > 20
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

/**
 * Verify whether an authenticated user is recorded in public.admin_users
 */
export const isUserAuthorizedAdmin = async (
  userId: string
): Promise<{ isAuthorized: boolean; error: string | null }> => {
  if (!supabase) return { isAuthorized: false, error: 'Supabase is not configured' };
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return { isAuthorized: false, error: error.message };
    }
    if (!data) {
      return { isAuthorized: false, error: null };
    }
    return { isAuthorized: true, error: null };
  } catch (err: any) {
    return { isAuthorized: false, error: err.message || 'Authorization check failed' };
  }
};

/**
 * Sign in admin user using Supabase Auth and verify admin privileges
 */
export const signInAdmin = async (
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> => {
  if (!supabase) {
    return { user: null, error: 'Supabase credentials are not configured yet.' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      if (
        error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('Failed to fetch')
      ) {
        return {
          user: null,
          error:
            'Connection error: Unable to reach Supabase. Please verify your internet connection and that VITE_SUPABASE_URL in .env matches your Supabase Project URL.',
        };
      }
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'Authentication failed. Please check your credentials.' };
    }

    // Verify authorization in public.admin_users
    const { isAuthorized, error: authzError } = await isUserAuthorizedAdmin(data.user.id);
    if (!isAuthorized) {
      await supabase.auth.signOut();
      if (authzError) {
        return {
          user: null,
          error: `Authorization check error: ${authzError}. Ensure public.admin_users exists in your database.`,
        };
      }
      return {
        user: null,
        error: `Access denied: Account (${email}) is not authorized in public.admin_users. Please run the helper SQL in Supabase SQL Editor to grant admin access to this user.`,
      };
    }

    return { user: data.user, error: null };
  } catch (err: any) {
    return {
      user: null,
      error: err.message || 'An unexpected error occurred during authentication.',
    };
  }
};

/**
 * Sign out admin user
 */
export const signOutAdmin = async (): Promise<void> => {
  if (!supabase) return;
  await supabase.auth.signOut();
};

/**
 * Get current authenticated user, ensuring they are an authorized admin
 */
export const getCurrentAdminUser = async (): Promise<User | null> => {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;

    const { isAuthorized } = await isUserAuthorizedAdmin(data.user.id);
    if (!isAuthorized) {
      await supabase.auth.signOut();
      return null;
    }

    return data.user;
  } catch {
    return null;
  }
};

/**
 * Fetch all products from Supabase
 */
export const fetchSupabaseProducts = async (): Promise<{ products: Product[]; error: string | null }> => {
  if (!supabase) {
    return { products: [], error: 'Supabase not configured' };
  }
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { products: [], error: error.message };
  }

  // Map Supabase rows to Product model
  const mapped: Product[] = (data || []).map((row: any) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    gender: row.gender,
    category: row.category,
    description: row.description || '',
    original_price: Number(row.original_price),
    selling_price: Number(row.selling_price),
    images: Array.isArray(row.images) ? row.images : (row.images ? [row.images] : []),
    in_stock: row.in_stock ?? true,
    is_sample: false,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  return { products: mapped, error: null };
};

/**
 * Insert new product into Supabase
 */
export const insertSupabaseProduct = async (product: Omit<Product, 'id'>): Promise<{ product: Product | null; error: string | null }> => {
  if (!supabase) {
    return { product: null, error: 'Supabase not configured' };
  }

  const payload = {
    code: product.code,
    name: product.name,
    gender: product.gender,
    category: product.category,
    description: product.description,
    original_price: product.original_price,
    selling_price: product.selling_price,
    images: product.images,
    in_stock: product.in_stock,
  };

  const { data, error } = await supabase
    .from('products')
    .insert([payload])
    .select()
    .single();

  if (error) {
    return { product: null, error: error.message };
  }

  return { product: data as Product, error: null };
};

/**
 * Update existing product in Supabase
 */
export const updateSupabaseProduct = async (id: string, updates: Partial<Product>): Promise<{ error: string | null }> => {
  if (!supabase) {
    return { error: 'Supabase not configured' };
  }

  const { error } = await supabase
    .from('products')
    .update({
      code: updates.code,
      name: updates.name,
      gender: updates.gender,
      category: updates.category,
      description: updates.description,
      original_price: updates.original_price,
      selling_price: updates.selling_price,
      images: updates.images,
      in_stock: updates.in_stock,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  return { error: error ? error.message : null };
};

/**
 * Delete product from Supabase
 */
export const deleteSupabaseProduct = async (id: string): Promise<{ error: string | null }> => {
  if (!supabase) {
    return { error: 'Supabase not configured' };
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  return { error: error ? error.message : null };
};

/**
 * Upload image to Supabase Storage bucket ('product-images')
 */
export const uploadProductImage = async (file: File): Promise<{ url: string | null; error: string | null }> => {
  if (!supabase) {
    return { url: null, error: 'Supabase storage is not configured' };
  }

  try {
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = `products/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const { data: publicData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return { url: publicData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || 'Image upload failed' };
  }
};

const LOCAL_SUBMITTED_REVIEWS_KEY = 'vaidehi_submitted_reviews_v1';

export const getLocalSubmittedReviews = (): CustomerReview[] => {
  try {
    const raw = localStorage.getItem(LOCAL_SUBMITTED_REVIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalSubmittedReview = (review: CustomerReview): void => {
  try {
    const current = getLocalSubmittedReviews();
    const updated = [review, ...current.filter((r) => r.id !== review.id)];
    localStorage.setItem(LOCAL_SUBMITTED_REVIEWS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
};

export const updateLocalSubmittedReviewStatus = (id: string, status: ReviewStatus): void => {
  try {
    const current = getLocalSubmittedReviews();
    const index = current.findIndex((r) => r.id === id);
    if (index !== -1) {
      current[index].status = status;
      localStorage.setItem(LOCAL_SUBMITTED_REVIEWS_KEY, JSON.stringify(current));
    }
  } catch {
    // ignore
  }
};

export const deleteLocalSubmittedReview = (id: string): void => {
  try {
    const current = getLocalSubmittedReviews();
    const updated = current.filter((r) => r.id !== id);
    localStorage.setItem(LOCAL_SUBMITTED_REVIEWS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
};

/**
 * Submit a customer review (Saved as 'pending' moderation status in Supabase)
 * Automatically associates the review with a product where applicable.
 */
export const submitCustomerReview = async (
  formData: ReviewFormData
): Promise<{ success: boolean; error: string | null }> => {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase database is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to enable online review storage.',
    };
  }

  // Generate local backup object
  const localBackup: CustomerReview = {
    id: `local-rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    customer_name: formData.customer_name.trim(),
    rating: formData.rating,
    title: formData.title.trim(),
    message: formData.message.trim(),
    status: 'pending',
    created_at: new Date().toISOString(),
    product_id: formData.product_id,
    product_code: formData.product_code,
    product_name: formData.product_name,
  };
  saveLocalSubmittedReview(localBackup);

  // Payload for Supabase
  const payloadWithProduct: any = {
    customer_name: formData.customer_name.trim(),
    rating: formData.rating,
    title: formData.title.trim(),
    message: formData.message.trim(),
    status: 'pending',
  };

  if (formData.product_id && !formData.product_id.startsWith('sample-')) {
    payloadWithProduct.product_id = formData.product_id;
  }
  if (formData.product_code) {
    payloadWithProduct.product_code = formData.product_code;
  }
  if (formData.product_name) {
    payloadWithProduct.product_name = formData.product_name;
  }

  // Attempt insert with product fields
  let { error } = await supabase.from('reviews').insert([payloadWithProduct]);

  // If table does not yet have product_id/product_code columns, fall back to core columns
  if (error && (error.message.includes('column') || error.code === 'PGRST204')) {
    const corePayload = {
      customer_name: formData.customer_name.trim(),
      rating: formData.rating,
      title: formData.title.trim(),
      message: formData.message.trim(),
      status: 'pending',
    };
    const res = await supabase.from('reviews').insert([corePayload]);
    error = res.error;
  }

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
};

/**
 * Fetch only approved reviews for the public website
 */
export const fetchApprovedReviews = async (): Promise<{ reviews: CustomerReview[]; error: string | null }> => {
  if (!supabase) {
    return { reviews: [], error: null };
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    return { reviews: [], error: error.message };
  }

  return { reviews: (data || []) as CustomerReview[], error: null };
};

/**
 * Fetch all reviews for admin moderation
 */
export const fetchAllReviewsForAdmin = async (): Promise<{ reviews: CustomerReview[]; error: string | null }> => {
  if (!supabase) {
    return { reviews: getLocalSubmittedReviews(), error: null };
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    // Return local backup reviews if Supabase table query errors
    const local = getLocalSubmittedReviews();
    if (local.length > 0) {
      return { reviews: local, error: null };
    }
    return { reviews: [], error: error.message };
  }

  const dbReviews: CustomerReview[] = (data || []).map((row: any) => ({
    id: row.id,
    customer_name: row.customer_name,
    rating: Number(row.rating),
    title: row.title || '',
    message: row.message || '',
    status: row.status as ReviewStatus,
    created_at: row.created_at,
    product_id: row.product_id,
    product_code: row.product_code,
    product_name: row.product_name,
  }));

  // Merge any local submitted reviews that might not yet be in DB response
  const dbIds = new Set(dbReviews.map((r) => r.id));
  const localMissing = getLocalSubmittedReviews().filter(
    (l) => !dbIds.has(l.id) && !dbReviews.some((d) => d.customer_name === l.customer_name && d.message === l.message)
  );

  return { reviews: [...dbReviews, ...localMissing], error: null };
};

/**
 * Update review status (approve or reject) by admin
 */
export const updateReviewStatus = async (
  id: string,
  status: ReviewStatus
): Promise<{ error: string | null }> => {
  if (!supabase) {
    return { error: 'Supabase not configured' };
  }

  const { error } = await supabase
    .from('reviews')
    .update({ status })
    .eq('id', id);

  return { error: error ? error.message : null };
};

/**
 * Delete a review by admin
 */
export const deleteReview = async (id: string): Promise<{ error: string | null }> => {
  if (!supabase) {
    return { error: 'Supabase not configured' };
  }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  return { error: error ? error.message : null };
};

