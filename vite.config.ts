import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

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

function generateOrderNumber(): string {
  const timeCode = Date.now().toString(36).toUpperCase().slice(-4);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `VI-${timeCode}-${randomSuffix}`;
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'razorpay-dev-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const url = req.url ? req.url.split('?')[0] : '';

            // 1. Order Creation Endpoint
            if (url === '/api/create-order' || url === '/api/create-razorpay-order') {
              if (req.method !== 'POST') {
                res.statusCode = 405;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Method Not Allowed' }));
                return;
              }

              const currentEnv = loadEnv(mode, process.cwd(), '');
              const keyId = (currentEnv.RAZORPAY_KEY_ID || currentEnv.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '').trim();
              const keySecret = (currentEnv.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || '').trim();

              if (!keyId || !keySecret) {
                res.statusCode = 503;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    error: 'Online payments are temporarily unavailable. Razorpay credentials are not configured in .env.',
                    code: 'GATEWAY_CREDENTIALS_MISSING',
                  })
                );
                return;
              }

              const paymentEnv: 'test' | 'live' | 'unknown' = keyId.startsWith('rzp_test_')
                ? 'test'
                : keyId.startsWith('rzp_live_')
                  ? 'live'
                  : 'unknown';

              const isTestMode = paymentEnv === 'test';
              const isLiveMode = paymentEnv === 'live';

              let bodyRaw = '';
              req.on('data', (chunk) => {
                bodyRaw += chunk;
              });
              req.on('end', async () => {
                try {
                  const body = bodyRaw ? JSON.parse(bodyRaw) : {};
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

                  // 1a. Diagnostic ping handling: disabled in live mode
                  if (is_test_ping) {
                    if (isLiveMode) {
                      res.statusCode = 403;
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({
                        error: 'Diagnostic test pings are strictly disabled in live production mode.',
                        code: 'DIAGNOSTIC_DISABLED_IN_PROD',
                      }));
                      return;
                    }

                    const testOrder = await razorpay.orders.create({
                      amount: 100,
                      currency: 'INR',
                      receipt: `diag_${Date.now()}`,
                      notes: { source: 'admin_diagnostic_ping', payment_env: paymentEnv },
                    });

                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      success: true,
                      order_id: testOrder.id,
                      amount: testOrder.amount,
                      currency: testOrder.currency,
                      key_id: keyId,
                      payment_env: paymentEnv,
                      is_diagnostic: true,
                    }));
                    return;
                  }

                  if (payment_method && payment_method !== 'razorpay') {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Invalid payment method for online payment gateway.', code: 'INVALID_PAYMENT_METHOD' }));
                    return;
                  }

                  if (!Array.isArray(items) || items.length === 0) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Order must contain at least one item.', code: 'EMPTY_ORDER' }));
                    return;
                  }

                  // 1b. Preliminary items validation: reject live demo items & validate quantity (Fix 1)
                  for (const item of items) {
                    const pid = String(item?.product_id || '').trim();
                    const pcode = String(item?.product_code || '').trim();

                    if (!pid) {
                      res.statusCode = 400;
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({ error: 'Missing product ID in order items.', code: 'INVALID_PRODUCT_ID' }));
                      return;
                    }

                    const qty = Number(item.quantity);
                    if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
                      res.statusCode = 400;
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({ error: `Invalid quantity (${item.quantity}) for item. Must be an integer between 1 and 50.`, code: 'INVALID_QUANTITY' }));
                      return;
                    }

                    const isDemoItem =
                      pid.startsWith('sample-') ||
                      pcode.startsWith('SAMPLE-') ||
                      Boolean(SAMPLE_CATALOGUE[pid]) ||
                      Boolean(SAMPLE_CATALOGUE[pcode]);

                    if (isLiveMode && isDemoItem) {
                      res.statusCode = 400;
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({
                        error: 'Demo sample products cannot be purchased in live checkout mode.',
                        code: 'DEMO_PRODUCT_NOT_FOR_SALE',
                      }));
                      return;
                    }
                  }

                  // 1c. Trusted Price Resolution from Database & Catalogue (Fix 1)
                  const supabaseUrl = (currentEnv.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
                  const serviceRoleKey = (currentEnv.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
                  const supabaseKey = serviceRoleKey || (currentEnv.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();

                  if (!supabaseUrl || !supabaseKey) {
                    res.statusCode = 503;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      error: isLiveMode
                        ? 'Live store catalogue is temporarily unavailable. Database configuration is missing.'
                        : 'Database connection configuration is missing on server. Cannot initialize order.',
                      code: isLiveMode ? 'CATALOGUE_UNAVAILABLE' : 'DATABASE_CONFIG_MISSING',
                    }));
                    return;
                  }

                  let dbProductMap = new Map<string, { id: string; name: string; code: string; price: number; in_stock: boolean }>();

                  try {
                    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
                    const productIds = items.map((i: any) => String(i.product_id || '').trim()).filter(Boolean);
                    if (productIds.length > 0) {
                      const { data: dbRows, error: dbErr } = await supabase
                        .from('products')
                        .select('id, code, name, selling_price, in_stock')
                        .in('id', productIds);

                      if (dbErr && isLiveMode) {
                        res.statusCode = 503;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({
                          error: `Failed to query live store catalogue: ${dbErr.message}`,
                          code: 'CATALOGUE_QUERY_FAILED',
                        }));
                        return;
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
                      res.statusCode = 503;
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({
                        error: `Live store catalogue error: ${err?.message || 'Database error'}`,
                        code: 'CATALOGUE_ERROR',
                      }));
                      return;
                    }
                    console.warn('Database catalogue query notice:', err?.message);
                  }

                  let calculatedSubtotal = 0;
                  const verifiedItems: any[] = [];

                  for (const item of items) {
                    const pid = String(item.product_id || '').trim();
                    const pcode = String(item.product_code || '').trim();
                    const qty = Number(item.quantity);

                    let trustedPrice: number | null = null;
                    let trustedName = '';
                    let trustedCode = '';

                    if (dbProductMap.has(pid)) {
                      const p = dbProductMap.get(pid)!;
                      if (!p.in_stock) {
                        res.statusCode = 400;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: `Product "${p.name}" is currently out of stock.`, code: 'PRODUCT_OUT_OF_STOCK' }));
                        return;
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

                    if (trustedPrice === null || isNaN(trustedPrice) || trustedPrice <= 0) {
                      res.statusCode = 400;
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({ error: `Product (ID: ${pid}) could not be verified in the store catalogue. Order cannot proceed.`, code: 'UNVERIFIED_PRODUCT_PRICE' }));
                      return;
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

                  const calculatedShipping = 0;
                  const calculatedTotal = calculatedSubtotal + calculatedShipping;
                  const amountInPaise = Math.round(calculatedTotal * 100);

                  if (amountInPaise < 100 || amountInPaise > 50000000) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Order total is outside allowed transaction limits.', code: 'INVALID_AMOUNT_LIMIT' }));
                    return;
                  }

                  const orderNumber = generateOrderNumber();
                  const orderReceipt = receipt || `rcpt_${orderNumber}`;

                  const order = await razorpay.orders.create({
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

                  // Bind and persist pending order in Supabase
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
                      razorpay_order_id: order.id,
                    },
                  ]);

                  if (insertErr) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      error: `Failed to initialize pending order in database: ${insertErr.message}. Payment session cannot proceed.`,
                      code: 'ORDER_INITIALIZATION_FAILED',
                    }));
                    return;
                  }

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      success: true,
                      order_id: order.id,
                      orderId: order.id,
                      amount: order.amount,
                      currency: order.currency,
                      key_id: keyId,
                      keyId: keyId,
                      order_number: orderNumber,
                      payment_env: paymentEnv,
                    })
                  );
                } catch (err: any) {
                  const statusCode = err?.statusCode || err?.status || 500;
                  const errDesc = err?.error?.description || err?.message || '';

                  if (statusCode === 401 || errDesc.toLowerCase().includes('authentication failed')) {
                    res.statusCode = 401;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(
                      JSON.stringify({
                        error: 'Payment gateway authentication failed. Please check configured credentials in your .env file.',
                        code: 'RAZORPAY_AUTHENTICATION_FAILED',
                      })
                    );
                    return;
                  }

                  res.statusCode = statusCode >= 400 && statusCode < 600 ? statusCode : 502;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      error: errDesc || 'Unable to initiate online payment session with gateway.',
                      code: err?.error?.code || 'GATEWAY_API_ERROR',
                    })
                  );
                }
              });
              return;
            }

            // 2. Payment Signature Verification Endpoint
            if (url === '/api/verify-payment' || url === '/api/verify-razorpay-payment') {
              if (req.method !== 'POST') {
                res.statusCode = 405;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Method Not Allowed' }));
                return;
              }

              const currentEnv = loadEnv(mode, process.cwd(), '');
              const keySecret = (currentEnv.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || '').trim();
              const keyId = (currentEnv.RAZORPAY_KEY_ID || currentEnv.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '').trim();

              if (!keySecret) {
                res.statusCode = 503;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: false,
                    verified: false,
                    error: 'Online payments are temporarily unavailable. Gateway secret key is not configured in .env.',
                    code: 'AUTH_SECRET_MISSING',
                  })
                );
                return;
              }

              const paymentEnv: 'test' | 'live' | 'unknown' = keyId.startsWith('rzp_test_')
                ? 'test'
                : keyId.startsWith('rzp_live_')
                  ? 'live'
                  : 'unknown';

              let bodyRaw = '';
              req.on('data', (chunk) => {
                bodyRaw += chunk;
              });
              req.on('end', async () => {
                try {
                  const body = bodyRaw ? JSON.parse(bodyRaw) : {};
                  const order_id = (body.order_id || body.razorpay_order_id || '').trim();
                  const payment_id = (body.payment_id || body.razorpay_payment_id || '').trim();
                  const signature = (body.signature || body.razorpay_signature || '').trim();
                  const order_number = (body.order_number || '').trim();

                  if (!order_id || !payment_id || !signature || !order_number) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(
                      JSON.stringify({
                        success: false,
                        verified: false,
                        error: 'Missing required parameters. Required: order_id, payment_id, signature, order_number.',
                        code: 'MISSING_FIELDS',
                      })
                    );
                    return;
                  }

                  // 2a. Cryptographic HMAC Verification
                  const expected = crypto
                    .createHmac('sha256', keySecret)
                    .update(`${order_id}|${payment_id}`)
                    .digest('hex');

                  const isMatch =
                    expected.length === signature.length &&
                    crypto.timingSafeEqual(
                      Buffer.from(expected, 'utf-8'),
                      Buffer.from(signature, 'utf-8')
                    );

                  if (!isMatch) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(
                      JSON.stringify({
                        success: false,
                        verified: false,
                        error: 'Payment signature verification failed. Cryptographic signature mismatch.',
                        code: 'SIGNATURE_MISMATCH',
                      })
                    );
                    return;
                  }

                  // 2b. Fail-closed Razorpay Server API Verification (No fallbacks)
                  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
                  let rzpPayment: any;
                  try {
                    rzpPayment = await razorpay.payments.fetch(payment_id);
                  } catch (pErr: any) {
                    res.statusCode = 502;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      success: false,
                      verified: false,
                      error: 'Failed to fetch payment details from Razorpay: ' + (pErr?.error?.description || pErr?.message || 'Gateway communication error'),
                      code: 'PAYMENT_FETCH_FAILED',
                    }));
                    return;
                  }

                  let rzpOrder: any;
                  try {
                    rzpOrder = await razorpay.orders.fetch(order_id);
                  } catch (oErr: any) {
                    res.statusCode = 502;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      success: false,
                      verified: false,
                      error: 'Failed to fetch order details from Razorpay: ' + (oErr?.error?.description || oErr?.message || 'Gateway communication error'),
                      code: 'ORDER_FETCH_FAILED',
                    }));
                    return;
                  }

                  if (rzpPayment.order_id !== order_id) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      success: false,
                      verified: false,
                      error: 'Payment does not belong to expected Razorpay order.',
                      code: 'ORDER_MISMATCH',
                    }));
                    return;
                  }

                  if (rzpPayment.currency !== 'INR' || rzpOrder.currency !== 'INR') {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      success: false,
                      verified: false,
                      error: 'Unexpected currency. Only INR payments are accepted.',
                      code: 'CURRENCY_MISMATCH',
                    }));
                    return;
                  }

                  if (rzpPayment.amount !== rzpOrder.amount) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      success: false,
                      verified: false,
                      error: 'Payment amount does not match gateway order amount.',
                      code: 'AMOUNT_MISMATCH',
                    }));
                    return;
                  }

                  // If authorized, capture using Razorpay SDK
                  if (rzpPayment.status === 'authorized') {
                    try {
                      rzpPayment = await razorpay.payments.capture(payment_id, rzpOrder.amount, 'INR');
                    } catch (capErr: any) {
                      res.statusCode = 502;
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({
                        success: false,
                        verified: false,
                        error: 'Payment capture failed: ' + (capErr?.error?.description || capErr?.message || 'Gateway capture error'),
                        code: 'PAYMENT_CAPTURE_FAILED',
                      }));
                      return;
                    }
                  }

                  // Never accept authorized alone; assert captured
                  if (rzpPayment.status !== 'captured') {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      success: false,
                      verified: false,
                      error: `Payment status is '${rzpPayment.status}'. Expected 'captured' to confirm order.`,
                      code: 'PAYMENT_NOT_CAPTURED',
                    }));
                    return;
                  }

                  // 2c. Bind Payment to Database Order (Exact match by order_id AND order_number)
                  // Server-side confirmation MUST require SUPABASE_SERVICE_ROLE_KEY.
                  const supabaseUrl = (currentEnv.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
                  const serviceRoleKey = (currentEnv.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

                  if (!supabaseUrl || !serviceRoleKey) {
                    res.statusCode = 503;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      success: false,
                      verified: false,
                      error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is required for privileged order confirmation.',
                      code: 'SERVICE_ROLE_KEY_REQUIRED',
                    }));
                    return;
                  }

                  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

                  const { data: dbOrder, error: queryErr } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('razorpay_order_id', order_id)
                    .eq('order_number', order_number)
                    .maybeSingle();

                  if (queryErr) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      success: false,
                      verified: false,
                      error: `Failed to query pending database order: ${queryErr.message}`,
                      code: 'DATABASE_QUERY_ERROR',
                    }));
                    return;
                  }

                  if (!dbOrder) {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      success: false,
                      verified: false,
                      error: 'No database order matches the given Razorpay order ID and order number together.',
                      code: 'ORDER_NOT_FOUND',
                    }));
                    return;
                  }

                  // Idempotency check
                  if (dbOrder.payment_status === 'verified') {
                    if (dbOrder.razorpay_payment_id === payment_id) {
                      res.statusCode = 200;
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({
                        success: true,
                        verified: true,
                        is_duplicate: true,
                        message: 'Payment already verified and order confirmed.',
                        order: dbOrder,
                        order_number: dbOrder.order_number,
                        payment_env: dbOrder.payment_env || paymentEnv,
                      }));
                      return;
                    } else {
                      res.statusCode = 409;
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({
                        success: false,
                        verified: false,
                        error: 'This order has already been verified under another payment transaction.',
                        code: 'ORDER_ALREADY_PAID',
                      }));
                      return;
                    }
                  }

                  // Duplicate payment ID check across any other order
                  const { data: conflictingOrder } = await supabase
                    .from('orders')
                    .select('order_number')
                    .eq('razorpay_payment_id', payment_id)
                    .neq('order_number', order_number)
                    .maybeSingle();

                  if (conflictingOrder) {
                    res.statusCode = 409;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      success: false,
                      verified: false,
                      error: 'This payment transaction ID has already been credited to another order.',
                      code: 'DUPLICATE_PAYMENT_REUSED',
                    }));
                    return;
                  }

                  // Amount match with database total
                  const expectedDbPaise = Math.round(Number(dbOrder.total) * 100);
                  if (rzpPayment.amount !== expectedDbPaise) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      success: false,
                      verified: false,
                      error: `Paid amount (₹${(rzpPayment.amount / 100).toFixed(2)}) does not match database order total (₹${Number(dbOrder.total).toFixed(2)}).`,
                      code: 'AMOUNT_MISMATCH',
                    }));
                    return;
                  }

                  // 2d. Reliable Database Persistence via restricted confirm_verified_order RPC
                  const { data: rpcRes, error: rpcErr } = await supabase.rpc('confirm_verified_order', {
                    p_order_number: order_number,
                    p_razorpay_order_id: order_id,
                    p_razorpay_payment_id: payment_id,
                    p_payment_env: paymentEnv,
                  });

                  if (rpcErr) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    if (rpcErr.code === 'PGRST202' || rpcErr.message?.includes('confirm_verified_order')) {
                      res.end(JSON.stringify({
                        success: false,
                        verified: false,
                        error: 'Database migration pending: confirm_verified_order RPC is not installed in Supabase. Please apply supabase-orders-migration.sql in the Supabase SQL editor.',
                        code: 'DATABASE_MIGRATION_PENDING',
                      }));
                    } else {
                      res.end(JSON.stringify({
                        success: false,
                        verified: false,
                        error: `Database confirmation failed: ${rpcErr.message}`,
                        code: 'ORDER_CONFIRMATION_FAILED',
                      }));
                    }
                    return;
                  }

                  if (!rpcRes || !rpcRes.success) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      success: false,
                      verified: false,
                      error: rpcRes?.error || 'Database order confirmation was rejected.',
                      code: rpcRes?.code || 'ORDER_CONFIRMATION_REJECTED',
                    }));
                    return;
                  }

                  const { data: updatedOrder, error: fetchErr } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('order_number', order_number)
                    .single();

                  if (fetchErr || !updatedOrder) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      success: false,
                      verified: false,
                      error: 'Payment was captured, but the confirmed order record could not be re-fetched from database.',
                      code: 'ORDER_FETCH_FAILED',
                    }));
                    return;
                  }

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      success: true,
                      verified: true,
                      message: 'Payment verified and order confirmed successfully.',
                      order: updatedOrder,
                      order_number: updatedOrder.order_number,
                      payment_env: paymentEnv,
                    })
                  );
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      success: false,
                      verified: false,
                      error: err?.message || 'Internal server error while verifying payment signature.',
                      code: 'VERIFY_EXCEPTION',
                    })
                  );
                }
              });
              return;
            }

            next();
          });
        },
      },
    ],
  };
});
