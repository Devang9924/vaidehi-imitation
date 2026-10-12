import React from 'react';
import type { Product, OrderMode } from '../types';
import { ProductCard } from './ProductCard';
import { Sparkles, MessageCircle, RefreshCw, AlertCircle, EyeOff } from 'lucide-react';
import { createGeneralInquiryUrl } from '../lib/whatsapp';
import { BUSINESS_DETAILS } from '../data/business';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  showSampleProducts: boolean;
  onToggleSampleProducts: () => void;
  onViewDetails: (product: Product, selectedImageIndex?: number) => void;
  onBuyNow: (product: Product, selectedImageUrl?: string, selectedImageIndex?: number) => void;
  onResetFilters: () => void;
  orderMode?: OrderMode;
  onAddToCart?: (product: Product, selectedImageUrl?: string, selectedImageIndex?: number) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  error,
  showSampleProducts,
  onToggleSampleProducts,
  onViewDetails,
  onBuyNow,
  onResetFilters,
  orderMode = 'whatsapp',
  onAddToCart,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Show only if Demo / Sample Preview mode is explicitly enabled by Administrator or Tester */}
      {showSampleProducts && (
        <div className="mb-6 bg-amber-50/90 border border-amber-200/90 rounded-2xl px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-amber-900 animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>
              <strong>Demo Preview Active:</strong> Displaying sample demonstration items for testing alongside genuine showroom inventory.
            </span>
          </div>

          <button
            onClick={onToggleSampleProducts}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-amber-300 text-amber-900 font-semibold hover:bg-amber-100 transition-colors pressable cursor-pointer shrink-0 self-end sm:self-auto"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Disable Demo Mode</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl sm:rounded-3xl border border-[#F5D8E0] p-3.5 sm:p-4 space-y-3 sm:space-y-4 animate-pulse">
              <div className="aspect-square bg-[#FCECEF] rounded-xl sm:rounded-2xl w-full" />
              <div className="h-4 bg-[#FCECEF] rounded-md w-3/4" />
              <div className="h-3 bg-[#FCECEF] rounded-md w-1/2" />
              <div className="h-8 bg-[#FCECEF] rounded-xl w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-lg mx-auto my-12 animate-fade-in">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800">Unable to load catalogue</h3>
          <p className="text-xs text-red-600 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-full hover:bg-red-700 transition-colors inline-flex items-center gap-1.5 pressable cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && products.length === 0 && (
        <div className="bg-white rounded-3xl border border-[#F5D8E0] p-6 sm:p-12 text-center max-w-2xl mx-auto my-8 shadow-xs animate-fade-in-up">
          <div className="w-16 h-16 rounded-full bg-[#FFF0F3] border border-[#F5B8C7] flex items-center justify-center mx-auto mb-4 text-[#8B4F58]">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="font-heading text-xl sm:text-2xl font-semibold text-[#1F1A1C]">
            No Pieces Found In This Selection
          </h3>
          <p className="text-xs sm:text-sm text-[#6E6267] mt-2 max-w-md mx-auto leading-relaxed">
            No jewellery items currently match your chosen filters. Explore our other collections or contact our showroom team directly on WhatsApp for fresh arrivals.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onResetFilters}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#B76E79] text-[#8B4F58] text-xs sm:text-sm font-semibold hover:bg-[#FFF0F3] transition-colors pressable cursor-pointer"
            >
              Clear All Filters
            </button>
            <a
              href={createGeneralInquiryUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors pressable"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Ask for Current Stock on WhatsApp</span>
            </a>
          </div>

          {/* Unobtrusive test button if testing with empty database */}
          {!showSampleProducts && (
            <div className="pt-3">
              <button
                type="button"
                onClick={onToggleSampleProducts}
                className="text-[11px] text-[#8B4F58]/70 hover:text-[#8B4F58] hover:underline cursor-pointer"
              >
                Testing website layout? Click to preview sample items
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-[#F8E3E8] text-[10px] sm:text-[11px] text-[#9E9096]">
            Store Location: {BUSINESS_DETAILS.address.landmark}, {BUSINESS_DETAILS.address.area} (PIN {BUSINESS_DETAILS.address.pincode})
          </div>
        </div>
      )}

      {/* Populated Product Cards Grid */}
      {!isLoading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              onViewDetails={onViewDetails}
              onBuyNow={onBuyNow}
              orderMode={orderMode}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}

    </div>
  );
};
