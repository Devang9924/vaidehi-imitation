import React, { useState } from 'react';
import { X, MessageCircle, ShoppingBag, Share2, Check, Tag, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../types';
import { formatINR, getDiscountPercentage, createProductInquiryUrl } from '../lib/whatsapp';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onBuyNow: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onBuyNow,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['/images/sample-necklace-1.jpg'];

  const discount = getDiscountPercentage(product.original_price, product.selling_price);
  const inquiryUrl = createProductInquiryUrl(product);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#product-${product.code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handlePrev = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div
        className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-[#F5D8E0] overflow-hidden flex flex-col md:flex-row max-h-[92vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md flex items-center justify-center transition-all pressable cursor-pointer"
          aria-label="Close product details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Multi-image Gallery */}
        <div className="md:w-1/2 bg-[#FFF8F9] flex flex-col p-4 sm:p-6 border-b md:border-b-0 md:border-r border-[#F5D8E0]">
          
          {/* Main Large Image */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-[#F0C9D3] shadow-xs flex items-center justify-center">
            <img
              src={images[activeImageIndex]}
              alt={`${product.name} large view`}
              className="w-full h-full object-cover object-center"
            />

            {/* Navigation arrows if more than 1 image */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-gray-800 flex items-center justify-center shadow-md transition-all"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-gray-800 flex items-center justify-center shadow-md transition-all"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Badges on main image */}
            {product.is_sample && (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                Demo Sample
              </span>
            )}
          </div>

          {/* Thumbnail Strip (Supports unlimited images, horizontally scrollable) */}
          {images.length > 1 && (
            <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {images.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    index === activeImageIndex
                      ? 'border-[#B76E79] ring-2 ring-[#B76E79]/30 scale-102'
                      : 'border-[#F0C9D3] opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 text-center text-[11px] text-[#8B4F58] font-medium">
            Photo {activeImageIndex + 1} of {images.length}
          </div>
        </div>

        {/* Right Side: Product Details & WhatsApp Ordering */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          
          <div className="space-y-4">
            
            {/* Top Badges */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF0F3] text-[#8B4F58] border border-[#F5B8C7]">
                  {product.gender} • {product.category}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-gray-100 text-[#4A3F44]">
                  {product.code}
                </span>
              </div>

              {/* Share button */}
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 text-xs text-[#8B4F58] hover:text-[#9E5863] bg-[#FFF8F9] px-2.5 py-1 rounded-full border border-[#F0C9D3]"
                title="Copy product link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>

            {/* Product Title */}
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-[#1F1A1C] leading-snug">
              {product.name}
            </h2>

            {/* Pricing Section */}
            <div className="bg-[#FFF8F9] p-4 rounded-2xl border border-[#F5D8E0] space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#1F1A1C]">
                  {formatINR(product.selling_price)}
                </span>
                {product.original_price > product.selling_price && (
                  <span className="text-base text-gray-400 line-through">
                    {formatINR(product.original_price)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#8B4F58] text-white flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>Save {discount}%</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#6E6267]">
                Prices shown in INR. Inquire on WhatsApp for availability and sizing.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5 text-left">
              <h4 className="text-xs uppercase font-bold tracking-wider text-[#8B4F58]">
                Jewellery Description & Details
              </h4>
              <p className="text-sm text-[#5A4E53] leading-relaxed font-light whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Store Info Box */}
            <div className="bg-[#FDF9FA] p-3.5 rounded-xl border border-[#F5D8E0] text-xs text-[#5A4E53] space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-[#8B4F58]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Showroom Location & Guidance</span>
              </div>
              <p className="text-[11px] text-[#6E6267] leading-relaxed">
                • Location: Near Bank of Baroda, Dhasa Railway Station Road.<br />
                • Inquiries and consultations handled directly by Akshaysinh Kher.
              </p>
            </div>

          </div>

          {/* Bottom Call to Actions */}
          <div className="pt-6 mt-6 border-t border-[#F8E3E8] space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* WhatsApp Inquiry */}
              <a
                href={inquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl border border-[#F0C9D3] bg-[#FFF8F9] hover:bg-[#FCECEF] text-[#8B4F58] text-sm font-semibold flex items-center justify-center gap-2 transition-colors text-center"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Inquire on WhatsApp</span>
              </a>

              {/* Buy Now (Order Modal) */}
              <button
                onClick={() => {
                  onClose();
                  onBuyNow(product);
                }}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4A373] via-[#B76E79] to-[#9E5863] hover:brightness-105 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all text-center"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Buy Now (WhatsApp Form)</span>
              </button>
            </div>

            <p className="text-center text-[10px] text-[#9E9096]">
              No advance payment collected online. Orders are finalized with the store owner on WhatsApp.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
