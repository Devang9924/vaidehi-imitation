import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  ArrowLeft, 
  Clock,
  Phone,
  MapPin
} from 'lucide-react';
import type { Order } from '../../types';
import { getLocalOrders } from '../../lib/orderService';
import { formatINR } from '../../lib/whatsapp';

interface OrderConfirmationPageProps {
  orderNumber?: string;
  onNavigateHome?: () => void;
  onNavigate?: (route: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderNumber: propOrderNumber,
  onNavigateHome,
  onNavigate,
}) => {
  const [order, setOrder] = useState<Order | null>(null);

  const activeOrderNumber = propOrderNumber || (() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('order') || '';
    }
    return '';
  })();

  useEffect(() => {
    if (activeOrderNumber) {
      const orders = getLocalOrders();
      const found = orders.find((o) => o.order_number === activeOrderNumber);
      if (found) {
        setOrder(found);
      }
    }
  }, [activeOrderNumber]);

  const handleBack = () => {
    if (onNavigateHome) onNavigateHome();
    else if (onNavigate) onNavigate('/');
    else window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#FFF8F9] text-[#1F1A1C] flex flex-col antialiased">
      {/* Top Header */}
      <header className="bg-white border-b border-[#F5D8E0]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-[#FFF0F3] transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Store</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFF0F3] to-[#FCE4E9] border border-[#D4A373] flex items-center justify-center font-brand font-bold text-xs text-[#8B4F58]">
              VI
            </div>
            <span className="font-heading font-bold text-sm sm:text-base text-[#1F1A1C]">
              Vaidehi Imitation
            </span>
          </div>

          <div className="w-16"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-4 sm:p-6 my-6">
        <div className="bg-white rounded-3xl border border-[#F5D8E0] shadow-sm p-6 sm:p-8 space-y-6 text-center animate-fade-in-up">
          
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#8B4F58]">
              Order Successfully Registered
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1F1A1C] mt-1">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6267] mt-2 max-w-md mx-auto leading-relaxed">
              We have received your order details and are preparing your jewellery for dispatch from our Dhasa Junction showroom.
            </p>
          </div>

          {/* Reference Pill */}
          <div className="bg-[#FFF8F9] border border-[#F0C9D3] rounded-2xl p-4 text-center space-y-1">
            <span className="text-[11px] text-[#8B4F58] font-bold block uppercase tracking-wider">
              Order Reference Number
            </span>
            <span className="font-mono text-lg sm:text-xl font-bold text-[#1F1A1C]">
              {order ? order.order_number : activeOrderNumber || 'VI-ORD-PROCESSING'}
            </span>
          </div>

          {/* Order Details Summary if available */}
          {order && (
            <div className="border border-gray-100 rounded-2xl p-4 text-left space-y-3 bg-[#FDF9FA] text-xs">
              <h3 className="font-heading font-bold text-sm text-[#1F1A1C] border-b border-gray-200 pb-2 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-[11px] font-normal text-gray-500">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </span>
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-gray-700">
                    <span className="truncate pr-2">
                      {item.product_name} <span className="text-[#8B4F58] font-mono">({item.product_code})</span> x{item.quantity}
                    </span>
                    <span className="font-semibold shrink-0">{formatINR(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm text-[#1F1A1C]">
                <span>Total Amount:</span>
                <span className="text-[#8B4F58]">{formatINR(order.total)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-[11px] text-gray-600">
                <div>
                  <span className="font-semibold block text-gray-800">Recipient:</span>
                  <span>{order.customer_name}</span>
                </div>
                <div>
                  <span className="font-semibold block text-gray-800">Phone:</span>
                  <span>+91 {order.customer_phone}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold block text-gray-800">Delivery Address:</span>
                  <span>{order.shipping_address}, {order.city}, {order.state} - {order.pincode}</span>
                </div>
                <div>
                  <span className="font-semibold block text-gray-800">Payment:</span>
                  <span className="capitalize font-medium">
                    {order.payment_method === 'razorpay'
                      ? 'Razorpay Online (Paid)'
                      : order.payment_method === 'cod'
                        ? 'Cash on Delivery (Pending)'
                        : order.payment_method}
                  </span>
                </div>
                <div>
                  <span className="font-semibold block text-gray-800">Order Status:</span>
                  <span className="capitalize text-emerald-700 font-semibold">{order.order_status}</span>
                </div>
              </div>
            </div>
          )}

          {/* Delivery & Timeline Notice */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FFFDF5] border border-amber-200 text-left text-xs text-amber-900">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-amber-950">Dispatch & Delivery Information</p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Your order is processed at our Dhasa Junction showroom. Expected delivery time will be confirmed by the showroom upon courier dispatch.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleBack}
              className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-[#D4A373] via-[#B76E79] to-[#9E5863] text-white text-xs sm:text-sm font-semibold transition-all hover:brightness-105 shadow-xs cursor-pointer"
            >
              Continue Browsing Catalogue
            </button>
          </div>

          {/* Customer Support Information */}
          <div className="pt-3 border-t border-gray-100 space-y-1.5 text-[11px] text-gray-600">
            <div className="flex items-center justify-center gap-1.5 text-gray-700 font-medium">
              <Phone className="w-3.5 h-3.5 text-[#8B4F58]" />
              <span>Showroom Contact & Support: +91 96875 99517</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>Near Bank of Baroda, Dhasa Junction, Botad, Gujarat 364740</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
