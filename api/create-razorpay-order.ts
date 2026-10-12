import type { IncomingMessage, ServerResponse } from 'http';
import Razorpay from 'razorpay';

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

  const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  // 1. Missing credentials configuration check
  if (!keyId || !keySecret) {
    return res.status(503).json({
      error: 'Online payments are temporarily unavailable. Payment gateway credentials are not configured.',
      code: 'GATEWAY_CREDENTIALS_MISSING',
    });
  }

  try {
    const body = await getRequestBody(req);
    const { amount, amount_in_paise, currency = 'INR', receipt, notes, is_test_ping } = body;

    // Determine amount in paise
    let amountInPaise: number;
    if (amount_in_paise !== undefined && amount_in_paise !== null) {
      amountInPaise = Math.round(Number(amount_in_paise));
    } else if (body.is_paise) {
      amountInPaise = Math.round(Number(amount));
    } else {
      amountInPaise = Math.round(Number(amount) * 100);
    }

    // 2. Amount validation: minimum 100 paise (₹1.00)
    if (!amountInPaise || isNaN(amountInPaise) || amountInPaise < 100) {
      return res.status(400).json({
        error: 'Invalid order amount. Minimum order amount is 100 paise (₹1.00).',
        code: 'INVALID_AMOUNT',
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const orderReceipt = receipt || `rcpt_${Math.floor(Date.now() / 1000)}_${Math.floor(Math.random() * 1000)}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currency || 'INR',
      receipt: orderReceipt,
      notes: {
        ...(notes || {}),
        source: is_test_ping ? 'admin_diagnostic_ping' : 'vaidehi_checkout',
      },
    });

    return res.status(200).json({
      success: true,
      order_id: order.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
      keyId: keyId,
    });
  } catch (err: any) {
    const statusCode = err.statusCode || err.status || 500;
    const errCode = err.error?.code || '';
    const errDesc = err.error?.description || err.message || '';

    // 3. Specific Razorpay Authentication Failed handling
    if (statusCode === 401 || errDesc.toLowerCase().includes('authentication failed')) {
      return res.status(401).json({
        error: 'Payment gateway authentication failed. The configured RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET do not match an active key pair in your Razorpay Dashboard.',
        code: 'RAZORPAY_AUTHENTICATION_FAILED',
        hint: 'Please generate a new API Key pair in Razorpay Dashboard (Account & Settings -> API Keys) and update your .env file.',
      });
    }

    // 4. Other Razorpay API errors (e.g. bad request, network failure)
    return res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 502).json({
      error: errDesc || 'Unable to initiate online payment session with gateway.',
      code: errCode || 'GATEWAY_API_ERROR',
    });
  }
}
