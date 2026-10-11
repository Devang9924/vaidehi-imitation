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
 * Resolve direct public image URL for a product (absolute URL for WhatsApp & sharing)
 */
export const getProductDirectImageUrl = (product: Product): string | null => {
  if (!product.images || product.images.length === 0) return null;
  const first = product.images[0]?.trim();
  if (!first) return null;

  // Already a full public URL (e.g. Supabase Storage public bucket)
  if (first.startsWith('http://') || first.startsWith('https://')) {
    return first;
  }

  // Relative path (e.g. /images/sample-necklace-1.jpg) - resolve to full public URL
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://vaidehi-imitation.vercel.app';
  const cleanPath = first.startsWith('/') ? first : `/${first}`;
  return `${origin}${cleanPath}`;
};

/**
 * Resolve individual direct product page URL
 */
export const getIndividualProductUrl = (product: Product): string => {
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://vaidehi-imitation.vercel.app';
  const code = encodeURIComponent(product.code.trim());
  return `${origin}/?product=${code}`;
};

/**
 * Generate Product Inquiry WhatsApp link
 */
export const createProductInquiryUrl = (product: Product): string => {
  const productUrl = getIndividualProductUrl(product);
  const imageUrl = getProductDirectImageUrl(product);

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
    imageUrl ? `• *Product Image:* ${imageUrl}` : null,
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
 * Generate Buy Order WhatsApp link after customer completes the order form
 */
export const createBuyOrderWhatsAppUrl = (product: Product, order: CustomerOrderForm): string => {
  const productUrl = getIndividualProductUrl(product);
  const imageUrl = getProductDirectImageUrl(product);

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
    imageUrl ? `• *Product Image:* ${imageUrl}` : null,
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
 * Generate Product Share WhatsApp link (share with contacts/family)
 */
export const createProductShareWhatsAppUrl = (product: Product): string => {
  const productUrl = getIndividualProductUrl(product);
  const imageUrl = getProductDirectImageUrl(product);

  const priceText = product.selling_price > 0
    ? `${formatINR(product.selling_price)}${product.original_price > product.selling_price ? ` (MRP: ${formatINR(product.original_price)})` : ''}`
    : 'Price on Inquiry';

  const lines = [
    `✨ *${product.name}*`,
    `Vaidehi Imitation Jewellery - Dhasa Junction`,
    ``,
    `• *Code:* ${product.code}`,
    `• *Category:* ${product.category} (${product.gender})`,
    `• *Price:* ${priceText}`,
    imageUrl ? `• *Product Photo:* ${imageUrl}` : null,
    `• *View on Website:* ${productUrl}`,
    ``,
    `To order or inquire, visit the product link above or contact Akshaysinh Kher (+91 ${BUSINESS_DETAILS.whatsappPhone}).`,
  ].filter(Boolean);

  const text = encodeURIComponent(lines.join('\n'));
  return `https://api.whatsapp.com/send?text=${text}`;
};

/**
 * General store inquiry WhatsApp link
 */
export const createGeneralInquiryUrl = (customText?: string): string => {
  const defaultText = `Hello Akshaysinh Kher (Vaidehi Imitation, Dhasa Junction), I would like to inquire about your jewellery collection and custom bridal sets.`;
  return getWhatsAppUrl(BUSINESS_DETAILS.whatsappPhone, customText || defaultText);
};
