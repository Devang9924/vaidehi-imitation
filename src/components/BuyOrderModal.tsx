import React, { useState } from 'react';
import { X, MessageCircle, ShieldCheck, ShoppingBag, MapPin, Phone, User } from 'lucide-react';
import type { Product, CustomerOrderForm } from '../types';
import { formatINR, createBuyOrderWhatsAppUrl } from '../lib/whatsapp';
import { BUSINESS_DETAILS } from '../data/business';

interface BuyOrderModalProps {
  product: Product | null;
  selectedImageUrl?: string | null;
  selectedImageIndex?: number;
  onClose: () => void;
}

export const BuyOrderModal: React.FC<BuyOrderModalProps> = ({
  product,
  selectedImageUrl,
  selectedImageIndex = 0,
  onClose,
}) => {
  const [formData, setFormData] = useState<CustomerOrderForm>({
    name: '',
    phone: '',
    address: '',
    pincode: '',
    city: '',
    notes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!product) return null;

  const activeImageUrl = selectedImageUrl || (product.images && product.images[0]) || '/images/sample-necklace-1.jpg';
  const activeImageIdx = selectedImageIndex ?? 0;

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your full name (at least 2 characters)';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    } else if (!/^[6-9]/.test(cleanPhone)) {
      newErrors.phone = 'Indian mobile numbers start with 6, 7, 8, or 9';
    }

    if (!formData.address.trim() || formData.address.trim().length < 8) {
      newErrors.address = 'Please provide your full delivery address with house/flat, street, and town';
    }

    const cleanPin = formData.pincode.replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6 || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
      newErrors.pincode = 'Please enter a valid 6-digit Indian PIN code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Generate direct WhatsApp chat URL with encoded text message to 919687599517
    const url = createBuyOrderWhatsAppUrl(product, formData, activeImageIdx);

    // Close the order modal immediately
    onClose();

    // Open WhatsApp directly with the prefilled order message
    if (typeof window !== 'undefined') {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = url;
      } else {
        const opened = window.open(url, '_blank');
        if (!opened) {
          window.location.href = url;
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#F5D8E0] overflow-y-auto max-h-[92vh] p-5 sm:p-8 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all pressable cursor-pointer"
          aria-label="Close form"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          {/* Header */}
          <div className="text-left mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] text-[#8B4F58] text-xs font-semibold uppercase tracking-wider mb-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Direct WhatsApp Order</span>
            </span>
            <h2 className="font-heading text-2xl font-semibold text-[#1F1A1C]">
              Place Your Order Request
            </h2>
            <p className="text-xs text-[#6E6267] mt-1 font-light">
              Fill in your delivery address. This opens a direct prefilled WhatsApp chat with <strong>{BUSINESS_DETAILS.ownerName}</strong> at Vaidehi Imitation.
            </p>
          </div>

          {/* Selected Product Summary Box */}
          <div className="bg-[#FFF8F9] rounded-2xl p-3.5 border border-[#F5D8E0] flex items-center gap-3.5 mb-5">
            <div className="w-16 h-16 rounded-xl bg-white border border-[#F0C9D3] shrink-0 p-1 flex items-center justify-center overflow-hidden">
              <img
                src={activeImageUrl}
                alt={product.name}
                className="w-full h-full object-contain object-center"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/sample-necklace-1.jpg';
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="block text-[10px] font-mono font-bold text-[#8B4F58]">
                  CODE: {product.code}
                </span>
                {product.images && product.images.length > 1 && (
                  <span className="text-[10px] text-[#8B4F58] font-medium bg-[#FCECEF] px-1.5 py-0.5 rounded border border-[#F5D8E0]">
                    Photo {activeImageIdx + 1} of {product.images.length}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-semibold text-[#1F1A1C] truncate">
                {product.name}
              </h4>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-base font-bold text-[#8B4F58]">
                  {formatINR(product.selling_price)}
                </span>
                {product.original_price > product.selling_price && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatINR(product.original_price)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Order Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-left text-xs sm:text-sm">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3F44] mb-1">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Radhika Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-[#B76E79] ${
                    errors.name ? 'border-red-400 bg-red-50/20' : 'border-[#F0C9D3] bg-[#FFFDFC]'
                  }`}
                />
              </div>
              {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3F44] mb-1">
                WhatsApp Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <span className="absolute left-9 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  className={`w-full pl-17 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-[#B76E79] ${
                    errors.phone ? 'border-red-400 bg-red-50/20' : 'border-[#F0C9D3] bg-[#FFFDFC]'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>}
            </div>

            {/* Delivery Address */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3F44] mb-1">
                Full Delivery Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <textarea
                  required
                  rows={2}
                  placeholder="House/Flat No, Apartment, Street, Landmark, Town/City"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full pl-9 pr-3.5 py-2 rounded-xl border text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-[#B76E79] ${
                    errors.address ? 'border-red-400 bg-red-50/20' : 'border-[#F0C9D3] bg-[#FFFDFC]'
                  }`}
                />
              </div>
              {errors.address && <p className="text-[11px] text-red-600 mt-1">{errors.address}</p>}
            </div>

            {/* City & PIN Code */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#4A3F44] mb-1">
                  City / Town
                </label>
                <input
                  type="text"
                  placeholder="e.g. Botad / Dhasa"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#F0C9D3] bg-[#FFFDFC] text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-[#B76E79]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3F44] mb-1">
                  PIN Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="364740"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-[#B76E79] ${
                    errors.pincode ? 'border-red-400 bg-red-50/20' : 'border-[#F0C9D3] bg-[#FFFDFC]'
                  }`}
                />
                {errors.pincode && <p className="text-[11px] text-red-600 mt-1">{errors.pincode}</p>}
              </div>
            </div>

            {/* Special Notes (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3F44] mb-1">
                Special Notes / Gift Packing (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Please provide wedding gift packaging"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#F0C9D3] bg-[#FFFDFC] text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-[#B76E79]"
              />
            </div>

            {/* Direct WhatsApp Ordering Notice */}
            <div className="bg-[#FFF9FA] border border-[#F5D8E0] rounded-xl p-3 text-[11px] text-[#5A4E53] space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[#8B4F58]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Direct WhatsApp Order</span>
              </div>
              <p className="text-[11px] text-[#6E6267] leading-relaxed">
                No advance payment is collected online. Clicking below opens WhatsApp with your prefilled order details to <strong>{BUSINESS_DETAILS.ownerName} (+91 {BUSINESS_DETAILS.whatsappPhone})</strong>. Simply tap 'Send' in WhatsApp to confirm piece availability and dispatch.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Place Order via WhatsApp</span>
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};
