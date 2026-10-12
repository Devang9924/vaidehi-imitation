import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import Razorpay from 'razorpay';
import crypto from 'crypto';

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

              // Always read latest .env values dynamically
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

              let bodyRaw = '';
              req.on('data', (chunk) => {
                bodyRaw += chunk;
              });
              req.on('end', async () => {
                try {
                  const body = bodyRaw ? JSON.parse(bodyRaw) : {};
                  const { amount, amount_in_paise, currency = 'INR', receipt, notes, is_test_ping } = body;

                  let amountInPaise: number;
                  if (amount_in_paise !== undefined && amount_in_paise !== null) {
                    amountInPaise = Math.round(Number(amount_in_paise));
                  } else if (body.is_paise) {
                    amountInPaise = Math.round(Number(amount));
                  } else {
                    amountInPaise = Math.round(Number(amount) * 100);
                  }

                  if (!amountInPaise || isNaN(amountInPaise) || amountInPaise < 100) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(
                      JSON.stringify({
                        error: 'Invalid order amount. Minimum order amount is 100 paise (₹1.00).',
                        code: 'INVALID_AMOUNT',
                      })
                    );
                    return;
                  }

                  const razorpay = new Razorpay({
                    key_id: keyId,
                    key_secret: keySecret,
                  });

                  const order = await razorpay.orders.create({
                    amount: amountInPaise,
                    currency,
                    receipt: receipt || `rcpt_${Date.now()}`,
                    notes: {
                      ...(notes || {}),
                      source: is_test_ping ? 'admin_diagnostic_ping' : 'vaidehi_checkout',
                      payment_env: paymentEnv,
                    },
                  });

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
                      payment_env: paymentEnv,
                    })
                  );
                } catch (err: any) {
                  const statusCode = err?.statusCode || err?.status || 500;
                  const errDesc = err?.error?.description || err?.message || '';

                  // Handle Razorpay Authentication Failed specifically
                  if (statusCode === 401 || errDesc.toLowerCase().includes('authentication failed')) {
                    res.statusCode = 401;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(
                      JSON.stringify({
                        error: 'Payment gateway authentication failed. The configured RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET do not match an active key pair in your Razorpay Dashboard.',
                        code: 'RAZORPAY_AUTHENTICATION_FAILED',
                        hint: 'Please generate a new API Key pair in Razorpay Dashboard (Account & Settings -> API Keys) and update your .env file.',
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
              req.on('end', () => {
                try {
                  const body = bodyRaw ? JSON.parse(bodyRaw) : {};
                  const order_id = (body.order_id || body.razorpay_order_id || '').trim();
                  const payment_id = (body.payment_id || body.razorpay_payment_id || '').trim();
                  const signature = (body.signature || body.razorpay_signature || '').trim();

                  if (!order_id || !payment_id || !signature) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(
                      JSON.stringify({
                        success: false,
                        verified: false,
                        error: 'Missing required parameters. Required: order_id, payment_id, signature.',
                        code: 'MISSING_FIELDS',
                      })
                    );
                    return;
                  }

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
                        error: 'Payment signature verification failed. Signature mismatch.',
                        code: 'SIGNATURE_MISMATCH',
                      })
                    );
                    return;
                  }

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      success: true,
                      verified: true,
                      message: 'Payment verified successfully',
                      order_id,
                      payment_id,
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
                      error: err?.message || 'Internal server error while verifying payment signature',
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
