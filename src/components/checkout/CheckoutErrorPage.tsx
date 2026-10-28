import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Banknote,
  ShoppingBag,
  Phone,
  MessageCircle,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { getCheckoutError, getCheckoutDraft, saveCheckoutDraft, type CheckoutErrorInfo } from '../../lib/checkoutDraft';
import { getCartItems, getSelectedCartTotals } from '../../lib/cartStore';
import { formatINR } from '../../lib/whatsapp';
import { BUSINESS_DETAILS } from '../../data/business';

interface CheckoutErrorPageProps {
  onNavigate?: (route: string) => void;
  onBackToCheckout: () => void;
  onBackToShopping?: () => void;
  hasCod?: boolean;
}

export const CheckoutErrorPage: React.FC<CheckoutErrorPageProps> = ({
  onNavigate,
  onBackToCheckout,
  onBackToShopping,
  hasCod = true,
}) => {
  const [errorInfo, setErrorInfo] = useState<CheckoutErrorInfo | null>(() => getCheckoutError());
  const cartItems = getCartItems();
  const selectionMetrics = getSelectedCartTotals(cartItems);

  useEffect(() => {
    const current = getCheckoutError();
    if (current) setErrorInfo(current);
  }, []);

  const handleReturnToCheckout = () => {
    onBackToCheckout();
  };

  const handleSwitchToCodAndCheckout = () => {
    const draft = getCheckoutDraft();
    if (draft) {
      saveCheckoutDraft({
        ...draft,
        paymentMethod: 'cod',
      });
    }
    onBackToCheckout();
  };

  const handleGoToShopping = () => {
    if (onBackToShopping) onBackToShopping();
    else if (onNavigate) onNavigate('/');
    else window.location.href = '/';
  };

  const isPaymentFailure =
    errorInfo?.paymentMethod === 'razorpay' ||
    errorInfo?.code === 'PAYMENT_FAILED' ||
    errorInfo?.code === 'PAYMENT_CANCELLED' ||
    errorInfo?.code === 'SIGNATURE_MISMATCH' ||
    errorInfo?.code === 'PAYMENT_CAPTURE_FAILED';

  const isAuthError =
    errorInfo?.code === 'RAZORPAY_AUTHENTICATION_FAILED' ||
    errorInfo?.code === 'GATEWAY_CREDENTIALS_MISSING' ||
    errorInfo?.message?.toLowerCase().includes('authentication');

  const errorMessage =
    errorInfo?.message ||
    'An unexpected error interrupted your checkout session. Your items and entered details are safely saved.';

  // Build WhatsApp Support Link with prefilled context
  const waText = 'Hello Vaidehi Imitation, I encountered an issue during checkout on your website. Error: "' + errorMessage + '". Please assist me with completing my jewellery order.';
  const waUrl = 'https://wa.me/91' + BUSINESS_DETAILS.whatsappPhone + '?text=' + encodeURIComponent(waText);

  return (
    <div className="min-h-screen bg-[#FFF8F9] text-[#1F1A1C] flex flex-col antialiased">
      {/* Top Header */}
      <header className="bg-white border-b border-[#F5D8E0] sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleReturnToCheckout}
            className="flex items-center gap-1.5 text-xs text-[#8B4F58] font-semibold hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Checkout</span>
          </button>

          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Vaidehi Imitation Logo"
              className="w-7 h-7 rounded-full object-cover shrink-0 border border-[#D4A373] shadow-xs"
            />
            <span className="font-heading font-bold text-sm text-[#1F1A1C]">
              Vaidehi Imitation
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Bag Preserved</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 sm:py-12 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border border-[#F5D8E0] p-6 sm:p-8 shadow-sm space-y-6">

          {/* Status Icon & Title */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-700 shadow-2xs">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#1F1A1C] pt-2">
              {isPaymentFailure ? 'Payment Could Not Be Completed' : 'Checkout Interrupted'}
            </h1>

            <p className="text-xs sm:text-sm text-[#6E6267] max-w-md mx-auto leading-relaxed">
              We were unable to finalize your order due to an issue during the checkout process. Don't worry—your shopping bag and address are safe.
            </p>
          </div>

          {/* Error Details Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8F9] border border-[#F5B8C7] space-y-2">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B4F58]">
                Error Details
              </span>
              {errorInfo?.code && (
                <span className="text-[10px] font-mono bg-white text-rose-800 px-2 py-0.5 rounded-full border border-rose-200 font-semibold">
                  {errorInfo.code}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#3E3236] font-medium leading-relaxed">
              {errorMessage}
            </p>

            <p className="text-[11px] text-gray-500 pt-1 border-t border-[#F5D8E0]/60">
              {isPaymentFailure
                ? 'If any amount was debited by your bank or UPI app, it will be automatically reversed by your payment provider within 2-3 business days.'
                : 'Please verify the details on the checkout form and try again.'}
            </p>
          </div>

          {/* Preserved Order Status Banner */}
          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-3 text-emerald-900 text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-bold block">Your Shopping Bag & Address Are Preserved</span>
              <span className="text-[11px] text-emerald-800">
                {selectionMetrics.selectedCount} {selectionMetrics.selectedCount === 1 ? 'piece' : 'pieces'} selected ({formatINR(selectionMetrics.total)}). You do not need to re-enter your delivery address.
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            {/* Primary: Back to Checkout */}
            <button
              onClick={handleReturnToCheckout}
              className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#D4A373] via-[#B76E79] to-[#9E5863] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-98 transition-all cursor-pointer pressable"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Back to Checkout & Try Again</span>
            </button>

            {/* Optional COD Alternative when online payment fails */}
            {(isPaymentFailure || isAuthError) && hasCod && (
              <button
                onClick={handleSwitchToCodAndCheckout}
                className="w-full py-3 px-4 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <Banknote className="w-4 h-4 text-amber-700" />
                <span>Switch to Cash on Delivery (Pay Upon Arrival)</span>
              </button>
            )}

            {/* Secondary: Return to Cart */}
            <button
              onClick={handleGoToShopping}
              className="w-full py-2.5 px-4 rounded-full bg-white border border-[#E8C2CC] text-[#8B4F58] text-xs font-semibold hover:bg-[#FFF5F8] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Return to Shopping Bag & Jewellery</span>
            </button>
          </div>

          {/* Showroom Help & Assistance */}
          <div className="pt-4 border-t border-gray-100 text-center space-y-2.5">
            <p className="text-[11px] font-semibold text-[#6E6267]">
              Need direct help placing this order? Contact our showroom team:
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-0.5">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Order via WhatsApp</span>
              </a>

              <a
                href={'tel:+91' + BUSINESS_DETAILS.whatsappPhone}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 text-gray-800 border border-gray-300 text-xs font-semibold hover:bg-gray-100 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#8B4F58]" />
                <span>Call Showroom (+91 {BUSINESS_DETAILS.formattedPhone})</span>
              </a>
            </div>

            <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1 pt-1">
              <MapPin className="w-3 h-3 text-[#8B4F58]" />
              <span>{BUSINESS_DETAILS.brandName} • Dhasa Junction, Gadhada, Botad, Gujarat</span>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
};
