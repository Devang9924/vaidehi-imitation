import React, { useState } from 'react';
import { 
  Sliders, 
  MessageCircle, 
  ShoppingBag, 
  CreditCard, 
  Banknote, 
  AlertTriangle, 
  Check, 
  Save, 
  Loader2,
  Info,
  Activity,

} from 'lucide-react';
import type { StoreSettings, OrderMode } from '../../types';
import { updateStoreSettings, getCachedStoreSettings } from '../../lib/storeSettings';

interface AdminOrderSettingsProps {
  settings?: StoreSettings;
  initialSettings?: StoreSettings;
  onRefreshSettings?: () => Promise<void>;
  onSettingsSaved?: (newSettings: StoreSettings) => void;
}

export const AdminOrderSettings: React.FC<AdminOrderSettingsProps> = ({
  settings: propsSettings,
  initialSettings,
  onRefreshSettings,
  onSettingsSaved,
}) => {
  const currentInitial = initialSettings || propsSettings || getCachedStoreSettings();
  const [orderMode, setOrderMode] = useState<OrderMode>(currentInitial.order_mode || 'whatsapp');
  const [razorpayEnabled, setRazorpayEnabled] = useState<boolean>(Boolean(currentInitial.razorpay_enabled));
  const [codEnabled, setCodEnabled] = useState<boolean>(Boolean(currentInitial.cod_enabled));

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Gateway Connection Diagnostic State
  const [isTestingGateway, setIsTestingGateway] = useState(false);
  const [testGatewayResult, setTestGatewayResult] = useState<{ 
    success: boolean; 
    message: string; 
    hint?: string 
  } | null>(null);

  // Check if Razorpay keys are configured in environment (browser checks publishable ID)
  const isRazorpayConfigured = typeof import.meta.env.VITE_RAZORPAY_KEY_ID === 'string' &&
    import.meta.env.VITE_RAZORPAY_KEY_ID.trim().length > 0;

  const handleTestGateway = async () => {
    setIsTestingGateway(true);
    setTestGatewayResult(null);

    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 100, // 100 paise = ₹1.00 minimum test order
          is_paise: true,
          is_test_ping: true,
          receipt: `diag_${Date.now()}`,
          notes: { purpose: 'admin_connection_test' },
        }),
      });

      const data = await res.json();

      if (res.ok && (data.order_id || data.orderId)) {
        setTestGatewayResult({
          success: true,
          message: `Gateway Authenticated Successfully! Razorpay connection is verified and operational (Order: ${data.order_id || data.orderId}).`,
        });
      } else {
        setTestGatewayResult({
          success: false,
          message: data.error || 'Connection failed to authenticate with Razorpay.',
          hint: data.hint,
        });
      }
    } catch (err: any) {
      setTestGatewayResult({
        success: false,
        message: err.message || 'Network error reaching payment gateway test endpoint.',
      });
    } finally {
      setIsTestingGateway(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const { success, settings: updated, error } = await updateStoreSettings({
        order_mode: orderMode,
        razorpay_enabled: razorpayEnabled,
        cod_enabled: codEnabled,
      });

      if (!success && error) {
        throw new Error(error);
      }

      setSaveSuccess(true);
      if (onRefreshSettings) {
        await onRefreshSettings();
      }
      if (onSettingsSaved) {
        onSettingsSaved(updated);
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update store settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Title & Description */}
      <div>
        <div className="flex items-center gap-2 text-[#8B4F58] mb-1">
          <Sliders className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Storefront Configuration
          </span>
        </div>
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1F1A1C]">
          Order & Payment Settings
        </h2>
        <p className="text-xs sm:text-sm text-[#5A4E53] mt-1 leading-relaxed">
          Configure whether customers place orders directly via WhatsApp or use the website shopping cart & online checkout.
        </p>
      </div>

      {/* 1. Order Mode Selection */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#FFF8F9] border border-[#F5D8E0] space-y-4">
        <h3 className="font-heading text-base font-bold text-[#1F1A1C] flex items-center justify-between">
          <span>A. Storefront Order Mode</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-white border border-[#F0C9D3] text-[#8B4F58]">
            Default: WhatsApp
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Option 1: WhatsApp Ordering */}
          <label
            className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
              orderMode === 'whatsapp'
                ? 'border-[#8B4F58] bg-white shadow-xs'
                : 'border-[#F0C9D3] bg-white/70 hover:bg-white'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span className="font-heading font-bold text-sm text-[#1F1A1C]">
                    Mode 1: WhatsApp Ordering
                  </span>
                </div>
                <input
                  type="radio"
                  name="order_mode"
                  value="whatsapp"
                  checked={orderMode === 'whatsapp'}
                  onChange={() => setOrderMode('whatsapp')}
                  className="text-[#8B4F58] focus:ring-[#8B4F58] w-4 h-4 cursor-pointer"
                />
              </div>

              <p className="text-xs text-[#5A4E53] leading-relaxed">
                Customers order and send inquiries through WhatsApp. Buy Now opens pre-filled WhatsApp messages with selected photo, price, and customer details.
              </p>

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Safest default • Fully operational without payment gateway</span>
              </div>
            </div>
          </label>

          {/* Option 2: Online Checkout */}
          <label
            className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
              orderMode === 'online_checkout'
                ? 'border-[#8B4F58] bg-white shadow-xs'
                : 'border-[#F0C9D3] bg-white/70 hover:bg-white'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FFF0F3] text-[#8B4F58] flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span className="font-heading font-bold text-sm text-[#1F1A1C]">
                    Mode 2: Online Checkout
                  </span>
                </div>
                <input
                  type="radio"
                  name="order_mode"
                  value="online_checkout"
                  checked={orderMode === 'online_checkout'}
                  onChange={() => setOrderMode('online_checkout')}
                  className="text-[#8B4F58] focus:ring-[#8B4F58] w-4 h-4 cursor-pointer"
                />
              </div>

              <p className="text-xs text-[#5A4E53] leading-relaxed">
                Enables website Shopping Cart drawer and dedicated Checkout page. Allows customers to buy multiple jewellery pieces at once.
              </p>

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-[#8B4F58] font-medium">
                <Info className="w-3.5 h-3.5" />
                <span>Requires enabled payment options (Razorpay or COD) below</span>
              </div>
            </div>
          </label>

        </div>
      </div>

      {/* 2. Payment Method Controls */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#FFF8F9] border border-[#F5D8E0] space-y-4">
        <div>
          <h3 className="font-heading text-base font-bold text-[#1F1A1C]">
            B. Payment Method Controls
          </h3>
          <p className="text-xs text-[#5A4E53] mt-0.5">
            Individual switches for each payment channel. Independent from the order mode.
          </p>
        </div>

        <div className="space-y-4">
          
          {/* Razorpay Toggle */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#F0C9D3] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#1F1A1C]">
                    Razorpay Online Payments
                  </h4>
                  <span className="text-[11px] text-gray-500">
                    UPI (GPay/PhonePe), Credit & Debit Cards, NetBanking
                  </span>
                </div>
              </div>

              {/* Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={razorpayEnabled}
                  onChange={(e) => setRazorpayEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B4F58]"></div>
              </label>
            </div>

            {/* Readiness Banner */}
            <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
              isRazorpayConfigured
                ? 'bg-blue-50 text-blue-900 border border-blue-200'
                : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}>
              {isRazorpayConfigured ? (
                <>
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold">Key Detected in Environment: </span>
                    <span>Client & server variables are present. Use the diagnostic test button below to verify whether the Key Secret matches Razorpay's API server.</span>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Gateway Credentials Pending: </span>
                    <span>Set <code>VITE_RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> in environment. If enabled without keys, customer checkout safely falls back to offline options.</span>
                  </div>
                </>
              )}
            </div>

            {/* Live Gateway Test Connection Button & Result */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] text-gray-500">
                  Verify API Key & Secret authenticity directly against Razorpay servers:
                </div>
                <button
                  type="button"
                  onClick={handleTestGateway}
                  disabled={isTestingGateway}
                  className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1F1A1C] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isTestingGateway ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8B4F58]" />
                      <span>Testing Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-3.5 h-3.5 text-[#8B4F58]" />
                      <span>Test Razorpay Connection</span>
                    </>
                  )}
                </button>
              </div>

              {testGatewayResult && (
                <div
                  className={`p-3 rounded-xl text-xs space-y-1.5 animate-fade-in ${
                    testGatewayResult.success
                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                      : 'bg-red-50 border border-red-300 text-red-900'
                  }`}
                >
                  <div className="flex items-start gap-2 font-medium">
                    {testGatewayResult.success ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <span>{testGatewayResult.message}</span>
                  </div>

                  {testGatewayResult.hint && (
                    <div className="text-[11px] pl-6 text-red-800/90 leading-relaxed bg-white/70 p-2 rounded-lg border border-red-200/60 mt-1">
                      <strong>Action Required:</strong> {testGatewayResult.hint}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cash on Delivery (COD) Toggle */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#F0C9D3] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#1F1A1C]">
                    Cash on Delivery (COD)
                  </h4>
                  <span className="text-[11px] text-gray-500">
                    Customer pays courier upon physical delivery
                  </span>
                </div>
              </div>

              {/* Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={codEnabled}
                  onChange={(e) => setCodEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B4F58]"></div>
              </label>
            </div>

            <p className="text-[11px] text-gray-500 pl-10">
              When disabled, Cash on Delivery is completely hidden from customers during checkout.
            </p>
          </div>

        </div>
      </div>

      {/* Feedback Messages */}
      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-fade-in font-medium">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Storefront settings saved successfully! Changes are active immediately.</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2 animate-fade-in font-medium">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-full bg-[#8B4F58] hover:bg-[#9E5863] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Order & Payment Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
