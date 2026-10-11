import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Star, Sparkles, Search, ChevronLeft, ChevronRight, CheckCircle, Tag } from 'lucide-react';
import { SAMPLE_REVIEWS_LIST } from '../data/sampleReviews';
import type { CustomerReview } from '../types';
import { fetchApprovedReviews, supabase } from '../lib/supabase';

export interface UnifiedReviewItem {
  id: string;
  customer_name: string;
  rating: number;
  title: string;
  message: string;
  city?: string;
  date: string;
  product_code?: string;
  product_name?: string;
  created_at?: string;
}

export const SampleReviewsSection: React.FC = () => {
  // Database approved customer reviews state
  const [approvedCustomerReviews, setApprovedCustomerReviews] = useState<CustomerReview[]>([]);
  const [isLoadingCustomerReviews, setIsLoadingCustomerReviews] = useState<boolean>(true);

  // Filter & Search states
  const [selectedRating, setSelectedRating] = useState<'all' | 5 | 4 | 3>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Load genuine approved customer reviews from Supabase
  const loadApprovedReviews = useCallback(async () => {
    try {
      const { reviews, error } = await fetchApprovedReviews();
      if (!error && reviews) {
        setApprovedCustomerReviews(reviews);
      }
    } catch (err) {
      console.warn('Failed to fetch approved customer reviews', err);
    } finally {
      setIsLoadingCustomerReviews(false);
    }
  }, []);

  useEffect(() => {
    void loadApprovedReviews();

    // Listen to focus event to refresh when returning to page
    const handleFocus = () => {
      void loadApprovedReviews();
    };
    window.addEventListener('focus', handleFocus);

    // Listen to custom event dispatched when reviews are moderated in Admin Panel
    const handleCustomUpdate = () => {
      void loadApprovedReviews();
    };
    window.addEventListener('vaidehi-reviews-updated', handleCustomUpdate);

    // Subscribe to Supabase Realtime changes on public.reviews if configured
    let channel: any = null;
    if (supabase) {
      try {
        channel = supabase
          .channel('public:reviews-live-approved')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'reviews' },
            () => {
              void loadApprovedReviews();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime subscription not available', err);
      }
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('vaidehi-reviews-updated', handleCustomUpdate);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadApprovedReviews]);

  // Combine approved customer reviews + all 100 existing reviews
  const allUnifiedReviews: UnifiedReviewItem[] = useMemo(() => {
    // 1. Approved customer reviews from Supabase
    const formattedCustomer: UnifiedReviewItem[] = approvedCustomerReviews.map((cr) => ({
      id: cr.id,
      customer_name: cr.customer_name,
      rating: cr.rating,
      title: cr.title || '',
      message: cr.message,
      date: new Date(cr.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      product_code: cr.product_code,
      product_name: cr.product_name,
      created_at: cr.created_at,
    }));

    // 2. All 100 existing reviews dataset
    const formattedExisting: UnifiedReviewItem[] = SAMPLE_REVIEWS_LIST.map((sr) => ({
      id: sr.id,
      customer_name: sr.customer_name,
      rating: sr.rating,
      title: sr.title,
      message: sr.message,
      city: sr.city,
      date: sr.date,
    }));

    return [...formattedCustomer, ...formattedExisting];
  }, [approvedCustomerReviews]);

  // Overall reviews stats across all displayed reviews
  const totalCount = allUnifiedReviews.length;
  const avgRating = useMemo(() => {
    if (totalCount === 0) return '5.0';
    const total = allUnifiedReviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / totalCount).toFixed(1);
  }, [allUnifiedReviews, totalCount]);

  // Filter reviews based on Rating and Search
  const filteredReviews = useMemo(() => {
    return allUnifiedReviews.filter((rev) => {
      // Rating filter
      if (selectedRating !== 'all' && rev.rating !== selectedRating) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = rev.customer_name.toLowerCase().includes(q);
        const matchTitle = rev.title.toLowerCase().includes(q);
        const matchMsg = rev.message.toLowerCase().includes(q);
        const matchCity = rev.city ? rev.city.toLowerCase().includes(q) : false;
        const matchProd = rev.product_code
          ? rev.product_code.toLowerCase().includes(q) || (rev.product_name || '').toLowerCase().includes(q)
          : false;
        return matchName || matchTitle || matchMsg || matchCity || matchProd;
      }
      return true;
    });
  }, [allUnifiedReviews, selectedRating, searchQuery]);

  // Reset pagination on filter changes
  const handleRatingChange = (rating: 'all' | 5 | 4 | 3) => {
    setSelectedRating(rating);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage) || 1;
  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReviews.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReviews, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const el = document.getElementById('sample-reviews-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Counts for star rating filters
  const count5 = allUnifiedReviews.filter((r) => r.rating === 5).length;
  const count4 = allUnifiedReviews.filter((r) => r.rating === 4).length;
  const count3 = allUnifiedReviews.filter((r) => r.rating === 3).length;

  return (
    <div id="sample-reviews-container" className="mb-10 text-left">
      {/* 1. Header & Summary Stats */}
      <div className="bg-gradient-to-r from-[#FFF5F8] via-white to-[#FFF5F8] border border-[#F5D8E0] rounded-2xl p-4 sm:p-5 mb-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF0F3] border border-[#F5B8C7] text-[#8B4F58] text-[11px] font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#B76E79]" />
                <span>Customer Experiences</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>★ {avgRating}/5 Average Rating ({totalCount} Reviews)</span>
              </span>

              {isLoadingCustomerReviews && (
                <span className="text-[10px] text-[#8B4F58] bg-[#FFF0F3] px-2 py-0.5 rounded-full animate-pulse">
                  Syncing...
                </span>
              )}
            </div>

            <h3 className="font-heading text-lg sm:text-xl font-bold text-[#1F1A1C]">
              Customer Experiences & Reviews
            </h3>
          </div>

          <span className="text-[11px] text-[#8B4F58] bg-white px-2.5 py-1 rounded-full border border-[#F0C9D3] self-start sm:self-auto font-medium shrink-0">
            {totalCount} Customer Reviews
          </span>
        </div>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-2.5 mb-4 p-2.5 sm:p-3 bg-white rounded-2xl border border-[#F5D8E0] shadow-2xs">
        
        {/* Rating filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => handleRatingChange('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap pressable ${
              selectedRating === 'all'
                ? 'bg-[#8B4F58] text-white shadow-xs'
                : 'bg-[#FFF8F9] text-[#5A4E53] hover:bg-[#FCECEF]'
            }`}
          >
            All Reviews ({totalCount})
          </button>

          <button
            onClick={() => handleRatingChange(5)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap pressable ${
              selectedRating === 5
                ? 'bg-[#8B4F58] text-white shadow-xs'
                : 'bg-[#FFF8F9] text-[#5A4E53] hover:bg-[#FCECEF]'
            }`}
          >
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>5★ ({count5})</span>
          </button>

          <button
            onClick={() => handleRatingChange(4)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap pressable ${
              selectedRating === 4
                ? 'bg-[#8B4F58] text-white shadow-xs'
                : 'bg-[#FFF8F9] text-[#5A4E53] hover:bg-[#FCECEF]'
            }`}
          >
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>4★ ({count4})</span>
          </button>

          <button
            onClick={() => handleRatingChange(3)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap pressable ${
              selectedRating === 3
                ? 'bg-[#8B4F58] text-white shadow-xs'
                : 'bg-[#FFF8F9] text-[#5A4E53] hover:bg-[#FCECEF]'
            }`}
          >
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>3★ ({count3})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-56 md:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reviews by name or text..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#F0C9D3] bg-[#FFFDFC] text-xs focus:outline-hidden focus:ring-1 focus:ring-[#B76E79]"
          />
        </div>
      </div>

      {/* Showing count indicator */}
      <div className="flex items-center justify-between text-xs text-[#6E6267] mb-3 px-1">
        <span>
          Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> – <strong>{Math.min(currentPage * itemsPerPage, filteredReviews.length)}</strong> of <strong>{filteredReviews.length}</strong> reviews
        </span>
        <span>
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* 3. Cards Grid: Consistent design for every review card */}
      {paginatedReviews.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#F5D8E0] space-y-2">
          <p className="text-xs sm:text-sm text-[#6E6267]">
            No reviews match your selected filters or search query "{searchQuery}".
          </p>
          <button
            onClick={() => {
              setSelectedRating('all');
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="text-xs text-[#8B4F58] font-semibold underline cursor-pointer"
          >
            Reset review filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {paginatedReviews.map((rev, idx) => (
            <div
              key={rev.id}
              style={{ animationDelay: `${(idx % 9) * 60}ms` }}
              className="animate-fade-in-up bg-white rounded-2xl p-4 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-2.5 h-full border border-[#F5D8E0] hover:border-[#F5B8C7]"
            >
              <div className="space-y-2">
                {/* Rating & Verified Badge */}
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= rev.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                    <span className="text-[11px] font-bold text-[#8B4F58] pl-1">
                      {rev.rating}/5
                    </span>
                  </div>

                  <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-medium tracking-wide flex items-center gap-1 shadow-2xs">
                    <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Verified Review</span>
                  </span>
                </div>

                {/* Associated Product if present */}
                {(rev.product_code || rev.product_name) && (
                  <div className="flex items-center gap-1 text-[10px] text-[#8B4F58] bg-[#FFF0F3] border border-[#F5B8C7] px-2 py-0.5 rounded-md w-fit">
                    <Tag className="w-2.5 h-2.5 text-[#B76E79]" />
                    <span className="truncate max-w-[200px]">
                      {rev.product_code} {rev.product_name ? `• ${rev.product_name}` : ''}
                    </span>
                  </div>
                )}

                {/* Review Title */}
                {rev.title && (
                  <h4 className="font-heading font-semibold text-xs sm:text-sm text-[#1F1A1C] leading-snug line-clamp-1">
                    {rev.title}
                  </h4>
                )}

                {/* Review Message */}
                <p className="text-xs text-[#5A4E53] leading-relaxed line-clamp-3">
                  "{rev.message}"
                </p>
              </div>

              {/* Footer Info */}
              <div className="pt-2 border-t border-[#F8E3E8] flex items-center justify-between text-[11px] text-gray-500">
                <span className="font-semibold text-[#8B4F58] truncate max-w-[140px]">
                  {rev.customer_name}
                </span>
                <span className="text-[#9E9096] text-[10px] sm:text-[11px] shrink-0">
                  {rev.city ? `${rev.city} • ` : ''}{rev.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Compact Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-[#F5D8E0] shadow-2xs">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-xl border border-[#F0C9D3] text-xs font-semibold text-[#8B4F58] hover:bg-[#FFF0F3] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer pressable"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1 ||
                (currentPage <= 3 && page <= 4) ||
                (currentPage >= totalPages - 2 && page >= totalPages - 3)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer pressable ${
                      currentPage === page
                        ? 'bg-[#8B4F58] text-white shadow-xs'
                        : 'text-[#5A4E53] hover:bg-[#FFF0F3]'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                (page === 2 && currentPage > 3) ||
                (page === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return (
                  <span key={page} className="text-xs text-gray-400 px-0.5">
                    •••
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-xl border border-[#F0C9D3] text-xs font-semibold text-[#8B4F58] hover:bg-[#FFF0F3] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer pressable"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
