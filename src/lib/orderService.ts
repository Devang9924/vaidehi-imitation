import { supabase, isSupabaseConfigured } from './supabase';
import type { Order, OrderStatus, PaymentStatus, PaymentEnvironment } from '../types';

const LOCAL_ORDERS_KEY = 'vaidehi_local_orders_v1';

export const getLocalOrders = (): Order[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalOrder = (order: Order): void => {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalOrders();
    const updated = [order, ...current.filter((o) => o.id !== order.id && o.order_number !== order.order_number)];
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota
  }
};

/**
 * Determine and resolve the verified payment environment for an order.
 * Strictly adheres to requirement: Do not guess environment if indeterminate -> returns 'unknown'.
 */
export const getOrderPaymentEnvironment = (order: Order): PaymentEnvironment => {
  if (order.payment_env && order.payment_env !== 'unknown') {
    return order.payment_env;
  }
  if (order.payment_method === 'cod') {
    return 'cod';
  }
  if (order.payment_method === 'whatsapp') {
    return 'whatsapp';
  }
  // If Razorpay and environment was not recorded server-side, do not guess
  return 'unknown';
};

/**
 * Generate a clean, unique order reference number: e.g. VI-M1K2-8492
 */
export const generateOrderNumber = (): string => {
  const timeCode = Date.now().toString(36).toUpperCase().slice(-4);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `VI-${timeCode}-${randomSuffix}`;
};

/**
 * Submit and persist a customer checkout order.
 * Prevents accidental duplicate submissions and duplicate orders on repeated verification callbacks.
 */
export const createCustomerOrder = async (
  orderInput: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; order: Order | null; error: string | null }> => {
  // Check local cache for duplicate payment ID
  if (orderInput.razorpay_payment_id) {
    const local = getLocalOrders();
    const existing = local.find((o) => o.razorpay_payment_id === orderInput.razorpay_payment_id);
    if (existing) {
      return { success: true, order: existing, error: null };
    }
  }

  // Check Supabase if configured for duplicate payment ID
  if (orderInput.razorpay_payment_id && isSupabaseConfigured() && supabase) {
    try {
      const { data: existingDb } = await supabase
        .from('orders')
        .select('*')
        .eq('razorpay_payment_id', orderInput.razorpay_payment_id)
        .maybeSingle();

      if (existingDb) {
        const orderObj: Order = {
          id: existingDb.id,
          order_number: existingDb.order_number,
          customer_name: existingDb.customer_name,
          customer_phone: existingDb.customer_phone,
          shipping_address: existingDb.shipping_address,
          city: existingDb.city,
          state: existingDb.state,
          pincode: existingDb.pincode,
          notes: existingDb.notes,
          items: Array.isArray(existingDb.items) ? existingDb.items : [],
          subtotal: Number(existingDb.subtotal),
          shipping_fee: Number(existingDb.shipping_fee || 0),
          total: Number(existingDb.total),
          payment_method: existingDb.payment_method,
          payment_status: existingDb.payment_status,
          order_status: existingDb.order_status,
          payment_env: existingDb.payment_env || 'unknown',
          razorpay_order_id: existingDb.razorpay_order_id,
          razorpay_payment_id: existingDb.razorpay_payment_id,
          created_at: existingDb.created_at,
          updated_at: existingDb.updated_at,
        };
        saveLocalOrder(orderObj);
        return { success: true, order: orderObj, error: null };
      }
    } catch {
      // Continue to fresh insert
    }
  }

  const orderNumber = generateOrderNumber();
  const now = new Date().toISOString();

  const resolvedEnv: PaymentEnvironment = orderInput.payment_env || (
    orderInput.payment_method === 'cod'
      ? 'cod'
      : orderInput.payment_method === 'whatsapp'
        ? 'whatsapp'
        : 'unknown'
  );

  const newOrder: Order = {
    ...orderInput,
    id: `local-ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    order_number: orderNumber,
    payment_env: resolvedEnv,
    created_at: now,
    updated_at: now,
  };

  // Always save locally first as reliable backup
  saveLocalOrder(newOrder);

  if (!isSupabaseConfigured() || !supabase) {
    return { success: true, order: newOrder, error: null };
  }

  try {
    const payload = {
      order_number: newOrder.order_number,
      customer_name: newOrder.customer_name.trim(),
      customer_phone: newOrder.customer_phone.trim(),
      shipping_address: newOrder.shipping_address.trim(),
      city: newOrder.city.trim(),
      state: newOrder.state.trim() || 'Gujarat',
      pincode: newOrder.pincode.trim(),
      notes: newOrder.notes?.trim() || '',
      items: newOrder.items,
      subtotal: newOrder.subtotal,
      shipping_fee: newOrder.shipping_fee,
      total: newOrder.total,
      payment_method: newOrder.payment_method,
      payment_status: newOrder.payment_status,
      payment_env: newOrder.payment_env,
      order_status: newOrder.order_status,
      razorpay_order_id: newOrder.razorpay_order_id || null,
      razorpay_payment_id: newOrder.razorpay_payment_id || null,
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([payload])
      .select('id, order_number, created_at')
      .maybeSingle();

    if (error) {
      console.warn('Supabase order insert notice (saved in local backup):', error.message);
      return { success: true, order: newOrder, error: null };
    }

    if (data) {
      const persistedOrder: Order = {
        ...newOrder,
        id: data.id,
        created_at: data.created_at || now,
      };
      saveLocalOrder(persistedOrder);
      return { success: true, order: persistedOrder, error: null };
    }

    return { success: true, order: newOrder, error: null };
  } catch (err: any) {
    console.error('Order creation error:', err);
    return { success: true, order: newOrder, error: null };
  }
};

/**
 * Fetch all customer orders for Admin dashboard review.
 * Returns Supabase orders when available, and includes local offline backups.
 */
export const fetchAllOrdersForAdmin = async (): Promise<{ orders: Order[]; error: string | null }> => {
  const localOrders = getLocalOrders();

  if (!isSupabaseConfigured() || !supabase) {
    return { orders: localOrders, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      const isMissingTable = error.code === 'PGRST205' || error.message.includes('schema cache');
      const errNote = isMissingTable
        ? "Could not find the table 'public.orders' in the schema cache. Please execute the SQL migration in Supabase SQL Editor. Showing local offline orders."
        : error.message;

      return { orders: localOrders, error: errNote };
    }

    const dbOrders: Order[] = (data || []).map((row: any) => ({
      id: row.id,
      order_number: row.order_number,
      customer_name: row.customer_name,
      customer_phone: row.customer_phone,
      shipping_address: row.shipping_address,
      city: row.city,
      state: row.state,
      pincode: row.pincode,
      notes: row.notes,
      items: Array.isArray(row.items) ? row.items : [],
      subtotal: Number(row.subtotal),
      shipping_fee: Number(row.shipping_fee || 0),
      total: Number(row.total),
      payment_method: row.payment_method,
      payment_status: row.payment_status,
      payment_env: row.payment_env || (row.payment_method === 'cod' ? 'cod' : row.payment_method === 'whatsapp' ? 'whatsapp' : 'unknown'),
      order_status: row.order_status,
      razorpay_order_id: row.razorpay_order_id,
      razorpay_payment_id: row.razorpay_payment_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    // Merge any missing local orders that haven't been pushed to Supabase yet
    const dbOrderNumbers = new Set(dbOrders.map((o) => o.order_number));
    const missingLocal = localOrders.filter((l) => !dbOrderNumbers.has(l.order_number));

    return { orders: [...dbOrders, ...missingLocal], error: null };
  } catch (err: any) {
    return { orders: localOrders, error: err.message || null };
  }
};

/**
 * Update order fulfillment status (Admin).
 * Updates local storage immediately and syncs with Supabase database.
 * Dual-lookup: uses UUID if valid, or order_number to prevent UUID cast failures.
 */
export const updateOrderStatus = async (
  orderIdOrNumber: string,
  newStatus: OrderStatus
): Promise<{ error: string | null }> => {
  const local = getLocalOrders();
  const target = local.find((o) => o.id === orderIdOrNumber || o.order_number === orderIdOrNumber);

  // Update local storage first
  try {
    const updated = local.map((o) => {
      if (o.id === orderIdOrNumber || o.order_number === orderIdOrNumber) {
        return { ...o, order_status: newStatus, updated_at: new Date().toISOString() };
      }
      return o;
    });
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }

  if (!isSupabaseConfigured() || !supabase) return { error: null };

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderIdOrNumber);
    const lookupField = isUuid ? 'id' : 'order_number';
    const lookupValue = isUuid ? orderIdOrNumber : (target?.order_number || orderIdOrNumber);

    const { data, error } = await supabase
      .from('orders')
      .update({ order_status: newStatus, updated_at: new Date().toISOString() })
      .eq(lookupField, lookupValue)
      .select('id, order_number, order_status');

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        return {
          error: "Could not find the table 'public.orders' in the schema cache. Please execute the SQL migration in Supabase SQL Editor. (Local order status updated).",
        };
      }
      return { error: error.message };
    }

    // If 0 rows were updated remotely (order was created while orders table was missing)
    if (!data || data.length === 0) {
      if (target) {
        // Automatically sync the unpersisted local order to Supabase
        const { error: insertErr } = await supabase.from('orders').insert([{
          order_number: target.order_number,
          customer_name: target.customer_name,
          customer_phone: target.customer_phone,
          shipping_address: target.shipping_address,
          city: target.city,
          state: target.state,
          pincode: target.pincode,
          notes: target.notes || '',
          items: target.items,
          subtotal: target.subtotal,
          shipping_fee: target.shipping_fee,
          total: target.total,
          payment_method: target.payment_method,
          payment_status: target.payment_status,
          payment_env: target.payment_env || 'unknown',
          order_status: newStatus,
          razorpay_order_id: target.razorpay_order_id || null,
          razorpay_payment_id: target.razorpay_payment_id || null,
        }]);

        if (insertErr && insertErr.code !== 'PGRST205') {
          console.warn('Could not sync local order to Supabase:', insertErr.message);
        }
      }
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Failed to update order status in database.' };
  }
};

/**
 * Update payment status (Admin)
 */
export const updatePaymentStatus = async (
  orderIdOrNumber: string,
  newPaymentStatus: PaymentStatus
): Promise<{ error: string | null }> => {
  const local = getLocalOrders();
  const target = local.find((o) => o.id === orderIdOrNumber || o.order_number === orderIdOrNumber);

  try {
    const updated = local.map((o) => {
      if (o.id === orderIdOrNumber || o.order_number === orderIdOrNumber) {
        return { ...o, payment_status: newPaymentStatus, updated_at: new Date().toISOString() };
      }
      return o;
    });
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }

  if (!isSupabaseConfigured() || !supabase) return { error: null };

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderIdOrNumber);
    const lookupField = isUuid ? 'id' : 'order_number';
    const lookupValue = isUuid ? orderIdOrNumber : (target?.order_number || orderIdOrNumber);

    const { error } = await supabase
      .from('orders')
      .update({ payment_status: newPaymentStatus, updated_at: new Date().toISOString() })
      .eq(lookupField, lookupValue);

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        return {
          error: "Could not find the table 'public.orders' in the schema cache. Please execute the SQL migration in Supabase SQL Editor.",
        };
      }
      return { error: error.message };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
};
