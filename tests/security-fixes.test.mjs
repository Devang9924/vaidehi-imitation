import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { EventEmitter } from 'node:events';
import Razorpay from 'razorpay';
import { SupabaseClient } from '@supabase/supabase-js';
import createOrderHandler from '../api/create-order.ts';
import verifyPaymentHandler from '../api/verify-payment.ts';

// Helper to create mock request and response
function createMockReqRes(options = {}) {
  const req = new EventEmitter();
  req.method = options.method || 'POST';
  req.headers = options.headers || {};
  req.body = options.body !== undefined ? options.body : null;

  let statusCode = 200;
  const headers = {};
  let responseData = null;

  const res = {
    setHeader(name, value) {
      headers[name] = value;
      return res;
    },
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      responseData = data;
      return res;
    },
    send(data) {
      responseData = data;
      return res;
    },
    end() {
      return res;
    },
    get statusCode() {
      return statusCode;
    },
    get _json() {
      return responseData;
    },
  };

  return { req, res };
}

describe('Vaidehi Imitation - Security Fixes Comprehensive Test Suite', () => {
  const originalEnv = { ...process.env };
  const origFrom = SupabaseClient.prototype.from;
  const origRpc = SupabaseClient.prototype.rpc;
  const origAddResources = Razorpay.prototype.addResources;

  let mockRazorpayPaymentsFetch = null;
  let mockRazorpayPaymentsCapture = null;
  let mockRazorpayOrdersFetch = null;
  let mockRazorpayOrdersCreate = null;

  // Intercept Razorpay instance resource methods
  Razorpay.prototype.addResources = function () {
    origAddResources.call(this);
    if (mockRazorpayPaymentsFetch) this.payments.fetch = mockRazorpayPaymentsFetch;
    if (mockRazorpayPaymentsCapture) this.payments.capture = mockRazorpayPaymentsCapture;
    if (mockRazorpayOrdersFetch) this.orders.fetch = mockRazorpayOrdersFetch;
    if (mockRazorpayOrdersCreate) this.orders.create = mockRazorpayOrdersCreate;
  };

  beforeEach(() => {
    process.env = { ...originalEnv };
    mockRazorpayPaymentsFetch = null;
    mockRazorpayPaymentsCapture = null;
    mockRazorpayOrdersFetch = null;
    mockRazorpayOrdersCreate = null;
  });

  beforeEach(() => {
    process.env = { ...originalEnv };
    mockRazorpayPaymentsFetch = null;
    mockRazorpayPaymentsCapture = null;
    mockRazorpayOrdersFetch = null;
    mockRazorpayOrdersCreate = null;
    SupabaseClient.prototype.from = origFrom;
    SupabaseClient.prototype.rpc = origRpc;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    mockRazorpayPaymentsFetch = null;
    mockRazorpayPaymentsCapture = null;
    mockRazorpayOrdersFetch = null;
    mockRazorpayOrdersCreate = null;
    SupabaseClient.prototype.from = origFrom;
    SupabaseClient.prototype.rpc = origRpc;
  });

  // =============================================================================
  // 1. LIVE DEMO-PRODUCT REJECTION
  // =============================================================================
  it('Vector 1: Live mode strictly rejects demo sample products', async () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_live_secret123';
    process.env.RAZORPAY_KEY_SECRET = 'live_secret_456';
    process.env.SUPABASE_URL = 'https://fake-project.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'fake_service_role_key';

    const { req, res } = createMockReqRes({
      method: 'POST',
      body: {
        items: [
          {
            product_id: 'sample-01',
            product_code: 'SAMPLE-VI-NK-01',
            quantity: 1,
          },
        ],
      },
    });

    await createOrderHandler(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res._json?.code, 'DEMO_PRODUCT_NOT_FOR_SALE');
    assert.match(res._json?.error, /Demo sample products cannot be purchased in live checkout mode/);
  });

  // =============================================================================
  // 2. MANIPULATED PRICES / SERVER RECALCULATION
  // =============================================================================
  it('Vector 2: Overrides client manipulated prices and calculates from catalogue', async () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key123';
    process.env.RAZORPAY_KEY_SECRET = 'test_secret_456';
    process.env.SUPABASE_URL = 'https://fake-project.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'fake_service_role_key';

    let interceptedOrderPayload = null;
    let interceptedDbOrder = null;

    mockRazorpayOrdersCreate = async (payload) => {
      interceptedOrderPayload = payload;
      return {
        id: 'order_test_999',
        amount: payload.amount,
        currency: 'INR',
      };
    };

    SupabaseClient.prototype.from = function (table) {
      if (table === 'orders') {
        return {
          insert: (records) => {
            interceptedDbOrder = records[0];
            return Promise.resolve({ error: null });
          },
        };
      }
      if (table === 'products') {
        return {
          select: () => ({
            in: () => Promise.resolve({ data: [], error: null }),
          }),
        };
      }
      return origFrom.call(this, table);
    };

    const { req, res } = createMockReqRes({
      method: 'POST',
      body: {
        items: [
          {
            product_id: 'sample-01', // trusted price is 2499
            unit_price: 1, // client manipulated price!
            subtotal: 2, // client manipulated subtotal!
            quantity: 2,
          },
        ],
        amount: 2, // client manipulated total!
      },
    });

    await createOrderHandler(req, res);

    assert.equal(res.statusCode, 200);
    // 2499 * 2 = 4998 INR = 499800 paise
    assert.equal(interceptedOrderPayload?.amount, 499800);
    assert.equal(interceptedDbOrder?.total, 4998);
    assert.equal(interceptedDbOrder?.items[0].unit_price, 2499);
  });

  // =============================================================================
  // 3. MISSING DATABASE CONFIGURATION
  // =============================================================================
  it('Vector 3a: Live order creation fails safely with 503 CATALOGUE_UNAVAILABLE when DB config is missing', async () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_live_key123';
    process.env.RAZORPAY_KEY_SECRET = 'live_secret_456';
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.VITE_SUPABASE_ANON_KEY;

    const { req, res } = createMockReqRes({
      method: 'POST',
      body: {
        items: [{ product_id: 'prod-abc', quantity: 1 }],
      },
    });

    await createOrderHandler(req, res);

    assert.equal(res.statusCode, 503);
    assert.equal(res._json?.code, 'CATALOGUE_UNAVAILABLE');
  });

  it('Vector 3b: Server order confirmation strictly requires SUPABASE_SERVICE_ROLE_KEY', async () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key123';
    process.env.RAZORPAY_KEY_SECRET = 'test_secret_456';
    process.env.SUPABASE_URL = 'https://fake-project.supabase.co';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_SERVICE_KEY;
    process.env.VITE_SUPABASE_ANON_KEY = 'anon_key_must_not_be_used_for_privileged_rpc';

    const orderId = 'order_test_123';
    const paymentId = 'pay_test_456';
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    mockRazorpayPaymentsFetch = async () => ({
      id: paymentId,
      order_id: orderId,
      currency: 'INR',
      amount: 10000,
      status: 'captured',
    });

    mockRazorpayOrdersFetch = async () => ({
      id: orderId,
      currency: 'INR',
      amount: 10000,
    });

    const { req, res } = createMockReqRes({
      method: 'POST',
      body: {
        order_id: orderId,
        payment_id: paymentId,
        signature: signature,
        order_number: 'VI-TEST-0001',
      },
    });

    await verifyPaymentHandler(req, res);

    assert.equal(res.statusCode, 503);
    assert.equal(res._json?.code, 'SERVICE_ROLE_KEY_REQUIRED');
  });

  // =============================================================================
  // 4. FAILED RAZORPAY ORDER LOOKUP
  // =============================================================================
  it('Vector 4: Fails closed with 502 ORDER_FETCH_FAILED when Razorpay order lookup fails', async () => {
    const secret = 'valid_test_secret_123';
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key123';
    process.env.RAZORPAY_KEY_SECRET = secret;
    process.env.SUPABASE_URL = 'https://fake-project.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service_role_key_abc';

    const orderId = 'order_test_404';
    const paymentId = 'pay_test_456';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    mockRazorpayPaymentsFetch = async () => ({
      id: paymentId,
      order_id: orderId,
      currency: 'INR',
      amount: 10000,
      status: 'captured',
    });

    mockRazorpayOrdersFetch = async () => {
      const err = new Error('The id provided does not exist');
      err.error = { description: 'The id provided does not exist', code: 'BAD_REQUEST_ERROR' };
      throw err;
    };

    const { req, res } = createMockReqRes({
      method: 'POST',
      body: {
        order_id: orderId,
        payment_id: paymentId,
        signature: signature,
        order_number: 'VI-TEST-0001',
      },
    });

    await verifyPaymentHandler(req, res);

    assert.equal(res.statusCode, 502);
    assert.equal(res._json?.code, 'ORDER_FETCH_FAILED');
  });

  // =============================================================================
  // 5. CAPTURE FAILURE
  // =============================================================================
  it('Vector 5: Fails safely with 502 PAYMENT_CAPTURE_FAILED when capture throws error', async () => {
    const secret = 'valid_test_secret_123';
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key123';
    process.env.RAZORPAY_KEY_SECRET = secret;
    process.env.SUPABASE_URL = 'https://fake-project.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service_role_key_abc';

    const orderId = 'order_test_123';
    const paymentId = 'pay_test_authorized';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    mockRazorpayPaymentsFetch = async () => ({
      id: paymentId,
      order_id: orderId,
      currency: 'INR',
      amount: 10000,
      status: 'authorized', // needs capture
    });

    mockRazorpayOrdersFetch = async () => ({
      id: orderId,
      currency: 'INR',
      amount: 10000,
    });

    mockRazorpayPaymentsCapture = async () => {
      throw new Error('Capture window expired or bank timeout');
    };

    const { req, res } = createMockReqRes({
      method: 'POST',
      body: {
        order_id: orderId,
        payment_id: paymentId,
        signature: signature,
        order_number: 'VI-TEST-0001',
      },
    });

    await verifyPaymentHandler(req, res);

    assert.equal(res.statusCode, 502);
    assert.equal(res._json?.code, 'PAYMENT_CAPTURE_FAILED');
  });

  // =============================================================================
  // 6. AUTHORIZED-BUT-NOT-CAPTURED STATUS
  // =============================================================================
  it('Vector 6: Never accepts status other than captured as proof of payment', async () => {
    const secret = 'valid_test_secret_123';
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key123';
    process.env.RAZORPAY_KEY_SECRET = secret;
    process.env.SUPABASE_URL = 'https://fake-project.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service_role_key_abc';

    const orderId = 'order_test_123';
    const paymentId = 'pay_test_failed_status';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    mockRazorpayPaymentsFetch = async () => ({
      id: paymentId,
      order_id: orderId,
      currency: 'INR',
      amount: 10000,
      status: 'pending', // Neither captured nor authorized
    });

    mockRazorpayOrdersFetch = async () => ({
      id: orderId,
      currency: 'INR',
      amount: 10000,
    });

    const { req, res } = createMockReqRes({
      method: 'POST',
      body: {
        order_id: orderId,
        payment_id: paymentId,
        signature: signature,
        order_number: 'VI-TEST-0001',
      },
    });

    await verifyPaymentHandler(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res._json?.code, 'PAYMENT_NOT_CAPTURED');
  });

  // =============================================================================
  // 7. MISMATCHED ORDER IDS
  // =============================================================================
  it('Vector 7a: Rejects with 400 ORDER_MISMATCH when payment belongs to another Razorpay order', async () => {
    const secret = 'valid_test_secret_123';
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key123';
    process.env.RAZORPAY_KEY_SECRET = secret;
    process.env.SUPABASE_URL = 'https://fake-project.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service_role_key_abc';

    const expectedOrderId = 'order_test_expected';
    const paymentId = 'pay_test_foreign';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${expectedOrderId}|${paymentId}`)
      .digest('hex');

    mockRazorpayPaymentsFetch = async () => ({
      id: paymentId,
      order_id: 'order_test_DIFFERENT_UNEXPECTED', // Mismatch!
      currency: 'INR',
      amount: 10000,
      status: 'captured',
    });

    mockRazorpayOrdersFetch = async () => ({
      id: expectedOrderId,
      currency: 'INR',
      amount: 10000,
    });

    const { req, res } = createMockReqRes({
      method: 'POST',
      body: {
        order_id: expectedOrderId,
        payment_id: paymentId,
        signature: signature,
        order_number: 'VI-TEST-0001',
      },
    });

    await verifyPaymentHandler(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res._json?.code, 'ORDER_MISMATCH');
  });

  it('Vector 7b: Rejects with 404 ORDER_NOT_FOUND when order does not match database record', async () => {
    const secret = 'valid_test_secret_123';
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key123';
    process.env.RAZORPAY_KEY_SECRET = secret;
    process.env.SUPABASE_URL = 'https://fake-project.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service_role_key_abc';

    const orderId = 'order_test_123';
    const paymentId = 'pay_test_456';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    mockRazorpayPaymentsFetch = async () => ({
      id: paymentId,
      order_id: orderId,
      currency: 'INR',
      amount: 10000,
      status: 'captured',
    });

    mockRazorpayOrdersFetch = async () => ({
      id: orderId,
      currency: 'INR',
      amount: 10000,
    });

    // Supabase query returns no matching order
    SupabaseClient.prototype.from = function () {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: null }),
            }),
          }),
        }),
      };
    };

    const { req, res } = createMockReqRes({
      method: 'POST',
      body: {
        order_id: orderId,
        payment_id: paymentId,
        signature: signature,
        order_number: 'VI-TEST-UNKNOWN',
      },
    });

    await verifyPaymentHandler(req, res);

    assert.equal(res.statusCode, 404);
    assert.equal(res._json?.code, 'ORDER_NOT_FOUND');
  });

  // =============================================================================
  // 8. DUPLICATE VERIFICATION & REUSED PAYMENT ID
  // =============================================================================
  it('Vector 8a: Idempotently returns 200 is_duplicate: true on repeat verification callback', async () => {
    const secret = 'valid_test_secret_123';
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key123';
    process.env.RAZORPAY_KEY_SECRET = secret;
    process.env.SUPABASE_URL = 'https://fake-project.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service_role_key_abc';

    const orderId = 'order_test_123';
    const paymentId = 'pay_test_already_paid';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    mockRazorpayPaymentsFetch = async () => ({
      id: paymentId,
      order_id: orderId,
      currency: 'INR',
      amount: 10000,
      status: 'captured',
    });

    mockRazorpayOrdersFetch = async () => ({
      id: orderId,
      currency: 'INR',
      amount: 10000,
    });

    const alreadyVerifiedOrder = {
      order_number: 'VI-TEST-0001',
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      payment_status: 'verified',
      order_status: 'confirmed',
      total: 100,
      payment_env: 'test',
    };

    SupabaseClient.prototype.from = function () {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: alreadyVerifiedOrder, error: null }),
            }),
          }),
        }),
      };
    };

    const { req, res } = createMockReqRes({
      method: 'POST',
      body: {
        order_id: orderId,
        payment_id: paymentId,
        signature: signature,
        order_number: 'VI-TEST-0001',
      },
    });

    await verifyPaymentHandler(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res._json?.verified, true);
    assert.equal(res._json?.is_duplicate, true);
  });

  it('Vector 8b: Rejects with 409 DUPLICATE_PAYMENT_REUSED if payment was credited to another order', async () => {
    const secret = 'valid_test_secret_123';
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key123';
    process.env.RAZORPAY_KEY_SECRET = secret;
    process.env.SUPABASE_URL = 'https://fake-project.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service_role_key_abc';

    const orderId = 'order_test_123';
    const paymentId = 'pay_test_reused';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    mockRazorpayPaymentsFetch = async () => ({
      id: paymentId,
      order_id: orderId,
      currency: 'INR',
      amount: 10000,
      status: 'captured',
    });

    mockRazorpayOrdersFetch = async () => ({
      id: orderId,
      currency: 'INR',
      amount: 10000,
    });

    const pendingOrder = {
      order_number: 'VI-TEST-0002',
      razorpay_order_id: orderId,
      payment_status: 'pending',
      order_status: 'pending',
      total: 100,
      payment_env: 'test',
    };

    SupabaseClient.prototype.from = function () {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: pendingOrder, error: null }),
            }),
            neq: () => ({
              // Conflicting order found with this payment_id!
              maybeSingle: async () => ({ data: { order_number: 'VI-TEST-OTHER-0001' }, error: null }),
            }),
          }),
        }),
      };
    };

    const { req, res } = createMockReqRes({
      method: 'POST',
      body: {
        order_id: orderId,
        payment_id: paymentId,
        signature: signature,
        order_number: 'VI-TEST-0002',
      },
    });

    await verifyPaymentHandler(req, res);

    assert.equal(res.statusCode, 409);
    assert.equal(res._json?.code, 'DUPLICATE_PAYMENT_REUSED');
  });

  // =============================================================================
  // 9. DATABASE PERSISTENCE FAILURE / MIGRATION PENDING
  // =============================================================================
  it('Vector 9: Returns 500 DATABASE_MIGRATION_PENDING when confirm_verified_order RPC is missing', async () => {
    const secret = 'valid_test_secret_123';
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key123';
    process.env.RAZORPAY_KEY_SECRET = secret;
    process.env.SUPABASE_URL = 'https://fake-project.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service_role_key_abc';

    const orderId = 'order_test_123';
    const paymentId = 'pay_test_captured';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    mockRazorpayPaymentsFetch = async () => ({
      id: paymentId,
      order_id: orderId,
      currency: 'INR',
      amount: 10000,
      status: 'captured',
    });

    mockRazorpayOrdersFetch = async () => ({
      id: orderId,
      currency: 'INR',
      amount: 10000,
    });

    const pendingOrder = {
      order_number: 'VI-TEST-0003',
      razorpay_order_id: orderId,
      payment_status: 'pending',
      order_status: 'pending',
      total: 100,
      payment_env: 'test',
    };

    SupabaseClient.prototype.from = function () {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: pendingOrder, error: null }),
            }),
            neq: () => ({
              maybeSingle: async () => ({ data: null, error: null }),
            }),
          }),
        }),
      };
    };

    // RPC returns PGRST202 (Function confirm_verified_order does not exist in schema cache)
    SupabaseClient.prototype.rpc = async function (fnName) {
      if (fnName === 'confirm_verified_order') {
        return {
          data: null,
          error: {
            code: 'PGRST202',
            message: 'Could not find the function public.confirm_verified_order in schema cache',
          },
        };
      }
      return origRpc.call(this, fnName);
    };

    const { req, res } = createMockReqRes({
      method: 'POST',
      body: {
        order_id: orderId,
        payment_id: paymentId,
        signature: signature,
        order_number: 'VI-TEST-0003',
      },
    });

    await verifyPaymentHandler(req, res);

    assert.equal(res.statusCode, 500);
    assert.equal(res._json?.code, 'DATABASE_MIGRATION_PENDING');
    assert.match(res._json?.error, /confirm_verified_order RPC is not installed in Supabase/);
  });

  // =============================================================================
  // DIAGNOSTIC PING ISOLATION
  // =============================================================================
  it('Safety: Payment diagnostic test ping cannot create real charges in live mode', async () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_live_production_key';
    process.env.RAZORPAY_KEY_SECRET = 'live_secret';

    const { req, res } = createMockReqRes({
      method: 'POST',
      body: {
        is_test_ping: true,
      },
    });

    await createOrderHandler(req, res);

    assert.equal(res.statusCode, 403);
    assert.equal(res._json?.code, 'DIAGNOSTIC_DISABLED_IN_PROD');
  });
});
