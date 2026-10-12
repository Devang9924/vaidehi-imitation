import React, { useState, useEffect } from 'react';
import { X, MessageCircle, ShoppingBag, Share2, Check, Tag, ShieldCheck, ChevronLeft, ChevronRight, Loader2, CreditCard } from 'lucide-react';
import type { Product, OrderMode } from '../types';
import {
  formatINR,
  getDiscountPercentage,
  getIndividualProductUrl,
  shareWithImageFileOrFallback,
} from '../lib/whatsapp';

interface ProductDetailModalProps {
  product: Product | null;
  initialImageIndex?: number;
  onClose: () => void;
  onBuyNow: (product: Product, selectedImageUrl?: string, selectedImageIndex?: number) => void;
  orderMode?: OrderMode;
  onAddToCart?: (product: Product, selectedImageUrl?: string, selectedImageIndex?: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  initialImageIndex = 0,
  onClose,
  onBuyNow,
  orderMode = 'whatsapp',
  onAddToCart,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(initialImageIndex);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [addedToBag, setAddedToBag] = useState(false);

  useEffect(() => {
    if (initialImageIndex !== undefined) {
      setActiveImageIndex(initialImageIndex);
    } else {
      setActiveImageIndex(0);
    }
    setAddedToBag(false);
  }, [product?.id, initialImageIndex]);

  // Synchronize browser URL with active image selection so direct links and refresh preserve photo choice
  useEffect(() => {
    if (product && typeof window !== 'undefined') {
      const imgParam = activeImageIndex > 0 ? `&img=${activeImageIndex}` : '';
      const newUrl = `${window.location.pathname}?product=${encodeURIComponent(product.code)}${imgParam}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, [product, activeImageIndex]);

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['/images/sample-necklace-1.jpg'];

  const selectedImageUrl = images[activeImageIndex] || images[0];
  const discount = getDiscountPercentage(product.original_price, product.selling_price);
  const productPageUrl = getIndividualProductUrl(product, activeImageIndex);

  const handleCopyLink = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(productPageUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handlePrev = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleShareWhatsApp = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      await shareWithImageFileOrFallback({
        product,
        selectedImageUrl,
        imageIndex: activeImageIndex,
        actionType: 'share',
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleInquireWhatsApp = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      await shareWithImageFileOrFallback({
        product,
        selectedImageUrl,
        imageIndex: activeImageIndex,
        actionType: 'inquiry',
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleAddToBag = () => {
    if (onAddToCart) {
      onAddToCart(product, selectedImageUrl, activeImageIndex);
      setAddedToBag(true);
      setTimeout(() => setAddedToBag(false), 2500);
    }
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
          <div className="relative aspect-square w-full max-h-[48vh] md:max-h-none rounded-2xl overflow-hidden bg-white border border-[#F0C9D3] shadow-xs flex items-center justify-center p-3 sm:p-4">
            <img
              src={images[activeImageIndex]}
              alt={`${product.name} large view`}
              className="w-full h-full max-h-full max-w-full object-contain object-center transition-all duration-300"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/sample-necklace-1.jpg';
              }}
            />

            {/* Navigation arrows if more than 1 image */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-gray-800 flex items-center justify-center shadow-md transition-all cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-gray-800 flex items-center justify-center shadow-md transition-all cursor-pointer"
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

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {images.map((imgUrl, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 bg-white flex items-center justify-center p-1 transition-all cursor-pointer ${
                    index === activeImageIndex
                      ? 'border-[#B76E79] ring-2 ring-[#B76E79]/30 scale-105'
                      : 'border-[#F0C9D3] opacity-80 hover:opacity-100'
                  }`}
                  aria-label={`View photo ${index + 1}`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-contain object-center"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/sample-necklace-1.jpg';
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 text-center text-[11px] text-[#8B4F58] font-medium">
            Photo {activeImageIndex + 1} of {images.length}
          </div>
        </div>

        {/* Right Side: Product Details */}
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

              {/* Share actions */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  disabled={isSharing}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200 transition-colors cursor-pointer pressable disabled:opacity-50"
                  title="Share product details & image via WhatsApp"
                >
                  {isSharing ? <Loader2 className="w-3 h-3 text-emerald-600 animate-spin" /> : <MessageCircle className="w-3 h-3 text-emerald-600" />}
                  <span>Share on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B4F58] hover:text-[#9E5863] bg-[#FFF8F9] px-2.5 py-1 rounded-full border border-[#F0C9D3] transition-colors cursor-pointer pressable"
                  title="Copy individual product link"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Share2 className="w-3 h-3" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
              </div>
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
                {orderMode === 'online_checkout'
                  ? 'Official showroom price in INR. Secure online checkout supported.'
                  : 'Prices shown in INR. Inquire on WhatsApp for availability and sizing.'}
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
                • Handled directly by Akshaysinh Kher at Vaidehi Imitation.
              </p>
            </div>

          </div>

          {/* Bottom Call to Actions */}
          <div className="pt-6 mt-6 border-t border-[#F8E3E8] space-y-2.5">
            {orderMode === 'online_checkout' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Add to Bag */}
                  <button
                    type="button"
                    onClick={handleAddToBag}
                    className="py-3 px-4 rounded-xl border border-[#F0C9D3] bg-[#FFF8F9] hover:bg-[#FCECEF] text-[#8B4F58] text-sm font-semibold flex items-center justify-center gap-2 transition-colors text-center cursor-pointer pressable"
                  >
                    {addedToBag ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Added to Bag!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-[#8B4F58]" />
                        <span>Add to Bag</span>
                      </>
                    )}
                  </button>

                  {/* Buy Now (Checkout Directly) */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onBuyNow(product, selectedImageUrl, activeImageIndex);
                    }}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4A373] via-[#B76E79] to-[#9E5863] hover:brightness-105 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all text-center cursor-pointer pressable"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Buy Now</span>
                  </button>
                </div>

                <p className="text-center text-[10px] text-[#9E9096]">
                  Order securely with cart & verified checkout. Delivery across India.
                </p>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* WhatsApp Inquiry */}
                  <button
                    type="button"
                    onClick={handleInquireWhatsApp}
                    disabled={isSharing}
                    className="py-3 px-4 rounded-xl border border-[#F0C9D3] bg-[#FFF8F9] hover:bg-[#FCECEF] text-[#8B4F58] text-sm font-semibold flex items-center justify-center gap-2 transition-colors text-center cursor-pointer pressable disabled:opacity-50"
                  >
                    {isSharing ? <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" /> : <MessageCircle className="w-4 h-4 text-emerald-600" />}
                    <span>Inquire on WhatsApp</span>
                  </button>

                  {/* Buy Now (WhatsApp Order Modal) */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onBuyNow(product, selectedImageUrl, activeImageIndex);
                    }}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4A373] via-[#B76E79] to-[#9E5863] hover:brightness-105 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all text-center cursor-pointer pressable"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Buy Now (WhatsApp Form)</span>
                  </button>
                </div>

                <p className="text-center text-[10px] text-[#9E9096]">
                  No advance payment collected online. Orders are finalized with the store owner on WhatsApp.
                </p>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
