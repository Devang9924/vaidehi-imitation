import React from 'react';
import { MessageCircle, Phone, ShoppingBag } from 'lucide-react';
import { BUSINESS_DETAILS } from '../data/business';
import { createGeneralInquiryUrl } from '../lib/whatsapp';

export const MobileBottomBar: React.FC = () => {
  const scrollToCatalogue = () => {
    const el = document.getElementById('catalogue-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <aside aria-label="Quick mobile contact actions" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#F5D8E0] px-3 py-2 pb-safe shadow-lg animate-fade-in-up">
      <div className="flex items-center justify-between gap-1.5 min-[360px]:gap-2">
        
        {/* Browse Button */}
        <button
          onClick={scrollToCatalogue}
          className="flex-1 min-h-[44px] py-2 px-2.5 rounded-full bg-[#FFF0F3] text-[#8B4F58] text-xs font-semibold flex items-center justify-center gap-1.5 border border-[#F5B8C7] pressable cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
          <span>Catalogue</span>
        </button>

        {/* Call Button */}
        <a
          href={`tel:${BUSINESS_DETAILS.whatsappPhone}`}
          className="min-h-[44px] py-2 px-3 rounded-full border border-[#B76E79] text-[#8B4F58] text-xs font-semibold flex items-center justify-center gap-1 pressable"
        >
          <Phone className="w-3.5 h-3.5 shrink-0" />
          <span>Call</span>
        </a>

        {/* WhatsApp Button */}
        <a
          href={createGeneralInquiryUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-h-[44px] py-2 px-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs pressable"
        >
          <MessageCircle className="w-3.5 h-3.5 shrink-0" />
          <span>WhatsApp</span>
        </a>

      </div>
    </aside>
  );
};
