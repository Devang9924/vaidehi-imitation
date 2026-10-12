import React, { useState } from 'react';
import { MessageCircle, ShoppingBag, Eye, Tag, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import type { Product, OrderMode } from '../types';
import { formatINR, getDiscountPercentage, shareWithImageFileOrFallback } from '../lib/whatsapp';

interface ProductCardProps {
  product: Product;
  index?: number;
  onViewDetails: (product: Product, selectedImageIndex?: number) => void;
  onBuyNow: (product: Product, selectedImageUrl?: string, selectedImageIndex?: number) => void;
  orderMode?: OrderMode;
  onAddToCart?: (product: Product, selectedImageUrl?: string, selectedImageIndex?: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index = 0,
  onViewDetails,
  onBuyNow,
  orderMode = 'whatsapp',
  onAddToCart,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const discount = getDiscountPercentage(product.original_price, product.selling_price);

  const images = product.images && product.images.length > 0
    ? product.images
    : ['/images/sample-necklace-1.jpg'];

  const selectedImageUrl = images[activeImageIndex] || images[0];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product, selectedImageUrl, activeImageIndex);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    }
  };

  return (
    <div
      onClick={() => onViewDetails(product, activeImageIndex)}
      style={{ animationDelay: `${Math.min(index * 50, 450)}ms` }}
      className="group relative bg-white rounded-2xl sm:rounded-3xl border border-[#F5D8E0] overflow-hidden rose-gold-card-shadow rose-gold-card-hover cursor-pointer flex flex-col justify-between transition-all animate-fade-in-up"
    >
      {/* Top Image Showcase */}
      <div className="relative aspect-square w-full bg-[#FFF5F8] overflow-hidden flex items-center justify-center p-2.5">
        <img
          src={images[activeImageIndex]}
          alt={`${product.name} - ${product.code} at Vaidehi Imitation`}
          className="w-full h-full max-h-full max-w-full object-contain object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/images/sample-necklace-1.jpg';
          }}
        />

        {/* Multi-image indicators if more than 1 image */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
              aria-label="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {/* Image dots */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center space-x-1 bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-full">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === activeImageIndex ? 'bg-white w-3' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Badges on Image */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {product.is_sample && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow-xs">
              Demo Sample
            </span>
          )}
          {discount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#8B4F58] text-white shadow-xs flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" />
              <span>{discount}% OFF</span>
            </span>
          )}
        </div>

        {/* Gender / Category Badge Top Right */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/90 backdrop-blur-xs text-[#8B4F58] border border-[#F5D8E0] shadow-2xs">
            {product.gender} • {product.category}
          </span>
        </div>

        {/* Quick View overlay hint */}
        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="px-3.5 py-1.5 rounded-full bg-white/95 text-[#8B4F58] text-xs font-semibold shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </span>
        </div>
      </div>

      {/* Card Content & Details */}
      <div className="p-3 min-[360px]:p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Product Code */}
          <div className="flex items-center justify-between text-[10px] min-[360px]:text-[11px] text-[#8B4F58] font-mono tracking-wider font-semibold mb-1">
            <span>CODE: {product.code}</span>
            {images.length > 1 && (
              <span className="text-[#6E6267] font-sans text-[9px] min-[360px]:text-[10px]">
                {images.length} photos
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-heading text-sm min-[360px]:text-base sm:text-xl font-semibold text-[#1F1A1C] leading-snug line-clamp-2 group-hover:text-[#8B4F58] transition-colors">
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-[11px] min-[360px]:text-xs text-[#6E6267] line-clamp-2 mt-1 font-light">
            {product.description}
          </p>
        </div>

        {/* Pricing and Action Buttons */}
        <div className="mt-3 sm:mt-4 pt-3 border-t border-[#F8E3E8]">
          <div className="flex items-baseline justify-between mb-2.5 sm:mb-3 flex-wrap gap-1">
            <div className="flex items-baseline space-x-1.5 min-[360px]:space-x-2">
              <span className="text-base min-[360px]:text-lg sm:text-2xl font-bold text-[#1F1A1C]">
                {formatINR(product.selling_price)}
              </span>
              {product.original_price > product.selling_price && (
                <span className="text-[10px] min-[360px]:text-xs text-[#9E9096] line-through">
                  {formatINR(product.original_price)}
                </span>
              )}
            </div>
            <span className="text-[9px] min-[360px]:text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {product.in_stock ? 'In Stock' : 'Check Stock'}
            </span>
          </div>

          {/* Dual Action Buttons */}
          {orderMode === 'online_checkout' ? (
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddClick}
                className="min-h-[38px] sm:min-h-[42px] py-2 px-1.5 min-[360px]:px-2.5 rounded-xl border border-[#F0C9D3] bg-[#FFF8F9] hover:bg-[#FCECEF] text-[#8B4F58] text-[10px] min-[360px]:text-xs font-semibold flex items-center justify-center gap-1 transition-all text-center pressable cursor-pointer"
                title="Add to Shopping Bag"
              >
                {justAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700 font-bold">Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 text-[#8B4F58] shrink-0" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

              {/* Buy Now (Direct to Checkout) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBuyNow(product, selectedImageUrl, activeImageIndex);
                }}
                className="min-h-[38px] sm:min-h-[42px] py-2 px-1.5 min-[360px]:px-2.5 rounded-xl bg-gradient-to-r from-[#D4A373] via-[#B76E79] to-[#9E5863] hover:brightness-105 text-white text-[10px] min-[360px]:text-xs font-semibold flex items-center justify-center gap-1 shadow-2xs hover:shadow-sm transition-all text-center pressable cursor-pointer"
              >
                <span>Buy Now</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              {/* Quick Inquiry on WhatsApp */}
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  await shareWithImageFileOrFallback({
                    product,
                    selectedImageUrl,
                    imageIndex: activeImageIndex,
                    actionType: 'inquiry',
                  });
                }}
                className="min-h-[38px] sm:min-h-[42px] py-2 px-1.5 min-[360px]:px-2.5 rounded-xl border border-[#F0C9D3] bg-[#FFF8F9] hover:bg-[#FCECEF] text-[#8B4F58] text-[10px] min-[360px]:text-xs font-semibold flex items-center justify-center gap-1 transition-all text-center pressable cursor-pointer"
                title="Inquire on WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Inquire</span>
              </button>

              {/* Buy Now Button (Opens Order Form) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBuyNow(product, selectedImageUrl, activeImageIndex);
                }}
                className="min-h-[38px] sm:min-h-[42px] py-2 px-1.5 min-[360px]:px-2.5 rounded-xl bg-gradient-to-r from-[#D4A373] via-[#B76E79] to-[#9E5863] hover:brightness-105 text-white text-[10px] min-[360px]:text-xs font-semibold flex items-center justify-center gap-1 shadow-2xs hover:shadow-sm transition-all text-center pressable cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span>Buy Now</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
