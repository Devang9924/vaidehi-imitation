import type { Product, CustomerOrderForm } from '../types';
import { BUSINESS_DETAILS } from '../data/business';

/**
 * Format Indian Rupee currency string
 */
export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculate discount percentage safely
 */
export const getDiscountPercentage = (original: number, selling: number): number => {
  if (original <= 0 || selling >= original) return 0;
  return Math.round(((original - selling) / original) * 100);
};

/**
 * Clean phone number to WhatsApp international standard
 */
export const getWhatsAppUrl = (phone: string, text: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedText = encodeURIComponent(text);
  const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  return `https://wa.me/${fullPhone}?text=${encodedText}`;
};

/**
 * Resolve direct public image URL for a product (absolute URL for WhatsApp & sharing).
 * Uses the currently selected gallery image if supplied; otherwise falls back to the primary image.
 */
export const getProductDirectImageUrl = (
  product: Product,
  customImageUrl?: string | null
): string | null => {
  const target = (customImageUrl && customImageUrl.trim()) || product.images?.[0]?.trim();
  if (!target) return null;

  // Already a full public URL (e.g. Supabase Storage public bucket)
  if (target.startsWith('http://') || target.startsWith('https://')) {
    return target;
  }

  // Relative path (e.g. /images/sample-necklace-1.jpg) - resolve to full public URL
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://vaidehi-imitation.vercel.app';
  const cleanPath = target.startsWith('/') ? target : `/${target}`;
  return `${origin}${cleanPath}`;
};

/**
 * Resolve individual direct product page URL (e.g. https://domain.com/?product=VK120&img=2).
 * Preserves both product code and active image index.
 */
export const getIndividualProductUrl = (product: Product, imageIndex?: number): string => {
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://vaidehi-imitation.vercel.app';
  const code = encodeURIComponent(product.code.trim());
  const imgParam = typeof imageIndex === 'number' && imageIndex > 0 ? `&img=${imageIndex}` : '';
  return `${origin}/?product=${code}${imgParam}`;
};

/**
 * Generate Product Inquiry WhatsApp link using the currently selected image
 */
export const createProductInquiryUrl = (
  product: Product,
  selectedImageUrl?: string | null,
  imageIndex?: number
): string => {
  const productUrl = getIndividualProductUrl(product, imageIndex);
  const imageUrl = getProductDirectImageUrl(product, selectedImageUrl);

  const priceText = product.selling_price > 0
    ? `${formatINR(product.selling_price)}${product.original_price > product.selling_price ? ` (MRP: ${formatINR(product.original_price)})` : ''}`
    : 'Price on Inquiry';

  const message = [
    `✨ *PRODUCT INQUIRY - VAIDEHI IMITATION*`,
    `To: Akshaysinh Kher | Dhasa Junction`,
    ``,
    `Hello, I am interested in inquiring about this jewellery item:`,
    `• *Product:* ${product.name}`,
    `• *Product Code:* ${product.code}`,
    `• *Category:* ${product.category} (${product.gender})`,
    `• *Price:* ${priceText}`,
    imageUrl ? `• *Product Photo:* ${imageUrl}` : null,
    `• *Product Page:* ${productUrl}`,
    ``,
    `Could you please share availability, close-up video/photos, and delivery time to my pincode?`,
    `Thank you!`,
  ]
    .filter(Boolean)
    .join('\n');

  return getWhatsAppUrl(BUSINESS_DETAILS.whatsappPhone, message);
};

/**
 * Generate Buy Order WhatsApp link after customer completes the order form.
 * Preserves the exact selected image and all delivery information.
 */
export const createBuyOrderWhatsAppUrl = (
  product: Product,
  order: CustomerOrderForm,
  selectedImageUrl?: string | null,
  imageIndex?: number
): string => {
  const productUrl = getIndividualProductUrl(product, imageIndex);
  const imageUrl = getProductDirectImageUrl(product, selectedImageUrl);

  const priceText = product.selling_price > 0
    ? `${formatINR(product.selling_price)}${product.original_price > product.selling_price ? ` (MRP: ${formatINR(product.original_price)})` : ''}`
    : 'Price on Inquiry';

  const message = [
    `🛍️ *NEW JEWELLERY ORDER REQUEST*`,
    `*Vaidehi Imitation - Dhasa Junction*`,
    `Attn: Akshaysinh Kher`,
    ``,
    `*ITEM DETAILS:*`,
    `• *Product:* ${product.name}`,
    `• *Product Code:* ${product.code}`,
    `• *Category:* ${product.category} (${product.gender})`,
    `• *Price:* ${priceText}`,
    imageUrl ? `• *Selected Photo:* ${imageUrl}` : null,
    `• *Product Page:* ${productUrl}`,
    ``,
    `*DELIVERY & CUSTOMER DETAILS:*`,
    `• *Customer Name:* ${order.name.trim()}`,
    `• *Mobile Number:* ${order.phone.trim()}`,
    `• *Full Address:* ${order.address.trim()}`,
    `• *PIN Code:* ${order.pincode.trim()}`,
    order.city?.trim() ? `• *City / Town:* ${order.city.trim()}` : null,
    order.notes?.trim() ? `• *Special Note / Instructions:* ${order.notes.trim()}` : null,
    ``,
    `---`,
    `*ORDER NOTICE:*`,
    `I understand that online payment is not processed on the website. Please confirm availability and share payment/dispatch instructions via this WhatsApp chat.`,
  ]
    .filter(Boolean)
    .join('\n');

  return getWhatsAppUrl(BUSINESS_DETAILS.whatsappPhone, message);
};

/**
 * Generate Product Share WhatsApp link (share with contacts/family).
 * Uses the currently selected image and product page URL.
 */
export const createProductShareWhatsAppUrl = (
  product: Product,
  selectedImageUrl?: string | null,
  imageIndex?: number
): string => {
  const productUrl = getIndividualProductUrl(product, imageIndex);
  const imageUrl = getProductDirectImageUrl(product, selectedImageUrl);

  const priceText = product.selling_price > 0
    ? `${formatINR(product.selling_price)}${product.original_price > product.selling_price ? ` (MRP: ${formatINR(product.original_price)})` : ''}`
    : 'Price on Inquiry';

  const lines = [
    `✨ *${product.name}*`,
    `Vaidehi Imitation Jewellery - Dhasa Junction`,
    ``,
    `• *Product Code:* ${product.code}`,
    `• *Category:* ${product.category} (${product.gender})`,
    `• *Price:* ${priceText}`,
    imageUrl ? `• *Selected Photo:* ${imageUrl}` : null,
    `• *Product Link:* ${productUrl}`,
    ``,
    `Hello Akshaysinh Kher, I would like to inquire about this jewellery piece from your collection.`,
  ].filter(Boolean);

  return getWhatsAppUrl(BUSINESS_DETAILS.whatsappPhone, lines.join('\n'));
};

/**
 * General store inquiry WhatsApp link
 */
export const createGeneralInquiryUrl = (customText?: string): string => {
  const defaultText = `Hello Akshaysinh Kher (Vaidehi Imitation, Dhasa Junction), I would like to inquire about your jewellery collection and custom bridal sets.`;
  return getWhatsAppUrl(BUSINESS_DETAILS.whatsappPhone, customText || defaultText);
};

/**
 * Attempt to convert an image URL into a real File object for Web Share API.
 * Returns null if CORS, network, or browser File constructor fails.
 */
export const fetchImageAsFile = async (
  imageUrl: string,
  filenamePrefix: string
): Promise<File | null> => {
  try {
    if (typeof window === 'undefined' || !window.fetch) return null;
    const response = await fetch(imageUrl, { mode: 'cors', credentials: 'omit' });
    if (!response.ok) return null;

    const blob = await response.blob();
    const mimeType = blob.type || 'image/jpeg';
    let ext = '.jpg';
    if (mimeType.includes('png')) ext = '.png';
    else if (mimeType.includes('webp')) ext = '.webp';

    const safeName = `${filenamePrefix.replace(/[^a-zA-Z0-9_-]/g, '_')}${ext}`;
    return new File([blob], safeName, { type: mimeType });
  } catch (err) {
    console.warn('Could not fetch image file for sharing (CORS or network limitation):', err);
    return null;
  }
};

export interface ShareOptions {
  product: Product;
  selectedImageUrl?: string | null;
  imageIndex?: number;
  actionType?: 'inquiry' | 'buy' | 'share';
  orderForm?: CustomerOrderForm;
  text?: string;
  fallbackUrl?: string;
  filenamePrefix?: string;
}

/**
 * Share product using the Web Share API with the real image File on supported devices.
 * If file sharing is unsupported, blocked by CORS, or cancelled, executes the fallback WhatsApp URL.
 */
export const shareWithImageFileOrFallback = async (
  options: ShareOptions
): Promise<{ sharedWithFile: boolean; cancelled?: boolean }> => {
  const {
    product,
    selectedImageUrl,
    imageIndex = 0,
    actionType = 'inquiry',
    orderForm,
    filenamePrefix = 'product',
  } = options;

  const targetImageUrl = getProductDirectImageUrl(product, selectedImageUrl);
  const productUrl = getIndividualProductUrl(product, imageIndex);

  // Compute fallback URL and share text based on action type if not explicitly supplied
  let fallbackUrl = options.fallbackUrl;
  let shareText = options.text;

  if (!fallbackUrl || !shareText) {
    if (actionType === 'buy' && orderForm) {
      if (!fallbackUrl) {
        fallbackUrl = createBuyOrderWhatsAppUrl(product, orderForm, selectedImageUrl, imageIndex);
      }
      if (!shareText) {
        shareText = [
          `*ORDER REQUEST - VAIDEHI IMITATION*`,
          `Item: ${product.name} (Code: ${product.code})`,
          `Price: ${formatINR(product.selling_price)}`,
          targetImageUrl ? `Selected Photo: ${targetImageUrl}` : null,
          `Customer: ${orderForm.name} (Phone: ${orderForm.phone})`,
          `Delivery Address: ${orderForm.address}, ${orderForm.city} - ${orderForm.pincode}`,
          orderForm.notes ? `Notes: ${orderForm.notes}` : null,
          `Product Link: ${productUrl}`,
        ].filter(Boolean).join('\n');
      }
    } else if (actionType === 'share') {
      if (!fallbackUrl) {
        fallbackUrl = createProductShareWhatsAppUrl(product, selectedImageUrl, imageIndex);
      }
      if (!shareText) {
        shareText = [
          `*${product.name}*`,
          `Vaidehi Imitation Jewellery - Dhasa Junction`,
          `• Product Code: ${product.code}`,
          `• Price: ${product.selling_price > 0 ? formatINR(product.selling_price) : 'On Inquiry'}`,
          targetImageUrl ? `• Selected Photo: ${targetImageUrl}` : null,
          `• Product Link: ${productUrl}`,
        ].filter(Boolean).join('\n');
      }
    } else {
      // Default: 'inquiry'
      if (!fallbackUrl) {
        fallbackUrl = createProductInquiryUrl(product, selectedImageUrl, imageIndex);
      }
      if (!shareText) {
        shareText = [
          `*PRODUCT INQUIRY - VAIDEHI IMITATION*`,
          `Item: ${product.name} (Code: ${product.code})`,
          `Price: ${product.selling_price > 0 ? formatINR(product.selling_price) : 'On Inquiry'}`,
          targetImageUrl ? `Selected Photo: ${targetImageUrl}` : null,
          `Product Link: ${productUrl}`,
          `Hello Akshaysinh Kher, please share availability and delivery time for this piece.`,
        ].filter(Boolean).join('\n');
      }
    }
  }

  // 1. Check if Web Share API with files is available in this browser
  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && targetImageUrl) {
    try {
      const file = await fetchImageAsFile(targetImageUrl, `${filenamePrefix}-${product.code}`);

      if (file && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${product.name} | Vaidehi Imitation`,
          text: shareText,
          files: [file],
        });
        return { sharedWithFile: true };
      }
    } catch (err: any) {
      // User tapped "Cancel" in native share sheet: do not trigger accidental fallback redirect
      if (err?.name === 'AbortError') {
        return { sharedWithFile: false, cancelled: true };
      }
      console.warn('Web Share with file failed, invoking WhatsApp fallback link:', err);
    }
  }

  // 2. Graceful Fallback: Open WhatsApp directly with full prefilled text, price, image link, and product URL
  if (typeof window !== 'undefined' && fallbackUrl) {
    window.open(fallbackUrl, '_blank');
  }
  return { sharedWithFile: false };
};
