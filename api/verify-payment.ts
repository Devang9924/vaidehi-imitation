import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Allow', 'POST');
    }
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '').trim();

  if (!keySecret) {
    return res.status(503).json({
      success: false,
      verified: false,
      error: 'Online payments are temporarily unavailable. Gateway secret key is not configured.',
      code: 'AUTH_SECRET_MISSING',
    });
  }

  const paymentEnv: 'test' | 'live' | 'unknown' = keyId.startsWith('rzp_test_')
    ? 'test'
    : keyId.startsWith('rzp_live_')
      ? 'live'
      : 'unknown';

  try {
    const body = await parseRequestBody(req);
    const order_id = (body.order_id || body.razorpay_order_id || '').trim();
    const payment_id = (body.payment_id || body.razorpay_payment_id || '').trim();
    const signature = (body.signature || body.razorpay_signature || '').trim();
    const order_number = (body.order_number || '').trim();

    // 1. Strict required fields (Reject if any identifier is missing)
    if (!order_id || !payment_id || !signature || !order_number) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Missing required parameters. Required: order_id, payment_id, signature, order_number.',
        code: 'MISSING_FIELDS',
      });
    }

    // 2. Cryptographic HMAC Signature Verification with Server-side Secret (Security Rule #2)
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${order_id}|${payment_id}`)
      .digest('hex');

    const isSignatureValid =
      expectedSignature.length === signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(signature, 'utf-8')
      );

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Payment signature verification failed. Cryptographic signature mismatch.',
        code: 'SIGNATURE_MISMATCH',
      });
    }

    // 3. Fail-Closed Razorpay Server API Verification (Security Rule #2 & Fix 2)
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    let razorpayPayment: any;
    try {
      razorpayPayment = await razorpay.payments.fetch(payment_id);
    } catch (pErr: any) {
      return res.status(502).json({
        success: false,
        verified: false,
        error: `Failed to fetch payment details from Razorpay: ${pErr?.error?.description || pErr?.message || 'Gateway communication error'}`,
        code: 'PAYMENT_FETCH_FAILED',
      });
    }

    let razorpayOrder: any;
    try {
      razorpayOrder = await razorpay.orders.fetch(order_id);
    } catch (oErr: any) {
      return res.status(502).json({
        success: false,
        verified: false,
        error: `Failed to fetch order details from Razorpay: ${oErr?.error?.description || oErr?.message || 'Gateway communication error'}`,
        code: 'ORDER_FETCH_FAILED',
      });
    }

    // 3a. Confirm payment belongs to exact expected Razorpay order
    if (razorpayPayment.order_id !== order_id) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Payment does not belong to the expected Razorpay order.',
        code: 'ORDER_MISMATCH',
      });
    }

    // 3b. Confirm currency is strictly INR
    if (razorpayPayment.currency !== 'INR' || razorpayOrder.currency !== 'INR') {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Unexpected currency. Only INR payments are accepted.',
        code: 'CURRENCY_MISMATCH',
      });
    }

    // 3c. Confirm payment amount matches exact gateway order amount
    if (razorpayPayment.amount !== razorpayOrder.amount) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Payment amount does not match gateway order amount.',
        code: 'AMOUNT_MISMATCH',
      });
    }

    // 3d. Payment status check & auto-capture for 'authorized' status (Fix 2)
    // If payment status is authorized, capture it using the official Razorpay SDK
    if (razorpayPayment.status === 'authorized') {
      try {
        razorpayPayment = await razorpay.payments.capture(payment_id, razorpayOrder.amount, 'INR');
      } catch (capErr: any) {
        return res.status(502).json({
          success: false,
          verified: false,
          error: `Payment capture failed: ${capErr?.error?.description || capErr?.message || 'Gateway capture error'}`,
          code: 'PAYMENT_CAPTURE_FAILED',
        });
      }
    }

    // Never accept 'authorized' alone as proof of a completed payment; must be confirmed 'captured'
    if (razorpayPayment.status !== 'captured') {
      return res.status(400).json({
        success: false,
        verified: false,
        error: `Payment status is '${razorpayPayment.status}'. Expected 'captured' to confirm order.`,
        code: 'PAYMENT_NOT_CAPTURED',
      });
    }

    // 4. Safe Database Confirmation (Security Rule #3 & Fix 3)
    // Server-side confirmation MUST require SUPABASE_SERVICE_ROLE_KEY.
    // Never silently fall back to an anon key for privileged database operations.
    const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
    const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '').trim();

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(503).json({
        success: false,
        verified: false,
        error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is required for privileged order confirmation.',
        code: 'SERVICE_ROLE_KEY_REQUIRED',
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Query pending order by BOTH razorpay_order_id and order_number
    const { data: dbOrder, error: queryErr } = await supabase
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', order_id)
      .eq('order_number', order_number)
      .maybeSingle();

    if (queryErr) {
      return res.status(500).json({
        success: false,
        verified: false,
        error: `Failed to query pending database order: ${queryErr.message}`,
        code: 'DATABASE_QUERY_ERROR',
      });
    }

    if (!dbOrder) {
      return res.status(404).json({
        success: false,
        verified: false,
        error: 'No database order matches the given Razorpay order ID and order number together.',
        code: 'ORDER_NOT_FOUND',
      });
    }

    // 4a. Idempotent check: if order is already verified
    if (dbOrder.payment_status === 'verified') {
      if (dbOrder.razorpay_payment_id === payment_id) {
        return res.status(200).json({
          success: true,
          verified: true,
          is_duplicate: true,
          message: 'Payment already verified and order confirmed.',
          order: dbOrder,
          order_number: dbOrder.order_number,
          payment_env: dbOrder.payment_env || paymentEnv,
        });
      } else {
        return res.status(409).json({
          success: false,
          verified: false,
          error: 'This order has already been verified under another payment transaction.',
          code: 'ORDER_ALREADY_PAID',
        });
      }
    }

    // 4b. Ensure payment ID has not been credited to any other order (Duplicate prevention)
    const { data: conflictingOrder } = await supabase
      .from('orders')
      .select('order_number')
      .eq('razorpay_payment_id', payment_id)
      .neq('order_number', order_number)
      .maybeSingle();

    if (conflictingOrder) {
      return res.status(409).json({
        success: false,
        verified: false,
        error: 'This payment transaction ID has already been credited to another order.',
        code: 'DUPLICATE_PAYMENT_REUSED',
      });
    }

    // 4c. Verify payment amount matches database order total
    const expectedDbPaise = Math.round(Number(dbOrder.total) * 100);
    if (razorpayPayment.amount !== expectedDbPaise) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: `Paid amount (₹${(razorpayPayment.amount / 100).toFixed(2)}) does not match database order total (₹${Number(dbOrder.total).toFixed(2)}).`,
        code: 'AMOUNT_MISMATCH',
      });
    }

    // 5. Reliable Database Persistence via restricted confirm_verified_order RPC
    // Fail safely if database migration is pending or if persistence fails
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('confirm_verified_order', {
      p_order_number: order_number,
      p_razorpay_order_id: order_id,
      p_razorpay_payment_id: payment_id,
      p_payment_env: paymentEnv,
    });

    if (rpcErr) {
      if (rpcErr.code === 'PGRST202' || rpcErr.message?.includes('confirm_verified_order')) {
        return res.status(500).json({
          success: false,
          verified: false,
          error: 'Database migration pending: confirm_verified_order RPC is not installed in Supabase. Please apply supabase-orders-migration.sql in the Supabase SQL editor.',
          code: 'DATABASE_MIGRATION_PENDING',
        });
      }

      return res.status(500).json({
        success: false,
        verified: false,
        error: `Database confirmation failed: ${rpcErr.message}`,
        code: 'ORDER_CONFIRMATION_FAILED',
      });
    }

    if (!rpcRes || !rpcRes.success) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: rpcRes?.error || 'Database order confirmation was rejected.',
        code: rpcRes?.code || 'ORDER_CONFIRMATION_REJECTED',
      });
    }

    // Fetch the updated confirmed order from database
    const { data: updatedOrder, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', order_number)
      .single();

    if (fetchErr || !updatedOrder) {
      return res.status(500).json({
        success: false,
        verified: false,
        error: 'Payment was captured, but the confirmed order record could not be re-fetched from database.',
        code: 'ORDER_FETCH_FAILED',
      });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Payment verified and order confirmed successfully.',
      order: updatedOrder,
      order_number: updatedOrder.order_number,
      payment_env: paymentEnv,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      verified: false,
      error: err?.message || 'Internal server error while verifying payment signature.',
      code: 'VERIFY_EXCEPTION',
    });
  }
}
