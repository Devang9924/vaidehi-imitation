import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import type { CartItem, StoreSettings, OrderItem, PaymentEnvironment, Order } from '../../types';
import { getCartTotals, removePurchasedItems, getCartItems } from '../../lib/cartStore';
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
  return `rcpt_${Math.floor(Date.now() / 1000)}_${Math.floor(Math.random() * 1000)}`;
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
  
  // Filter strictly to selected cart items for checkout
  const rawItems = propsItems || getCartItems();
  const selectedItems = useMemo(
    () => rawItems.filter((i) => i.selected !== false),
    [rawItems]
  );
  
  const totals = useMemo(() => getCartTotals(selectedItems), [selectedItems]);

  const handleBack = () => {
    if (onBackToShopping) onBackToShopping();
    else if (onNavigateHome) onNavigateHome();
    else if (onNavigate) onNavigate('/');
    else window.history.back();
  };

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Gujarat');
  const [pincode, setPincode] = useState('');
  const [notes, setNotes] = useState('');

  // Payment Selection: In Online Checkout Mode, ONLY genuine enabled methods are allowed
  const hasRazorpay = Boolean(settings.razorpay_enabled);
  const hasCod = Boolean(settings.cod_enabled);
  const hasAnyPaymentMethod = hasRazorpay || hasCod;

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod' | ''>(() => {
    if (hasRazorpay) return 'razorpay';
    if (hasCod) return 'cod';
    return '';
  });

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<{ message: string; isAuthError?: boolean } | null>(null);

  // Validate form
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = 'Please enter your full name.';
    } else if (fullName.trim().length < 3) {
      errs.fullName = 'Name must be at least 3 characters.';
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
    setServerError(null);

    if (isSubmitting) return;

    if (selectedItems.length === 0) {
      setServerError({ message: 'No items are selected for checkout. Please return to your shopping bag and select items.' });
      return;
    }

    if (!hasAnyPaymentMethod) {
      setServerError({ message: 'No payment methods are currently active. Please contact our showroom at +91 96875 99517.' });
      return;
    }

    if (!validateForm()) {
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

      // Purchased item IDs to remove from cart upon completion
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

          setServerError({ message: errMsg, isAuthError: isAuth });
          setIsSubmitting(false);
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
          throw new Error('Payment gateway configuration is incomplete.');
        }

        // Open Razorpay Standard Checkout Modal
        await new Promise<void>((resolve, reject) => {
          const loadScript = () => {
            if ((window as any).Razorpay) return Promise.resolve();
            return new Promise((res, rej) => {
              const script = document.createElement('script');
              script.src = 'https://checkout.razorpay.com/v1/checkout.js';
              script.onload = () => res(true);
              script.onerror = () => rej(new Error('Failed to load Razorpay payment window.'));
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
                description: `Order Payment (${totals.totalQuantity} items)`,
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
                      throw new Error(verifyData.error || 'Payment signature verification failed.');
                    }

                    const confirmedOrderNumber = verifyData.order_number || serverOrderNumber;
                    const finalOrder: Order = verifyData.order || {
                      id: `ord-${Date.now()}`,
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
                    resolve();
                    onOrderSuccess(confirmedOrderNumber);
                  } catch (err: any) {
                    reject(err);
                  }
                },
                modal: {
                  ondismiss: () => {
                    reject(new Error('Payment window was closed before completion. You can try again or choose Cash on Delivery.'));
                  },
                },
              });

              rzp.on('payment.failed', (resp: any) => {
                const failReason = resp.error?.description || resp.error?.reason || 'Payment transaction failed.';
                reject(new Error(failReason));
              });

              rzp.open();
            })
            .catch(reject);
        });

        return;
      }

      // B. Cash On Delivery (COD) - Preserved exactly as required
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
          throw new Error(orderErr || 'Failed to place Cash on Delivery order.');
        }

        // Remove ONLY purchased items; leave unselected items in cart
        removePurchasedItems(purchasedItemIds);
        onOrderSuccess(order.order_number);
        return;
      }

    } catch (err: any) {
      setServerError({ message: err.message || 'An unexpected error occurred during order processing.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If no items are selected for checkout
  if (selectedItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF8F9] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-[#F5D8E0] p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#FFF0F3] border border-[#F5B8C7] flex items-center justify-center mx-auto text-[#8B4F58]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-xl font-bold text-[#1F1A1C]">
            No Items Selected for Checkout
          </h2>
          <p className="text-xs text-[#6E6267] leading-relaxed">
            {rawItems.length > 0
              ? 'You have pieces in your cart, but none are selected. Please open your shopping bag and check the items you wish to purchase.'
              : 'There are no items in your shopping bag to checkout. Please explore our jewellery catalogue to add items.'}
          </p>
          <button
            onClick={handleBack}
            className="w-full py-2.5 rounded-full bg-[#8B4F58] text-white text-xs font-semibold hover:bg-[#9E5863] transition-colors cursor-pointer"
          >
            {rawItems.length > 0 ? 'Return to Shopping Bag' : 'Return to Catalogue'}
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
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-[#FFFDFC] focus:outline-hidden focus:ring-2 focus:ring-[#8B4F58] ${
                      errors.fullName ? 'border-red-400 bg-red-50/30' : 'border-[#F0C9D3]'
                    }`}
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
                      className={`w-full pl-12 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-[#FFFDFC] focus:outline-hidden focus:ring-2 focus:ring-[#8B4F58] ${
                        errors.mobileNumber ? 'border-red-400 bg-red-50/30' : 'border-[#F0C9D3]'
                      }`}
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
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-[#FFFDFC] focus:outline-hidden focus:ring-2 focus:ring-[#8B4F58] ${
                      errors.address ? 'border-red-400 bg-red-50/30' : 'border-[#F0C9D3]'
                    }`}
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
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-[#FFFDFC] focus:outline-hidden focus:ring-2 focus:ring-[#8B4F58] ${
                      errors.city ? 'border-red-400 bg-red-50/30' : 'border-[#F0C9D3]'
                    }`}
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
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-[#FFFDFC] focus:outline-hidden focus:ring-2 focus:ring-[#8B4F58] ${
                      errors.pincode ? 'border-red-400 bg-red-50/30' : 'border-[#F0C9D3]'
                    }`}
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
                  {/* 1. Razorpay Option (Displayed only when enabled) */}
                  {hasRazorpay && (
                    <label
                      className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === 'razorpay'
                          ? 'border-[#8B4F58] bg-[#FFF8F9] ring-2 ring-[#8B4F58]/20'
                          : 'border-[#F0C9D3] bg-white hover:bg-gray-50'
                      }`}
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

                  {/* 2. Cash on Delivery (COD) Option (Displayed only when enabled in Admin settings) */}
                  {hasCod && (
                    <label
                      className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-[#8B4F58] bg-[#FFF8F9] ring-2 ring-[#8B4F58]/20'
                          : 'border-[#F0C9D3] bg-white hover:bg-gray-50'
                      }`}
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

          {/* Right Column: Order Summary & Placement */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-3xl border border-[#F5D8E0] p-6 shadow-2xs space-y-5 sticky top-24">
              <h2 className="font-heading text-base font-bold text-[#1F1A1C] border-b border-gray-100 pb-3">
                Order Summary ({totals.totalQuantity} {totals.totalQuantity === 1 ? 'item' : 'items'})
              </h2>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex gap-3 text-xs items-center">
                    <div className="w-12 h-12 rounded-lg bg-[#FFF5F8] border border-[#F0C9D3] p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.selectedImageUrl || (item.product.images && item.product.images[0]) || '/images/sample-necklace-1.jpg'}
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-[10px] text-[#8B4F58] block truncate">
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
                ))}
              </div>

              {/* Financial Calculation */}
              <div className="space-y-2 pt-3 border-t border-gray-100 text-xs text-[#5A4E53]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1F1A1C]">{formatINR(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="text-emerald-700 font-semibold">Free Delivery</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#F0C9D3] text-base font-bold text-[#1F1A1C]">
                  <span>Total Amount</span>
                  <span className="text-[#8B4F58]">{formatINR(totals.total)}</span>
                </div>
              </div>

              {/* Error Callout */}
              {serverError && (
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-xs text-amber-950 space-y-2.5 animate-fade-in shadow-2xs">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{serverError.message}</span>
                  </div>

                  {serverError.isAuthError && hasCod && (
                    <div className="pt-2 border-t border-amber-200/80">
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod('cod');
                          setServerError(null);
                        }}
                        className="w-full py-1.5 px-3 rounded-xl bg-white border border-amber-400 text-amber-900 font-semibold text-[11px] hover:bg-amber-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Banknote className="w-3.5 h-3.5 text-amber-700" />
                        <span>Switch to Cash on Delivery</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || !hasAnyPaymentMethod || !paymentMethod}
                className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#D4A373] via-[#B76E79] to-[#9E5863] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer pressable"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : !hasAnyPaymentMethod ? (
                  <span>Payment Methods Currently Unavailable</span>
                ) : paymentMethod === 'razorpay' ? (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay {formatINR(totals.total)} with Razorpay</span>
                  </>
                ) : paymentMethod === 'cod' ? (
                  <>
                    <Banknote className="w-4 h-4" />
                    <span>Place Cash on Delivery Order</span>
                  </>
                ) : (
                  <span>Select Payment Method to Proceed</span>
                )}
              </button>

              <div className="text-center text-[10px] text-gray-400 space-y-1 pt-1">
                <p>Secured with 256-bit SSL encryption</p>
                <p>Showroom Support: +91 96875 99517 • Dhasa Junction, Gujarat.</p>
              </div>
            </div>

          </div>

        </form>
      </main>
    </div>
  );
};
