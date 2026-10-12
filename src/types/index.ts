export type GenderFilter = 'All' | 'Female' | 'Male' | 'Unisex';

export type CategoryGender = 'Male' | 'Female' | 'All';

export interface JewelleryCategory {
  id: string;
  name: string;
  gender: CategoryGender;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type ProductCategory = string;
export type SpecificCategory = string;

export interface Product {
  id: string;
  code: string;
  name: string;
  gender: 'Female' | 'Male' | 'Unisex';
  category: SpecificCategory;
  description: string;
  original_price: number;
  selling_price: number;
  images: string[];
  in_stock: boolean;
  is_sample?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'discount-desc';

export interface CustomerOrderForm {
  name: string;
  phone: string;
  address: string;
  pincode: string;
  city?: string;
  notes?: string;
}

export interface BusinessConfig {
  brandName: string;
  tagline: string;
  ownerName: string;
  whatsappPhone: string;
  formattedPhone: string;
  address: {
    line1: string;
    landmark: string;
    area: string;
    taluka: string;
    district: string;
    state: string;
    pincode: string;
    fullFormatted: string;
  };
  instagramHandle: string;
  instagramUrl: string;
  instagramFollowersText: string;
  mapUrl: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface CustomerReview {
  id: string;
  customer_name: string;
  rating: number; // 1 to 5
  title?: string;
  message: string;
  status: ReviewStatus;
  created_at: string;
  product_id?: string;
  product_code?: string;
  product_name?: string;
}

export interface ReviewFormData {
  customer_name: string;
  rating: number;
  title: string;
  message: string;
  product_id?: string;
  product_code?: string;
  product_name?: string;
}

// ==========================================
// Order Modes & Store Settings
// ==========================================

export type OrderMode = 'whatsapp' | 'online_checkout';

export interface StoreSettings {
  order_mode: OrderMode;
  razorpay_enabled: boolean;
  cod_enabled: boolean;
  updated_at?: string;
}

// ==========================================
// Shopping Cart Models
// ==========================================

export interface CartItem {
  id: string; // Composite key: `${product.id}_${selectedImageIndex}`
  product: Product;
  selectedImageIndex: number;
  selectedImageUrl: string;
  quantity: number;
  unit_price: number;
  selected?: boolean; // Selection state for selective checkout
}

// ==========================================
// Orders & Payment Status Models
// ==========================================

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'verified'
  | 'failed'
  | 'cod_pending'
  | 'refunded';

export type PaymentMethod = 'razorpay' | 'cod' | 'whatsapp';

export type PaymentEnvironment = 'test' | 'live' | 'cod' | 'whatsapp' | 'unknown';

export interface OrderItem {
  product_id: string;
  product_code: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  payment_env?: PaymentEnvironment;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface CheckoutFormData {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
  payment_method: PaymentMethod;
}
