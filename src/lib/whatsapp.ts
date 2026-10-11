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
 * Generate Product Inquiry WhatsApp link
 */
export const createProductInquiryUrl = (product: Product): string => {
  const productUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/#product-${product.code}`
    : `https://vaidehi-imitation.vercel.app/#product-${product.code}`;

  const message = [
    `✨ *PRODUCT INQUIRY - VAIDEHI IMITATION*`,
    `To: Akshaysinh Kher | Dhasa Junction`,
    ``,
    `Hello, I am interested in inquiring about this jewellery item:`,
    `• *Product:* ${product.name}`,
    `• *Product Code:* ${product.code}`,
    `• *Category:* ${product.category} (${product.gender})`,
    `• *Price:* ${formatINR(product.selling_price)} (MRP: ${formatINR(product.original_price)})`,
    `• *Catalogue Link:* ${productUrl}`,
    ``,
    `Could you please share availability, close-up video/photos, and delivery time to my pincode?`,
    `Thank you!`,
  ].join('\n');

  return getWhatsAppUrl(BUSINESS_DETAILS.whatsappPhone, message);
};

/**
 * Generate Buy Order WhatsApp link after customer completes the order form
 */
export const createBuyOrderWhatsAppUrl = (product: Product, order: CustomerOrderForm): string => {
  const productUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/#product-${product.code}`
    : `https://vaidehi-imitation.vercel.app/#product-${product.code}`;

  const message = [
    `🛍️ *NEW JEWELLERY ORDER REQUEST*`,
    `*Vaidehi Imitation - Dhasa Junction*`,
    `Attn: Akshaysinh Kher`,
    ``,
    `*ITEM DETAILS:*`,
    `• *Product:* ${product.name}`,
    `• *Product Code:* ${product.code}`,
    `• *Category:* ${product.category} (${product.gender})`,
    `• *Price:* ${formatINR(product.selling_price)}`,
    `• *Link:* ${productUrl}`,
    ``,
    `*DELIVERY & CUSTOMER DETAILS:*`,
    `• *Customer Name:* ${order.name.trim()}`,
    `• *Mobile Number:* ${order.phone.trim()}`,
    `• *Full Address:* ${order.address.trim()}`,
    `• *PIN Code:* ${order.pincode.trim()}`,
    order.notes ? `• *Special Note / Instructions:* ${order.notes.trim()}` : null,
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
 * General store inquiry WhatsApp link
 */
export const createGeneralInquiryUrl = (customText?: string): string => {
  const defaultText = `Hello Akshaysinh Kher (Vaidehi Imitation, Dhasa Junction), I would like to inquire about your jewellery collection and custom bridal sets.`;
  return getWhatsAppUrl(BUSINESS_DETAILS.whatsappPhone, customText || defaultText);
};
