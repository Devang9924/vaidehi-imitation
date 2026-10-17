export interface CheckoutCustomerDraft {
  fullName: string;
  mobileNumber: string;
  address: string;
  city: string;
  stateName: string;
  pincode: string;
  notes: string;
  paymentMethod: 'razorpay' | 'cod' | '';
  savedAt?: number;
}

export interface CheckoutErrorInfo {
  message: string;
  code?: string;
  paymentMethod?: 'razorpay' | 'cod' | '';
  suggestCod?: boolean;
  timestamp: number;
}

const CHECKOUT_DRAFT_KEY = 'vaidehi_checkout_draft_v1';
const CHECKOUT_ERROR_KEY = 'vaidehi_checkout_error_v1';

export const saveCheckoutDraft = (draft: CheckoutCustomerDraft): void => {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify({ ...draft, savedAt: Date.now() });
    sessionStorage.setItem(CHECKOUT_DRAFT_KEY, payload);
  } catch {
    try {
      localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify({ ...draft, savedAt: Date.now() }));
    } catch {
      // Ignore storage quota
    }
  }
};

export const getCheckoutDraft = (): CheckoutCustomerDraft | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CHECKOUT_DRAFT_KEY) || localStorage.getItem(CHECKOUT_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearCheckoutDraft = (): void => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
    localStorage.removeItem(CHECKOUT_DRAFT_KEY);
  } catch {
    // Ignore
  }
};

export const saveCheckoutError = (error: CheckoutErrorInfo): void => {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify(error);
    sessionStorage.setItem(CHECKOUT_ERROR_KEY, payload);
  } catch {
    try {
      localStorage.setItem(CHECKOUT_ERROR_KEY, JSON.stringify(error));
    } catch {
      // Ignore
    }
  }
};

export const getCheckoutError = (): CheckoutErrorInfo | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CHECKOUT_ERROR_KEY) || localStorage.getItem(CHECKOUT_ERROR_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearCheckoutError = (): void => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(CHECKOUT_ERROR_KEY);
    localStorage.removeItem(CHECKOUT_ERROR_KEY);
  } catch {
    // Ignore
  }
};
