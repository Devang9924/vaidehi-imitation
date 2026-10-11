import React, { useState } from 'react';
import { X, MessageCircle, CheckCircle2, ShieldCheck, ShoppingBag, MapPin, Phone, User, Loader2 } from 'lucide-react';
import type { Product, CustomerOrderForm } from '../types';
import { formatINR, createBuyOrderWhatsAppUrl, shareWithImageFileOrFallback } from '../lib/whatsapp';
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSharing(true);
    const url = createBuyOrderWhatsAppUrl(product, formData, activeImageUrl, activeImageIdx);
    setGeneratedUrl(url);
    setIsSubmitted(true);

    try {
      await shareWithImageFileOrFallback({
        product,
        selectedImageUrl: activeImageUrl,
        imageIndex: activeImageIdx,
        orderForm: formData,
        actionType: 'buy',
      });
    } finally {
      setIsSharing(false);
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

        {!isSubmitted ? (
          <div>
            {/* Header */}
            <div className="text-left mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] text-[#8B4F58] text-xs font-semibold uppercase tracking-wider mb-2">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Fast WhatsApp Order</span>
              </span>
              <h2 className="font-heading text-2xl font-semibold text-[#1F1A1C]">
                Place Your Order Request
              </h2>
              <p className="text-xs text-[#6E6267] mt-1 font-light">
                Fill in your delivery address. This creates a prefilled message sent directly to <strong>{BUSINESS_DETAILS.ownerName}</strong> at Vaidehi Imitation.
              </p>
            </div>

            {/* Selected Product Summary Box */}
            <div className="bg-[#FFF8F9] rounded-2xl p-3.5 border border-[#F5D8E0] flex items-center gap-3.5 mb-5">
              <img
                src={activeImageUrl}
                alt={product.name}
                className="w-16 h-16 rounded-xl object-cover border border-[#F0C9D3] shrink-0"
              />
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
                  Full Customer Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B4F58]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B76E79] ${
                      errors.name ? 'border-red-400 bg-red-50/30' : 'border-[#F0C9D3] bg-[#FFFDFC]'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-[#4A3F44] mb-1">
                  WhatsApp / Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B4F58]" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number (e.g. 9876543210)"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B76E79] ${
                      errors.phone ? 'border-red-400 bg-red-50/30' : 'border-[#F0C9D3] bg-[#FFFDFC]'
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
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-[#8B4F58]" />
                  <textarea
                    required
                    rows={2}
                    placeholder="House / Flat No, Street, Landmark, Village / Town, City & State"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B76E79] ${
                      errors.address ? 'border-red-400 bg-red-50/30' : 'border-[#F0C9D3] bg-[#FFFDFC]'
                    }`}
                  />
                </div>
                {errors.address && <p className="text-[11px] text-red-600 mt-1">{errors.address}</p>}
              </div>

              {/* PIN Code */}
              <div>
                <label className="block text-xs font-semibold text-[#4A3F44] mb-1">
                  Postal PIN Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="6-digit PIN (e.g. 364740)"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B76E79] ${
                    errors.pincode ? 'border-red-400 bg-red-50/30' : 'border-[#F0C9D3] bg-[#FFFDFC]'
                  }`}
                />
                {errors.pincode && <p className="text-[11px] text-red-600 mt-1">{errors.pincode}</p>}
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

              {/* Payment & Dispatch Notice */}
              <div className="bg-[#FFF9FA] border border-[#F5D8E0] rounded-xl p-3 text-[11px] text-[#5A4E53] space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#8B4F58]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Transparent Ordering Notice</span>
                </div>
                <p className="text-[11px] text-[#6E6267] leading-relaxed">
                  No online payment gateway is used. After clicking below, WhatsApp will open with your prefilled details. You will personally send the message to <strong>Akshaysinh Kher</strong> to confirm piece availability and dispatch.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSharing}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-60"
              >
                {isSharing ? <Loader2 className="w-4 h-4 fill-current animate-spin" /> : <MessageCircle className="w-4 h-4 fill-current" />}
                <span>{isSharing ? 'Preparing Order & Image...' : 'Submit & Open WhatsApp Order'}</span>
              </button>

            </form>
          </div>
        ) : (
          /* Confirmation Screen after WhatsApp opened */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <h3 className="font-heading text-2xl font-bold text-[#1F1A1C]">
              WhatsApp Order Draft Prepared!
            </h3>
            
            <p className="text-xs sm:text-sm text-[#5A4E53] max-w-sm mx-auto leading-relaxed">
              We have initiated WhatsApp for you. <strong>Please tap 'Send' in WhatsApp</strong> to transmit your order details directly to <strong>Akshaysinh Kher (9687599517)</strong>.
            </p>

            <div className="bg-[#FFF8F9] rounded-2xl p-4 border border-[#F5D8E0] text-xs text-left text-[#5A4E53] space-y-1">
              <div><strong>Recipient:</strong> Akshaysinh Kher (Vaidehi Imitation)</div>
              <div><strong>Item:</strong> {product.name} ({product.code})</div>
              <div><strong>Selected Photo:</strong> Photo {activeImageIdx + 1} of {product.images?.length || 1}</div>
              <div><strong>Delivery To:</strong> {formData.name}, {formData.pincode}</div>
            </div>

            <div className="text-[11px] text-gray-600 bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-left">
              <span className="font-semibold text-amber-900">Delivery Notice: </span>
              <span>On supported mobile browsers, the share sheet shares the actual photo file directly. On desktop or standard web links, your message contains the full item details, address, and direct high-resolution image link.</span>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={generatedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Re-open WhatsApp Chat</span>
              </a>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 transition-colors"
              >
                Done / Back to Catalogue
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
