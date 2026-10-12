import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';

interface VercelRequest extends IncomingMessage {
  body: any;
  query: { [key: string]: string | string[] };
  method?: string;
}

interface VercelResponse extends ServerResponse {
  send: (body: any) => VercelResponse;
  json: (jsonBody: any) => VercelResponse;
  status: (statusCode: number) => VercelResponse;
}

async function getRequestBody(req: VercelRequest): Promise<any> {
  if (req.body) return req.body;
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '').trim();

  if (!keySecret) {
    return res.status(503).json({
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
    const body = await getRequestBody(req);
    const order_id = (body.order_id || body.razorpay_order_id || '').trim();
    const payment_id = (body.payment_id || body.razorpay_payment_id || '').trim();
    const signature = (body.signature || body.razorpay_signature || '').trim();

    if (!order_id || !payment_id || !signature) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Missing required parameters. Required: order_id, payment_id, signature.',
        code: 'MISSING_FIELDS',
      });
    }

    // Official Razorpay algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${order_id}|${payment_id}`)
      .digest('hex');

    // Compare generated signature with razorpay_signature
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
        error: 'Payment signature verification failed. Signature mismatch.',
        code: 'SIGNATURE_MISMATCH',
      });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Payment verified successfully',
      order_id,
      payment_id,
      payment_env: paymentEnv,
    });
  } catch {
    return res.status(500).json({
      success: false,
      verified: false,
      error: 'Internal server error while verifying payment signature',
      code: 'VERIFY_EXCEPTION',
    });
  }
}
