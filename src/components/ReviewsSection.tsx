import React, { useState } from 'react';
import { Star, ShieldCheck, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ReviewFormData } from '../types';
import { submitCustomerReview, isSupabaseConfigured } from '../lib/supabase';
import { SampleReviewsSection } from './SampleReviewsSection';

export const ReviewsSection: React.FC = () => {
  // Form states
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  
  // Submission feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formValidationErrors, setFormValidationErrors] = useState<{ [key: string]: string }>({});

  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};
    const sanitizedName = customerName.trim();
    const sanitizedMsg = message.trim();

    if (!sanitizedName || sanitizedName.length < 2) {
      errors.name = 'Please enter your name (at least 2 characters).';
    }

    if (rating < 1 || rating > 5) {
      errors.rating = 'Please select a rating between 1 and 5 stars.';
    }

    if (!sanitizedMsg || sanitizedMsg.length < 10) {
      errors.message = 'Please write a review message (at least 10 characters).';
    }

    setFormValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validate()) return;

    // Rate-limiting check: Prevent rapid duplicate submissions within 60 seconds
    const lastSubmitTime = localStorage.getItem('vaidehi_last_review_time');
    if (lastSubmitTime && Date.now() - Number(lastSubmitTime) < 60000) {
      setErrorMessage('You recently submitted a review. Please wait a minute before submitting another.');
      return;
    }

    // Sanitize input
    const cleanName = customerName.replace(/<[^>]*>?/gm, '').trim();
    const cleanTitle = title.replace(/<[^>]*>?/gm, '').trim();
    const cleanMessage = message.replace(/<[^>]*>?/gm, '').trim();

    // Associate product where applicable based on mention in title or message
    let matchedProductCode: string | undefined;
    let matchedProductName: string | undefined;
    const combinedText = `${cleanTitle} ${cleanMessage}`.toLowerCase();
    if (combinedText.includes('vk 120') || combinedText.includes('vk-120') || combinedText.includes('ring')) {
      matchedProductCode = 'VK 120';
      matchedProductName = 'ring';
    } else if (combinedText.includes('kundan') || combinedText.includes('choker') || combinedText.includes('vi-nk-01')) {
      matchedProductCode = 'SAMPLE-VI-NK-01';
      matchedProductName = 'Royal Kundan Choker Necklace Set';
    } else if (combinedText.includes('lion') || combinedText.includes('kada') || combinedText.includes('vi-kd-02')) {
      matchedProductCode = 'SAMPLE-VI-KD-02';
      matchedProductName = 'Traditional Rajputi Lion Kada Bracelet';
    }

    const payload: ReviewFormData = {
      customer_name: cleanName,
      rating,
      title: cleanTitle,
      message: cleanMessage,
      product_code: matchedProductCode,
      product_name: matchedProductName,
    };

    setIsSubmitting(true);
    try {
      const { success, error } = await submitCustomerReview(payload);
      if (success) {
        localStorage.setItem('vaidehi_last_review_time', String(Date.now()));
        setSuccessMessage('Thank you! Your review has been submitted for moderation and will appear in the Admin Portal for review.');
        // Reset form
        setCustomerName('');
        setTitle('');
        setMessage('');
        setRating(5);
        setFormValidationErrors({});
      } else {
        setErrorMessage(error || 'Failed to submit review.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while submitting your review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reviews-section" className="py-12 sm:py-16 bg-[#FFF9FA] border-b border-[#F5D8E0] scroll-mt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#F5B8C7] text-[#8B4F58] text-xs font-semibold uppercase tracking-wider shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Customer Experiences</span>
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-[#1F1A1C] mt-2">
            Customer Reviews
          </h2>
          <p className="text-xs sm:text-sm text-[#6E6267] mt-1 font-light leading-relaxed">
            Read approved customer feedback and demonstration samples below, or share your own experience.
          </p>
        </div>

        {/* 1. Website Review Display: 100 Clearly Labelled Sample Reviews (Above the form) */}
        <SampleReviewsSection />

        {/* 2. Customer Review Submission Form (EXACTLY preserved design, fields, rating selector & submit button) */}
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#F5D8E0] p-6 sm:p-9 shadow-sm text-left space-y-6">
          <div className="border-b border-[#F8E3E8] pb-4">
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#1F1A1C]">
              Share Your Review
            </h3>
            <p className="text-xs text-[#6E6267] mt-1">
              Your feedback helps us maintain quality. Submitted reviews are moderated before appearing on the website.
            </p>
          </div>

          {/* Success Alert */}
          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Review Submitted</strong>
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Submission Notice</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs sm:text-sm">
            
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3F44] mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={60}
                placeholder="e.g. Priyaben Patel"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-[#B76E79] ${
                  formValidationErrors.name ? 'border-red-400 bg-red-50/20' : 'border-[#F0C9D3] bg-[#FFFDFC]'
                }`}
              />
              {formValidationErrors.name && (
                <p className="text-[11px] text-red-600 mt-1">{formValidationErrors.name}</p>
              )}
            </div>

            {/* Star Rating Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3F44] mb-1">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 focus:outline-hidden transform hover:scale-110 transition-transform cursor-pointer"
                    aria-label={`${star} star rating`}
                  >
                    <Star
                      className={`w-6 h-6 sm:w-7 sm:h-7 ${
                        star <= (hoverRating ?? rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-200'
                      } transition-colors`}
                    />
                  </button>
                ))}
                <span className="text-xs text-[#8B4F58] font-semibold pl-2">
                  {rating} of 5 Stars
                </span>
              </div>
              {formValidationErrors.rating && (
                <p className="text-[11px] text-red-600 mt-1">{formValidationErrors.rating}</p>
              )}
            </div>

            {/* Review Title (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3F44] mb-1">
                Review Title <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                maxLength={100}
                placeholder="e.g. Beautiful Kundan Choker for Wedding"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0C9D3] bg-[#FFFDFC] text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-[#B76E79]"
              />
            </div>

            {/* Review Message */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3F44] mb-1">
                Review Details <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                maxLength={1000}
                placeholder="Share your experience regarding the jewellery design, showroom visit, or WhatsApp consultation..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-[#B76E79] ${
                  formValidationErrors.message ? 'border-red-400 bg-red-50/20' : 'border-[#F0C9D3] bg-[#FFFDFC]'
                }`}
              />
              {formValidationErrors.message && (
                <p className="text-[11px] text-red-600 mt-1">{formValidationErrors.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-gradient-to-r from-[#D4A373] via-[#B76E79] to-[#9E5863] text-white font-semibold text-xs sm:text-sm shadow-sm hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting Review...' : 'Submit Review'}</span>
            </button>

            {!isSupabaseConfigured() && (
              <p className="text-[11px] text-[#9E9096] pt-1">
                Note: Online review storage is configured via Supabase backend.
              </p>
            )}

          </form>
        </div>

      </div>
    </section>
  );
};
