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

