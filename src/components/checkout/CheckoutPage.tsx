import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Banknote,
  AlertCircle,
  Loader2,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  CheckSquare,
  Square,
} from 'lucide-react';
import type { CartItem, StoreSettings, OrderItem, PaymentEnvironment, Order } from '../../types';
import {
  getCartTotals,
  removePurchasedItems,
  getCartItems,
  subscribeToCart,
  toggleCartItemSelection,
  selectAllCartItems,
  getSelectedCartTotals
} from '../../lib/cartStore';
import {
  saveCheckoutDraft,
  getCheckoutDraft,
  clearCheckoutDraft,
  saveCheckoutError,
  clearCheckoutError,
  type CheckoutCustomerDraft
} from '../../lib/checkoutDraft';
import { getCachedStoreSettings } from '../../lib/storeSettings';
import { createCustomerOrder, saveLocalOrder } from '../../lib/orderService';
import { formatINR } from '../../lib/whatsapp';
import { BUSINESS_DETAILS } from '../../data/business';

interface CheckoutPageProps {
  items?: CartItem[];
  settings?: StoreSettings;
  onNavigateHome?: () => void;
  onBackToShopping?: () => void;
  onNavigate?: (route: string) => void;
  onOrderSuccess: (orderNumber: string) => void;
}

const generateReceiptId = (): string => {
  return "rcpt_" + Math.floor(Date.now() / 1000) + "_" + Math.floor(Math.random() * 1000);
};

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items: propsItems,
  settings: propsSettings,
  onNavigateHome,
  onBackToShopping,
  onNavigate,
  onOrderSuccess,
}) => {
  const settings = propsSettings || getCachedStoreSettings();

  // Internal reactive cart state
  const [internalItems, setInternalItems] = useState<CartItem[]>(() => propsItems || getCartItems());

  useEffect(() => {
    if (propsItems) {
      setInternalItems(propsItems);
    }
  }, [propsItems]);

  useEffect(() => {
    const unsubscribe = subscribeToCart((updated) => {
      setInternalItems(updated);
    });
    return unsubscribe;
  }, []);

  const allCartItems = propsItems || internalItems;
  const selectionMetrics = useMemo(() => getSelectedCartTotals(allCartItems), [allCartItems]);
  const selectedItems = selectionMetrics.selectedItems;
  const totals = useMemo(() => getCartTotals(selectedItems), [selectedItems]);

  const handleBack = () => {
    if (onBackToShopping) onBackToShopping();
    else if (onNavigateHome) onNavigateHome();
    else if (onNavigate) onNavigate('/');
    else window.history.back();
  };

  // Saved Draft Retrieval
  const savedDraft = useMemo(() => getCheckoutDraft(), []);

  // Form Fields (Restored from draft if available)
  const [fullName, setFullName] = useState<string>(() => savedDraft?.fullName || '');
  const [mobileNumber, setMobileNumber] = useState<string>(() => savedDraft?.mobileNumber || '');
  const [address, setAddress] = useState<string>(() => savedDraft?.address || '');
  const [city, setCity] = useState<string>(() => savedDraft?.city || '');
  const [stateName, setStateName] = useState<string>(() => savedDraft?.stateName || 'Gujarat');
  const [pincode, setPincode] = useState<string>(() => savedDraft?.pincode || '');
  const [notes, setNotes] = useState<string>(() => savedDraft?.notes || '');

  // Payment Selection: In Online Checkout Mode, ONLY genuine enabled methods are allowed
  const hasRazorpay = Boolean(settings.razorpay_enabled);
  const hasCod = Boolean(settings.cod_enabled);
  const hasAnyPaymentMethod = hasRazorpay || hasCod;

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod' | ''>(() => {
    if (savedDraft?.paymentMethod) {
      if (savedDraft.paymentMethod === 'razorpay' && hasRazorpay) return 'razorpay';
      if (savedDraft.paymentMethod === 'cod' && hasCod) return 'cod';
    }
    if (hasRazorpay) return 'razorpay';
    if (hasCod) return 'cod';
    return '';
  });

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Automatically preserve form inputs into draft
  useEffect(() => {
    const draft: CheckoutCustomerDraft = {
      fullName,
      mobileNumber,
      address,
      city,
      stateName,
      pincode,
      notes,
      paymentMethod,
    };
    saveCheckoutDraft(draft);
  }, [fullName, mobileNumber, address, city, stateName, pincode, notes, paymentMethod]);

  // Centralized Error Redirection Helper
  const redirectToError = (
    message: string,
    code?: string,
    options?: { suggestCod?: boolean; paymentMethod?: 'razorpay' | 'cod' | '' }
  ) => {
    saveCheckoutDraft({
      fullName,
      mobileNumber,
      address,
      city,
      stateName,
      pincode,
      notes,
      paymentMethod,
    });
    saveCheckoutError({
      message,
      code: code || 'CHECKOUT_ERROR',
      paymentMethod: options?.paymentMethod ?? paymentMethod,
      suggestCod: options?.suggestCod,
      timestamp: Date.now(),
    });
    setIsSubmitting(false);
    if (onNavigate) {
      onNavigate('/checkout-error');
    } else {
      window.location.href = '/checkout-error';
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = 'Please enter your full name.';
    } else if (fullName.trim().length < 3) {
      errs.fullName = 'Full name must be at least 3 characters.';
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (!cleanMobile) {
      errs.mobileNumber = 'Please enter your 10-digit mobile number.';
    } else if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      errs.mobileNumber = 'Please enter a valid 10-digit Indian mobile number.';
    }

    if (!address.trim()) {
      errs.address = 'Please enter complete delivery address (House/Shop No., Street, Landmark).';
    } else if (address.trim().length < 8) {
      errs.address = 'Please provide a more detailed address for accurate courier delivery.';
    }

    if (!city.trim()) {
      errs.city = 'Please enter town or city name.';
    }

    if (!pincode.trim()) {
      errs.pincode = 'Please enter 6-digit postal PIN code.';
    } else if (!/^[1-9][0-9]{5}$/.test(pincode.trim())) {
      errs.pincode = 'PIN code must be a valid 6-digit Indian postal code.';
    }

    if (!paymentMethod) {
      errs.paymentMethod = 'Please select an available payment method.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) return;

    if (allCartItems.length === 0) {
      redirectToError('Your shopping bag is empty. Please select jewellery items to purchase.', 'EMPTY_CART');
      return;
    }

    if (selectedItems.length === 0) {
      redirectToError('No pieces are selected for checkout. Please select the items you wish to purchase and try again.', 'NO_ITEMS_SELECTED');
      return;
    }

    if (!hasAnyPaymentMethod) {
      redirectToError('No payment methods are currently active. Please contact our showroom at +91 ' + BUSINESS_DETAILS.formattedPhone + '.', 'NO_PAYMENT_METHOD');
      return;
    }

    if (!validateForm()) {
      const errs: Record<string, string> = {};
      if (!fullName.trim() || fullName.trim().length < 3) errs.fullName = 'Please enter a valid full name.';
      const cleanMobile = mobileNumber.replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanMobile)) errs.mobileNumber = 'Please enter a valid 10-digit mobile number.';
      if (!address.trim() || address.trim().length < 8) errs.address = 'Please provide a complete delivery address.';
      if (!city.trim()) errs.city = 'Please enter city/town.';
      if (!/^[1-9][0-9]{5}$/.test(pincode.trim())) errs.pincode = 'Please enter a valid 6-digit PIN code.';
      if (!paymentMethod) errs.paymentMethod = 'Please choose a payment method.';

      const firstErr = Object.values(errs)[0] || 'Please complete all required fields correctly.';
      redirectToError(firstErr, 'VALIDATION_ERROR');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems: OrderItem[] = selectedItems.map((i) => ({
        product_id: i.product.id,
        product_name: i.product.name,
        product_code: i.product.code,
        product_image: i.selectedImageUrl || (i.product.images && i.product.images[0]) || '',
        quantity: i.quantity,
        unit_price: i.unit_price,
        subtotal: i.unit_price * i.quantity,
      }));

      // Purchased item IDs to remove from cart strictly upon success
      const purchasedItemIds = selectedItems.map((i) => i.id);

      // A. Online Razorpay Standard Checkout
      if (paymentMethod === 'razorpay') {
        const receiptId = generateReceiptId();

        // Call backend create-order endpoint with items for server-side validation
        const orderResponse = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: orderItems,
            customer_name: fullName.trim(),
            customer_phone: mobileNumber.trim(),
            shipping_address: address.trim(),
            city: city.trim(),
            state: stateName.trim(),
            pincode: pincode.trim(),
            notes: notes.trim(),
            payment_method: 'razorpay',
            receipt: receiptId,
          }),
        });

        const orderData = await orderResponse.json();

        if (!orderResponse.ok || !orderData.order_id) {
          const isAuth = orderResponse.status === 401 || orderData.code === 'RAZORPAY_AUTHENTICATION_FAILED';
          const errMsg = isAuth
            ? 'Online payment gateway is temporarily unavailable (Authentication Failed). Please select Cash on Delivery or contact our showroom.'
            : orderData.error || orderData.message || 'Online payment gateway is temporarily unavailable. Please try Cash on Delivery or contact our showroom.';

          redirectToError(errMsg, orderData.code || (isAuth ? 'RAZORPAY_AUTHENTICATION_FAILED' : 'CREATE_ORDER_FAILED'), {
            suggestCod: hasCod,
            paymentMethod: 'razorpay',
          });
          return;
        }

        const serverOrderId = orderData.order_id || orderData.orderId;
        const serverOrderNumber = orderData.order_number || '';
        const serverPaymentEnv: PaymentEnvironment = orderData.payment_env || 'unknown';
        const razorpayKey =
          orderData.key_id ||
          orderData.keyId ||
          (import.meta.env.VITE_RAZORPAY_KEY_ID as string);

        if (!razorpayKey) {
          redirectToError('Payment gateway configuration is incomplete. Please contact our showroom.', 'GATEWAY_CREDENTIALS_MISSING', {
            suggestCod: hasCod,
            paymentMethod: 'razorpay',
          });
          return;
        }

        // Open Razorpay Standard Checkout Modal
        await new Promise<void>((resolve, reject) => {
          const loadScript = () => {
            if ((window as any).Razorpay) return Promise.resolve();
            return new Promise((res, rej) => {
              const script = document.createElement('script');
              script.src = 'https://checkout.razorpay.com/v1/checkout.js';
              script.onload = () => res(true);
              script.onerror = () => rej(new Error('Failed to load Razorpay payment window. Please check your internet connection or choose Cash on Delivery.'));
              document.body.appendChild(script);
            });
          };

          loadScript()
            .then(() => {
              const rzp = new (window as any).Razorpay({
                key: razorpayKey,
                amount: orderData.amount,
                currency: orderData.currency || 'INR',
                name: BUSINESS_DETAILS.brandName,
                description: 'Order Payment (' + totals.totalQuantity + ' ' + (totals.totalQuantity === 1 ? 'piece' : 'pieces') + ')',
                order_id: serverOrderId,
                prefill: {
                  name: fullName.trim(),
                  contact: mobileNumber.trim(),
                },
                theme: {
                  color: '#8B4F58',
                },
                handler: async (response: {
                  razorpay_order_id: string;
                  razorpay_payment_id: string;
                  razorpay_signature: string;
                }) => {
                  try {
                    // Send parameters to backend verify endpoint
                    const verifyRes = await fetch('/api/verify-payment', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        order_id: response.razorpay_order_id,
                        payment_id: response.razorpay_payment_id,
                        signature: response.razorpay_signature,
                        order_number: serverOrderNumber,
                      }),
                    });

                    const verifyData = await verifyRes.json();
                    if (!verifyRes.ok || (!verifyData.success && !verifyData.verified)) {
                      throw new Error(verifyData.error || 'Payment signature verification could not be confirmed.');
                    }

                    const confirmedOrderNumber = verifyData.order_number || serverOrderNumber;
                    const finalOrder: Order = verifyData.order || {
                      id: 'ord-' + Date.now(),
                      order_number: confirmedOrderNumber,
                      customer_name: fullName.trim(),
                      customer_phone: mobileNumber.trim(),
                      shipping_address: address.trim(),
                      city: city.trim(),
                      state: stateName.trim(),
                      pincode: pincode.trim(),
                      notes: notes.trim(),
                      items: orderItems,
                      subtotal: totals.subtotal,
                      shipping_fee: totals.shippingFee,
                      total: totals.total,
                      payment_method: 'razorpay',
                      payment_status: 'verified',
                      payment_env: verifyData.payment_env || serverPaymentEnv,
                      order_status: 'confirmed',
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    };

                    // Cache locally as immediate backup
                    saveLocalOrder(finalOrder);

                    // Remove ONLY purchased items; leave unselected items in cart
                    removePurchasedItems(purchasedItemIds);
                    clearCheckoutDraft();
                    clearCheckoutError();
                    resolve();
                    onOrderSuccess(confirmedOrderNumber);
                  } catch (err: any) {
                    reject(err);
                  }
                },
                modal: {
                  ondismiss: () => {
                    redirectToError(
                      'Payment window was closed before completing the transaction. You can try again or choose Cash on Delivery.',
                      'PAYMENT_CANCELLED',
                      { suggestCod: hasCod, paymentMethod: 'razorpay' }
                    );
                  },
                },
              });

              rzp.on('payment.failed', (resp: any) => {
                const failReason = resp.error?.description || resp.error?.reason || 'Payment transaction failed with your payment provider.';
                redirectToError(failReason, 'PAYMENT_FAILED', { suggestCod: hasCod, paymentMethod: 'razorpay' });
              });

              rzp.open();
            })
            .catch((scriptErr: any) => {
              redirectToError(
                scriptErr.message || 'Unable to connect to Razorpay payment window. Please check your internet connection or choose Cash on Delivery.',
                'SCRIPT_LOAD_ERROR',
                { suggestCod: hasCod, paymentMethod: 'razorpay' }
              );
            });
        });

        return;
      }

      // B. Cash On Delivery (COD)
      if (paymentMethod === 'cod') {
        const { order, error: orderErr } = await createCustomerOrder({
          customer_name: fullName.trim(),
          customer_phone: mobileNumber.trim(),
          shipping_address: address.trim(),
          city: city.trim(),
          state: stateName.trim(),
          pincode: pincode.trim(),
          notes: notes.trim(),
          items: orderItems,
          subtotal: totals.subtotal,
          shipping_fee: totals.shippingFee,
          total: totals.total,
          payment_method: 'cod',
          payment_status: 'cod_pending',
          payment_env: 'cod',
          order_status: 'pending',
        });

        if (orderErr || !order) {
          redirectToError(orderErr || 'Failed to place Cash on Delivery order.', 'COD_ORDER_ERROR', { paymentMethod: 'cod' });
          return;
        }

        // Remove ONLY purchased items; leave unselected items in cart
        removePurchasedItems(purchasedItemIds);
        clearCheckoutDraft();
        clearCheckoutError();
        onOrderSuccess(order.order_number);
        return;
      }

    } catch (err: any) {
      redirectToError(err.message || 'An unexpected error occurred during order processing.', 'PROCESSING_ERROR');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If entire shopping bag has 0 items
  if (allCartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF8F9] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-[#F5D8E0] p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#FFF0F3] border border-[#F5B8C7] flex items-center justify-center mx-auto text-[#8B4F58]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-xl font-bold text-[#1F1A1C]">
            Your Shopping Bag is Empty
          </h2>
          <p className="text-xs text-[#6E6267] leading-relaxed">
            There are no items in your shopping bag to checkout. Please explore our jewellery catalogue to add items.
          </p>
          <button
            onClick={handleBack}
            className="w-full py-2.5 rounded-full bg-[#8B4F58] text-white text-xs font-semibold hover:bg-[#9E5863] transition-colors cursor-pointer"
          >
            Return to Catalogue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF9FA] text-[#1F1A1C] antialiased">
      {/* Top Header */}
      <header className="bg-white border-b border-[#F5D8E0] sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-[#FFF0F3] transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFF0F3] to-[#FCE4E9] border border-[#D4A373] flex items-center justify-center font-brand font-bold text-xs text-[#8B4F58]">
              VI
            </div>
            <span className="font-heading font-bold text-sm sm:text-base text-[#1F1A1C]">
              Secure Checkout
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">SSL 256-bit Secure</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Delivery & Payment Details */}
          <div className="lg:col-span-7 space-y-6">

            {/* Delivery Address Card */}
            <div className="bg-white rounded-3xl border border-[#F5D8E0] p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <MapPin className="w-5 h-5 text-[#8B4F58]" />
                <h2 className="font-heading text-base font-bold text-[#1F1A1C]">
                  Delivery Address & Recipient
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-[#4A3F44] flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#8B4F58]" />
                    <span>Customer Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priyaben Patel"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={'w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-[#FFFDFC] focus:outline-hidden focus:ring-2 focus:ring-[#8B4F58] ' + (errors.fullName ? 'border-red-400 bg-red-50/30' : 'border-[#F0C9D3]')}
                  />
                  {errors.fullName && <p className="text-[11px] text-red-600">{errors.fullName}</p>}
                </div>

                {/* Mobile Number */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-[#4A3F44] flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#8B4F58]" />
                    <span>Mobile Number (for Courier & Updates) *</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9876543210"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      className={'w-full pl-12 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-[#FFFDFC] focus:outline-hidden focus:ring-2 focus:ring-[#8B4F58] ' + (errors.mobileNumber ? 'border-red-400 bg-red-50/30' : 'border-[#F0C9D3]')}
                    />
                  </div>
                  {errors.mobileNumber && <p className="text-[11px] text-red-600">{errors.mobileNumber}</p>}
                </div>

                {/* Street Address */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-[#4A3F44]">
                    House / Flat No., Society / Street Name & Landmark *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. 102, Gokul Dham Society, Near Station Road"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={'w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-[#FFFDFC] focus:outline-hidden focus:ring-2 focus:ring-[#8B4F58] ' + (errors.address ? 'border-red-400 bg-red-50/30' : 'border-[#F0C9D3]')}
                  />
                  {errors.address && <p className="text-[11px] text-red-600">{errors.address}</p>}
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4A3F44]">City / Town *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Botad, Bhavnagar, Ahmedabad"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={'w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-[#FFFDFC] focus:outline-hidden focus:ring-2 focus:ring-[#8B4F58] ' + (errors.city ? 'border-red-400 bg-red-50/30' : 'border-[#F0C9D3]')}
                  />
                  {errors.city && <p className="text-[11px] text-red-600">{errors.city}</p>}
                </div>

                {/* State */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4A3F44]">State *</label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0C9D3] text-xs sm:text-sm bg-[#FFFDFC] focus:outline-hidden focus:ring-2 focus:ring-[#8B4F58]"
                  />
                </div>

                {/* PIN Code */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-[#4A3F44]">
                    6-Digit Postal PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="364740"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    className={'w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-[#FFFDFC] focus:outline-hidden focus:ring-2 focus:ring-[#8B4F58] ' + (errors.pincode ? 'border-red-400 bg-red-50/30' : 'border-[#F0C9D3]')}
                  />
                  {errors.pincode && <p className="text-[11px] text-red-600">{errors.pincode}</p>}
                </div>

                {/* Special Delivery Notes */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-[#4A3F44]">
                    Special Order Notes / Sizing Requests (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ring size 14, or deliver after 5 PM"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0C9D3] text-xs sm:text-sm bg-[#FFFDFC] focus:outline-hidden focus:ring-2 focus:ring-[#8B4F58]"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Card: Only Genuine Available Methods in Online Mode */}
            <div className="bg-white rounded-3xl border border-[#F5D8E0] p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <CreditCard className="w-5 h-5 text-[#8B4F58]" />
                <h2 className="font-heading text-base font-bold text-[#1F1A1C]">
                  Select Payment Method
                </h2>
              </div>

              {!hasAnyPaymentMethod ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>No Payment Methods Currently Available</span>
                  </div>
                  <p className="leading-relaxed">
                    Online payments and Cash on Delivery are currently not enabled in our system settings. Please contact our showroom at <strong>{BUSINESS_DETAILS.formattedPhone}</strong> to inquire and place your order directly.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* 1. Razorpay Option */}
                  {hasRazorpay && (
                    <label
                      className={'flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ' + (paymentMethod === 'razorpay' ? 'border-[#8B4F58] bg-[#FFF8F9] ring-2 ring-[#8B4F58]/20' : 'border-[#F0C9D3] bg-white hover:bg-gray-50')}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="mt-1 text-[#8B4F58] focus:ring-[#8B4F58]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs sm:text-sm text-[#1F1A1C]">
                            Razorpay Online Payment (UPI, Cards, NetBanking)
                          </span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                            Instant Confirmation
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6E6267] mt-1">
                          Pay securely with Google Pay, PhonePe, Paytm, Debit/Credit Card, or NetBanking via official Razorpay modal.
                        </p>
                      </div>
                    </label>
                  )}

                  {/* 2. Cash on Delivery (COD) Option */}
                  {hasCod && (
                    <label
                      className={'flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ' + (paymentMethod === 'cod' ? 'border-[#8B4F58] bg-[#FFF8F9] ring-2 ring-[#8B4F58]/20' : 'border-[#F0C9D3] bg-white hover:bg-gray-50')}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-1 text-[#8B4F58] focus:ring-[#8B4F58]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs sm:text-sm text-[#1F1A1C]">
                            Cash on Delivery (COD)
                          </span>
                          <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                            Pay Upon Delivery
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6E6267] mt-1">
                          Pay in cash when your parcel is delivered by our courier partner.
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              )}

              {errors.paymentMethod && (
                <p className="text-[11px] text-red-600">{errors.paymentMethod}</p>
              )}
            </div>

          </div>

          {/* Right Column: Order Summary & Placement with Multi-product selection controls */}
          <div className="lg:col-span-5 space-y-6">

            <div className="bg-white rounded-3xl border border-[#F5D8E0] p-6 shadow-2xs space-y-5 sticky top-24">

              {/* Summary Header with Select All / Deselect All */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="font-heading text-base font-bold text-[#1F1A1C]">
                    Order Summary
                  </h2>
                  <span className="text-[11px] text-[#8B4F58] font-semibold">
                    {selectionMetrics.selectedCount} of {selectionMetrics.totalItemsCount} pieces selected ({selectionMetrics.selectedQuantity} {selectionMetrics.selectedQuantity === 1 ? 'item' : 'items'})
                  </span>
                </div>

                {allCartItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => selectAllCartItems(!selectionMetrics.allSelected)}
                    className="flex items-center gap-1.5 text-xs text-[#8B4F58] hover:text-[#6A3940] font-semibold transition-colors cursor-pointer"
                  >
                    {selectionMetrics.allSelected ? (
                      <>
                        <CheckSquare className="w-4 h-4 text-[#8B4F58]" />
                        <span>Deselect All</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-4 h-4 text-gray-400" />
                        <span>Select All</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Items List with Individual Selection Checkboxes */}
              <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                {allCartItems.map((item) => {
                  const isSelected = item.selected !== false;
                  return (
                    <div
                      key={item.id}
                      className={'flex gap-3 text-xs items-center p-2.5 rounded-2xl transition-all border ' + (isSelected ? 'border-[#F5D8E0] bg-[#FFFDFC]' : 'border-gray-200 bg-gray-50/60 opacity-60')}
                    >
                      {/* Selection Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleCartItemSelection(item.id)}
                        className="text-[#8B4F58] hover:scale-110 transition-transform shrink-0 p-0.5 cursor-pointer"
                        aria-label={isSelected ? ('Deselect ' + item.product.name) : ('Select ' + item.product.name)}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#8B4F58]" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>

                      <div className="w-12 h-12 rounded-lg bg-[#FFF5F8] border border-[#F0C9D3] p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={item.selectedImageUrl || (item.product.images && item.product.images[0]) || '/images/sample-necklace-1.jpg'}
                          alt={item.product.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/sample-necklace-1.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-[10px] text-[#8B4F58] block truncate font-bold">
                          {item.product.code}
                        </span>
                        <h4 className="font-medium text-[#1F1A1C] truncate leading-tight">
                          {item.product.name}
                        </h4>
                        <span className="text-gray-500 text-[10px]">Qty: {item.quantity}</span>
                      </div>
                      <span className="font-bold text-[#1F1A1C] shrink-0">
                        {formatINR(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Warning when no pieces are selected */}
              {selectionMetrics.noneSelected && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>No pieces selected. Please select at least one piece above to proceed with order.</span>
                </div>
              )}

              {/* Financial Calculation */}
              <div className="space-y-2 pt-3 border-t border-gray-100 text-xs text-[#5A4E53]">
                <div className="flex justify-between">
                  <span>Selected Pieces</span>
                  <span className="font-semibold text-[#1F1A1C]">
                    {totals.totalQuantity} {totals.totalQuantity === 1 ? 'piece' : 'pieces'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1F1A1C]">{formatINR(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Courier Delivery Charges</span>
                  <span className="text-emerald-700 font-semibold">Free Delivery</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#F0C9D3] text-base font-bold text-[#1F1A1C]">
                  <span>Total Payable</span>
                  <span className="text-[#8B4F58]">{formatINR(totals.total)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || !hasAnyPaymentMethod || !paymentMethod || selectionMetrics.noneSelected}
                className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#D4A373] via-[#B76E79] to-[#9E5863] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer pressable"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : !hasAnyPaymentMethod ? (
                  <span>Payment Methods Currently Unavailable</span>
                ) : selectionMetrics.noneSelected ? (
                  <span>Select Items Above to Proceed</span>
                ) : paymentMethod === 'razorpay' ? (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay {formatINR(totals.total)} with Razorpay</span>
                  </>
                ) : paymentMethod === 'cod' ? (
                  <>
                    <Banknote className="w-4 h-4" />
                    <span>Place Cash on Delivery Order ({formatINR(totals.total)})</span>
                  </>
                ) : (
                  <span>Select Payment Method to Proceed</span>
                )}
              </button>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Genuine Certified Jewellery ? Showroom in Dhasa</span>
              </div>

            </div>

          </div>

        </form>
      </main>
    </div>
  );
};
