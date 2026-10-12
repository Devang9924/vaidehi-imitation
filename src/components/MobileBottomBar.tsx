import React from 'react';
import { MessageCircle, Phone, ShoppingBag } from 'lucide-react';
import { BUSINESS_DETAILS } from '../data/business';
import { createGeneralInquiryUrl } from '../lib/whatsapp';
import type { OrderMode } from '../types';

interface MobileBottomBarProps {
  orderMode?: OrderMode;
  cartItemCount?: number;
  onOpenCart?: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  orderMode = 'whatsapp',
  cartItemCount = 0,
  onOpenCart,
}) => {
  const scrollToCatalogue = () => {
    const el = document.getElementById('catalogue-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <aside aria-label="Quick mobile actions" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#F5D8E0] px-3 py-2 pb-safe shadow-lg animate-fade-in-up">
      <div className="flex items-center justify-between gap-1.5 min-[360px]:gap-2">
        
        {/* Browse Catalogue Button */}
        <button
          onClick={scrollToCatalogue}
          className="flex-1 min-h-[44px] py-2 px-2.5 rounded-full bg-[#FFF0F3] text-[#8B4F58] text-xs font-semibold flex items-center justify-center gap-1.5 border border-[#F5B8C7] pressable cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
          <span>Catalogue</span>
        </button>

        {orderMode === 'online_checkout' ? (
          <>
            {/* Shopping Bag Button in Checkout Mode */}
            <button
              onClick={onOpenCart}
              className="flex-1 min-h-[44px] py-2 px-2.5 rounded-full bg-gradient-to-r from-[#D4A373] via-[#B76E79] to-[#9E5863] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs pressable cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>Bag ({cartItemCount})</span>
            </button>

            {/* Support Call or WhatsApp Button */}
            <a
              href={createGeneralInquiryUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] py-2 px-3 rounded-full border border-emerald-500 text-emerald-700 bg-emerald-50 text-xs font-semibold flex items-center justify-center gap-1 pressable"
              title="Customer Support"
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Help</span>
            </a>
          </>
        ) : (
          <>
            {/* Call Button in WhatsApp Mode */}
            <a
              href={`tel:${BUSINESS_DETAILS.whatsappPhone}`}
              className="min-h-[44px] py-2 px-3 rounded-full border border-[#B76E79] text-[#8B4F58] text-xs font-semibold flex items-center justify-center gap-1 pressable"
            >
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>Call</span>
            </a>

            {/* WhatsApp Order Button in WhatsApp Mode */}
            <a
              href={createGeneralInquiryUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-h-[44px] py-2 px-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs pressable"
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
              <span>WhatsApp</span>
            </a>
          </>
        )}

      </div>
    </aside>
  );
};
