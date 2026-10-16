import type { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

// Trusted catalogue fallback ONLY permitted in test-only environments
const SAMPLE_CATALOGUE: Record<string, { name: string; code: string; price: number }> = {
  'sample-01': {
    name: '[DEMO SAMPLE] Royal Kundan Choker Necklace Set',
    code: 'SAMPLE-VI-NK-01',
    price: 2499,
  },
  'sample-02': {
    name: '[DEMO SAMPLE] Traditional Rajputi Lion Kada Bracelet',
    code: 'SAMPLE-VI-KD-02',
    price: 1399,
  },
};

interface StreamEmitter {
  on(event: string, listener: (...args: any[]) => void): this;
}

function isStreamEmitter(obj: any): obj is StreamEmitter {
  return obj !== null && typeof obj === 'object' && typeof obj.on === 'function';
}

async function parseRequestBody(req: VercelRequest): Promise<any> {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  }

  if (isStreamEmitter(req)) {
    return new Promise((resolve) => {
      let raw = '';
      req.on('data', (chunk: any) => {
        raw += chunk;
      });
      req.on('end', () => {
        try {
          resolve(raw ? JSON.parse(raw) : {});
        } catch {
          resolve({});
        }
      });
      req.on('error', () => {
        resolve({});
      });
    });
  }

  return {};
}

function generateOrderNumber(): string {
  const timeCode = Date.now().toString(36).toUpperCase().slice(-4);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `VI-${timeCode}-${randomSuffix}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Allow', 'POST');
    }
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  // 1. Missing credentials configuration check
  if (!keyId || !keySecret) {
    return res.status(503).json({
      error: 'Online payments are temporarily unavailable. Payment gateway credentials are not configured.',
      code: 'GATEWAY_CREDENTIALS_MISSING',
    });
  }

  const paymentEnv: 'test' | 'live' | 'unknown' = keyId.startsWith('rzp_test_')
    ? 'test'
    : keyId.startsWith('rzp_live_')
      ? 'live'
      : 'unknown';

  const isTestMode = paymentEnv === 'test';
  const isLiveMode = paymentEnv === 'live';

  try {
    const body = await parseRequestBody(req);
    const {
      receipt,
      is_test_ping = false,
      items,
      customer_name = '',
      customer_phone = '',
      shipping_address = '',
      city = '',
      state = 'Gujarat',
      pincode = '',
      notes: orderNotes = '',
      payment_method = 'razorpay',
    } = body;

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // 2. Diagnostic endpoint handling (Security Rule #6 & Fix 4)
    // - Explicitly disabled in live production mode
    // - Never creates database orders and never bypasses price validation for real checkouts
    if (is_test_ping) {
      if (isLiveMode) {
        return res.status(403).json({
          error: 'Diagnostic test pings are strictly disabled in live production mode.',
          code: 'DIAGNOSTIC_DISABLED_IN_PROD',
        });
      }

      const testOrder = await razorpay.orders.create({
        amount: 100, // ₹1.00 connection test
        currency: 'INR',
        receipt: `diag_${Date.now()}`,
        notes: {
          source: 'admin_diagnostic_ping',
          payment_env: paymentEnv,
        },
      });

      return res.status(200).json({
        success: true,
        order_id: testOrder.id,
        amount: testOrder.amount,
        currency: testOrder.currency,
        key_id: keyId,
        payment_env: paymentEnv,
        is_diagnostic: true,
      });
    }

    // 3. Validate payment method
    if (payment_method && payment_method !== 'razorpay') {
      return res.status(400).json({
        error: 'Invalid payment method for online payment gateway.',
        code: 'INVALID_PAYMENT_METHOD',
      });
    }

    // 4. Must provide items array (No untrusted amount-only bypass permitted)
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Order must contain at least one item.',
        code: 'EMPTY_ORDER',
      });
    }

    // 4a. Preliminary validation: validate items format, quantities, and reject live demo products (Fix 1)
    for (const item of items) {
      const pid = String(item?.product_id || '').trim();
      const pcode = String(item?.product_code || '').trim();

      if (!pid) {
        return res.status(400).json({
          error: 'Missing product ID in order items.',
          code: 'INVALID_PRODUCT_ID',
        });
      }

      // Quantity validation
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
        return res.status(400).json({
          error: `Invalid quantity (${item.quantity}) for item. Must be an integer between 1 and 50.`,
          code: 'INVALID_QUANTITY',
        });
      }

      // Live mode strictly rejects demo sample products
      const isDemoItem =
        pid.startsWith('sample-') ||
        pcode.startsWith('SAMPLE-') ||
        Boolean(SAMPLE_CATALOGUE[pid]) ||
        Boolean(SAMPLE_CATALOGUE[pcode]);

      if (isLiveMode && isDemoItem) {
        return res.status(400).json({
          error: 'Demo sample products cannot be purchased in live checkout mode.',
          code: 'DEMO_PRODUCT_NOT_FOR_SALE',
        });
      }
    }

    // 5. Trusted Server-Side Product Price Resolution (Security Rule #1 & Fix 1)
    // Never trust client-supplied unit_price, subtotal, shipping fee, or total.
    const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
    const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '').trim();
    const supabaseKey = serviceRoleKey || (process.env.VITE_SUPABASE_ANON_KEY || '').trim();

    // Database configuration check: mandatory for creating and recording orders
    if (!supabaseUrl || !supabaseKey) {
      return res.status(503).json({
        error: isLiveMode
          ? 'Live store catalogue is temporarily unavailable. Database configuration is missing.'
          : 'Database connection configuration is missing on server. Cannot initialize order.',
        code: isLiveMode ? 'CATALOGUE_UNAVAILABLE' : 'DATABASE_CONFIG_MISSING',
      });
    }

    let dbProductMap = new Map<string, { id: string; name: string; code: string; price: number; in_stock: boolean }>();

    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      });

      const productIds = items.map((i: any) => String(i.product_id || '').trim()).filter(Boolean);
      if (productIds.length > 0) {
        const { data: dbRows, error: dbErr } = await supabase
          .from('products')
          .select('id, code, name, selling_price, in_stock')
          .in('id', productIds);

        if (dbErr && isLiveMode) {
          return res.status(503).json({
            error: `Failed to query live store catalogue: ${dbErr.message}`,
            code: 'CATALOGUE_QUERY_FAILED',
          });
        }

        if (!dbErr && Array.isArray(dbRows)) {
          for (const row of dbRows) {
            dbProductMap.set(row.id, {
              id: row.id,
              name: row.name,
              code: row.code,
              price: Math.round(Number(row.selling_price)),
              in_stock: row.in_stock !== false,
            });
          }
        }
      }
    } catch (err: any) {
      if (isLiveMode) {
        return res.status(503).json({
          error: `Live store catalogue error: ${err?.message || 'Database error'}`,
          code: 'CATALOGUE_ERROR',
        });
      }
      console.warn('Database catalogue query notice:', err?.message);
    }

    let calculatedSubtotal = 0;
    const verifiedItems: any[] = [];

    for (const item of items) {
      const pid = String(item.product_id || '').trim();
      const pcode = String(item.product_code || '').trim();
      const qty = Number(item.quantity);

      // Resolve trusted price from database first
      let trustedPrice: number | null = null;
      let trustedName = '';
      let trustedCode = '';

      if (dbProductMap.has(pid)) {
        const p = dbProductMap.get(pid)!;
        if (!p.in_stock) {
          return res.status(400).json({
            error: `Product "${p.name}" is currently out of stock.`,
            code: 'PRODUCT_OUT_OF_STOCK',
          });
        }
        trustedPrice = p.price;
        trustedName = p.name;
        trustedCode = p.code;
      } else if (isTestMode && (SAMPLE_CATALOGUE[pid] || (pcode && SAMPLE_CATALOGUE[pcode]))) {
        // SAMPLE_CATALOGUE is permitted ONLY in an explicitly test-only flow
        const s = SAMPLE_CATALOGUE[pid] || SAMPLE_CATALOGUE[pcode];
        trustedPrice = s.price;
        trustedName = s.name;
        trustedCode = s.code;
      }

      // Fail-safe if product price cannot be verified from a trusted catalogue
      if (trustedPrice === null || isNaN(trustedPrice) || trustedPrice <= 0) {
        return res.status(400).json({
          error: `Product (ID: ${pid}) could not be verified in the store catalogue. Order cannot proceed.`,
          code: 'UNVERIFIED_PRODUCT_PRICE',
        });
      }

      const itemSubtotal = trustedPrice * qty;
      calculatedSubtotal += itemSubtotal;

      verifiedItems.push({
        product_id: pid,
        product_name: trustedName,
        product_code: trustedCode,
        product_image: item.product_image || '',
        quantity: qty,
        unit_price: trustedPrice,
        subtotal: itemSubtotal,
      });
    }

    // Enforce server shipping fee (Free delivery)
    const calculatedShipping = 0;
    const calculatedTotal = calculatedSubtotal + calculatedShipping;
    const amountInPaise = Math.round(calculatedTotal * 100);

    // Transaction limits: Min ₹1 (100 paise), Max ₹5,00,000 (50,000,000 paise)
    if (amountInPaise < 100 || amountInPaise > 50000000) {
      return res.status(400).json({
        error: 'Order total is outside allowed transaction limits.',
        code: 'INVALID_AMOUNT_LIMIT',
      });
    }

    // 6. Generate order number and create Razorpay order
    const orderNumber = generateOrderNumber();
    const orderReceipt = receipt || `rcpt_${orderNumber}`;

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderReceipt,
      notes: {
        order_number: orderNumber,
        customer_name: String(customer_name).slice(0, 40),
        customer_phone: String(customer_phone).slice(0, 15),
        source: 'vaidehi_checkout',
        payment_env: paymentEnv,
      },
    });

    // 7. Persist pending order in Supabase bound to the Razorpay order ID (Security Rule #3 & #4)
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    const { error: insertErr } = await supabase.from('orders').insert([
      {
        order_number: orderNumber,
        customer_name: String(customer_name).trim(),
        customer_phone: String(customer_phone).trim(),
        shipping_address: String(shipping_address).trim(),
        city: String(city).trim(),
        state: String(state).trim() || 'Gujarat',
        pincode: String(pincode).trim(),
        notes: String(orderNotes).trim(),
        items: verifiedItems,
        subtotal: calculatedSubtotal,
        shipping_fee: calculatedShipping,
        total: calculatedTotal,
        payment_method: 'razorpay',
        payment_status: 'pending',
        payment_env: paymentEnv,
        order_status: 'pending',
        razorpay_order_id: rzpOrder.id,
      },
    ]);

    if (insertErr) {
      return res.status(500).json({
        error: `Failed to initialize pending order in database: ${insertErr.message}. Payment session cannot proceed.`,
        code: 'ORDER_INITIALIZATION_FAILED',
      });
    }

    return res.status(200).json({
      success: true,
      order_id: rzpOrder.id,
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key_id: keyId,
      keyId: keyId,
      order_number: orderNumber,
      payment_env: paymentEnv,
    });
  } catch (err: any) {
    const statusCode = err.statusCode || err.status || 500;
    const errCode = err.error?.code || '';
    const errDesc = err.error?.description || err.message || '';

    if (statusCode === 401 || errDesc.toLowerCase().includes('authentication failed')) {
      return res.status(401).json({
        error: 'Payment gateway authentication failed. Please check configured credentials in your .env file.',
        code: 'RAZORPAY_AUTHENTICATION_FAILED',
      });
    }

    return res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 502).json({
      error: errDesc || 'Unable to initiate online payment session with gateway.',
      code: errCode || 'GATEWAY_API_ERROR',
    });
  }
}
