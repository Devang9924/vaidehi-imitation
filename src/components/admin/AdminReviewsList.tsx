import React, { useState, useEffect, useCallback } from 'react';
import { Star, CheckCircle, XCircle, Trash2, RefreshCw, MessageSquare, ShieldAlert, Check, Tag } from 'lucide-react';
import type { CustomerReview, ReviewStatus } from '../../types';
import {
  fetchAllReviewsForAdmin,
  updateReviewStatus,
  deleteReview,
  isSupabaseConfigured,
  updateLocalSubmittedReviewStatus,
  deleteLocalSubmittedReview,
} from '../../lib/supabase';

export const AdminReviewsList: React.FC = () => {
  const isSupabase = isSupabaseConfigured();
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [actionId, setActionId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { reviews: fetched, error: fetchErr } = await fetchAllReviewsForAdmin();
      if (fetchErr) {
        setError(fetchErr);
      } else {
        setReviews(fetched);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleStatusChange = async (id: string, newStatus: ReviewStatus) => {
    setActionId(id);
    setError(null);
    try {
      if (id.startsWith('local-rev-')) {
        updateLocalSubmittedReviewStatus(id, newStatus);
        setSuccessMsg(`Review marked as ${newStatus}`);
        setTimeout(() => setSuccessMsg(null), 3000);
        await loadReviews();
        window.dispatchEvent(new Event('vaidehi-reviews-updated'));
      } else {
        const { error: updateErr } = await updateReviewStatus(id, newStatus);
        if (updateErr) {
          setError(updateErr);
        } else {
          setSuccessMsg(`Review marked as ${newStatus}`);
          setTimeout(() => setSuccessMsg(null), 3000);
          await loadReviews();
          window.dispatchEvent(new Event('vaidehi-reviews-updated'));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update review status');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review permanently?')) return;
    setActionId(id);
    setError(null);
    try {
      if (id.startsWith('local-rev-')) {
        deleteLocalSubmittedReview(id);
        setSuccessMsg('Review deleted successfully');
        setTimeout(() => setSuccessMsg(null), 3000);
        await loadReviews();
        window.dispatchEvent(new Event('vaidehi-reviews-updated'));
      } else {
        const { error: delErr } = await deleteReview(id);
        if (delErr) {
          setError(delErr);
        } else {
          setSuccessMsg('Review deleted successfully');
          setTimeout(() => setSuccessMsg(null), 3000);
          await loadReviews();
          window.dispatchEvent(new Event('vaidehi-reviews-updated'));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete review');
    } finally {
      setActionId(null);
    }
  };

  const filteredReviews = reviews.filter((rev) => {
    if (filter === 'all') return true;
    return rev.status === filter;
  });

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;
  const rejectedCount = reviews.filter((r) => r.status === 'rejected').length;

  if (!isSupabase) {
    return (
      <div className="p-6 sm:p-8 text-center space-y-4 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="font-heading text-lg font-bold text-gray-900">
          Supabase Database Required
        </h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          Customer reviews and moderation require an active Supabase connection. Once you configure{' '}
          <code className="bg-gray-100 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and{' '}
          <code className="bg-gray-100 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> in your{' '}
          <code className="bg-gray-100 px-1 py-0.5 rounded">.env</code> file, all submitted reviews will appear here for your moderation.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 text-left">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h3 className="font-heading text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#8B4F58]" />
            <span>Customer Reviews Moderation</span>
          </h3>
          <p className="text-xs text-gray-500">
            Moderate public submissions. Only approved reviews appear on the live website.
          </p>
        </div>

        <button
          onClick={loadReviews}
          disabled={isLoading}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-[#8B4F58] text-white shadow-xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({reviews.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            filter === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
          }`}
        >
          <span>Pending ({pendingCount})</span>
          {pendingCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          )}
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            filter === 'approved'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          Approved ({approvedCount})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            filter === 'rejected'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
          }`}
        >
          Rejected ({rejectedCount})
        </button>
      </div>

      {/* Success notification */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="text-center py-10 text-xs text-gray-500">
          Loading reviews from database...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
          <p className="text-xs text-gray-500 font-medium">
            No reviews found matching "{filter}".
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((rev) => {
            const isActing = actionId === rev.id;
            const combined = `${rev.title || ''} ${rev.message || ''}`.toLowerCase();
            let linkedProduct: string | null = null;
            if (rev.product_code && rev.product_name) {
              linkedProduct = `${rev.product_code} • ${rev.product_name}`;
            } else if (rev.product_code) {
              linkedProduct = rev.product_code;
            } else if (rev.product_name) {
              linkedProduct = rev.product_name;
            } else if (combined.includes('vk 120') || combined.includes('vk-120') || combined.includes('ring')) {
              linkedProduct = 'VK 120 • ring';
            } else if (combined.includes('choker') || combined.includes('kundan') || combined.includes('necklace')) {
              linkedProduct = 'SAMPLE-VI-NK-01 • Royal Kundan Choker Necklace Set';
            } else if (combined.includes('kada') || combined.includes('lion') || combined.includes('bracelet')) {
              linkedProduct = 'SAMPLE-VI-KD-02 • Traditional Rajputi Lion Kada Bracelet';
            }

            return (
              <div
                key={rev.id}
                className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs hover:border-[#F5B8C7] transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900">
                      {rev.customer_name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      • {new Date(rev.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {rev.status === 'pending' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        Pending Moderation
                      </span>
                    )}
                    {rev.status === 'approved' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Approved (Visible)
                      </span>
                    )}
                    {rev.status === 'rejected' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                        Rejected (Hidden)
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating & Content */}
                <div className="space-y-1.5">
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
                    <span className="text-[11px] text-gray-500 font-medium pl-1">
                      {rev.rating}/5
                    </span>
                  </div>

                  {/* Associated Product Badge */}
                  {linkedProduct && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#8B4F58] bg-[#FFF0F3] border border-[#F5B8C7] px-2.5 py-1 rounded-lg w-fit">
                      <Tag className="w-3 h-3 text-[#B76E79]" />
                      <span>
                        <strong>Associated Product:</strong> {linkedProduct}
                      </span>
                    </div>
                  )}

                  {rev.title && (
                    <h5 className="font-semibold text-xs text-gray-800">
                      {rev.title}
                    </h5>
                  )}

                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                    "{rev.message}"
                  </p>
                </div>

                {/* Moderation Actions */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2 text-xs">
                  {rev.status !== 'approved' && (
                    <button
                      onClick={() => handleStatusChange(rev.id, 'approved')}
                      disabled={isActing}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                      title="Approve review for public display"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {rev.status !== 'rejected' && (
                    <button
                      onClick={() => handleStatusChange(rev.id, 'rejected')}
                      disabled={isActing}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                      title="Reject review from public display"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(rev.id)}
                    disabled={isActing}
                    className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                    title="Permanently delete review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
