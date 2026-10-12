import React from 'react';
import { MapPin, Phone, MessageCircle, Clock, ShieldCheck, ArrowUp } from 'lucide-react';
import { BUSINESS_DETAILS, CATEGORIES_LIST } from '../data/business';
import { createGeneralInquiryUrl } from '../lib/whatsapp';
import type { ProductCategory } from '../types';
import { InstagramIcon } from './icons/InstagramIcon';

const CURRENT_YEAR = new Date().getFullYear();

interface FooterProps {
  onSelectCategory: (category: ProductCategory) => void;
  onNavigate?: (path: string) => void;
  showSampleProducts?: boolean;
  onToggleSampleProducts?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onNavigate,
}) => {
  const handlePolicyClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState(null, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1C1618] text-[#D8CFD2] pt-14 pb-28 sm:pb-12 border-t border-[#3A2D32]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid: 4 Balanced Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 pb-12 border-b border-[#3A2D32] text-left">
          
          {/* 1. Brand Info (4 cols) */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ECC8AF] to-[#B76E79] flex items-center justify-center font-brand font-bold text-base text-white shadow-2xs">
                VI
              </div>
              <div>
                <span className="block font-brand text-lg font-bold tracking-wider text-white uppercase">
                  {BUSINESS_DETAILS.brandName}
                </span>
                <span className="block text-[10px] tracking-wider uppercase text-[#D4A373]">
                  Dhasa Junction, Gujarat
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#B3A6AB] leading-relaxed max-w-sm font-light">
              Showroom in Dhasa Junction specializing in bridal jewellery, Kundan sets, bangles, and men's traditional kadas. Managed by <strong>{BUSINESS_DETAILS.ownerName}</strong>.
            </p>

            <div className="pt-2 flex items-center space-x-3">
              <a
                href={BUSINESS_DETAILS.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#2C2326] hover:bg-[#C13584] text-white flex items-center justify-center transition-colors"
                title="Follow on Instagram"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>

              <a
                href={createGeneralInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#2C2326] hover:bg-emerald-600 text-white flex items-center justify-center transition-colors"
                title="Message on WhatsApp"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>

              <a
                href={`tel:${BUSINESS_DETAILS.whatsappPhone}`}
                className="w-9 h-9 rounded-full bg-[#2C2326] hover:bg-[#B76E79] text-white flex items-center justify-center transition-colors"
                title="Call Store"
                aria-label="Phone"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 2. Quick Category Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading text-base font-semibold text-white tracking-wide">
              Jewellery Categories
            </h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
              {CATEGORIES_LIST.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                    const el = document.getElementById('catalogue-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-left text-[#B3A6AB] hover:text-[#ECC8AF] transition-colors py-0.5 truncate cursor-pointer"
                >
                  • {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Policies & Customer Support (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading text-base font-semibold text-white tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#D4A373]" />
              <span>Policies & Support</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/privacy-policy"
                  onClick={(e) => handlePolicyClick('/privacy-policy', e)}
                  className="text-[#B3A6AB] hover:text-[#ECC8AF] transition-colors block py-0.5"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms-and-conditions"
                  onClick={(e) => handlePolicyClick('/terms-and-conditions', e)}
                  className="text-[#B3A6AB] hover:text-[#ECC8AF] transition-colors block py-0.5"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a
                  href="/shipping-policy"
                  onClick={(e) => handlePolicyClick('/shipping-policy', e)}
                  className="text-[#B3A6AB] hover:text-[#ECC8AF] transition-colors block py-0.5"
                >
                  Shipping & Delivery
                </a>
              </li>
              <li>
                <a
                  href="/cancellation-refund-policy"
                  onClick={(e) => handlePolicyClick('/cancellation-refund-policy', e)}
                  className="text-[#B3A6AB] hover:text-[#ECC8AF] transition-colors block py-0.5"
                >
                  Cancellation & Refund
                </a>
              </li>
              <li>
                <a
                  href="/payment-policy"
                  onClick={(e) => handlePolicyClick('/payment-policy', e)}
                  className="text-[#B3A6AB] hover:text-[#ECC8AF] transition-colors block py-0.5"
                >
                  Payment Policy
                </a>
              </li>
              <li>
                <a
                  href="/contact-us"
                  onClick={(e) => handlePolicyClick('/contact-us', e)}
                  className="text-[#B3A6AB] hover:text-[#ECC8AF] transition-colors block py-0.5"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* 4. Showroom & Hours (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading text-base font-semibold text-white tracking-wide">
              Showroom Contact
            </h4>
            <div className="text-xs space-y-2.5 text-[#B3A6AB]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D4A373] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {BUSINESS_DETAILS.address.landmark}, {BUSINESS_DETAILS.address.line1}, {BUSINESS_DETAILS.address.area}, Taluka Gadhada, Dist. Botad, Gujarat - {BUSINESS_DETAILS.address.pincode}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4A373] shrink-0" />
                <a href={`tel:${BUSINESS_DETAILS.whatsappPhone}`} className="hover:text-white transition-colors">
                  {BUSINESS_DETAILS.formattedPhone} ({BUSINESS_DETAILS.ownerName})
                </a>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-[#3A2D32]/60">
                <Clock className="w-4 h-4 text-[#D4A373] shrink-0 mt-0.5" />
                <div className="text-[11px] text-[#A6999E]">
                  <div>Mon - Sat: 9:30 AM – 8:30 PM</div>
                  <div>Sun: 10:00 AM – 7:00 PM</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Clean Copyright, No Developer Demo */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E8085]">
          <div className="text-center sm:text-left">
            <span>
              © {CURRENT_YEAR} {BUSINESS_DETAILS.brandName} • Proprietary Showroom of {BUSINESS_DETAILS.ownerName}. All rights reserved.
            </span>
          </div>

          <div>
            <a
              href="#top"
              onClick={scrollToTop}
              className="hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
