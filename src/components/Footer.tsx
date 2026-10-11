import React from 'react';
import { MapPin, Phone, MessageCircle } from 'lucide-react';
import { BUSINESS_DETAILS, CATEGORIES_LIST } from '../data/business';
import { createGeneralInquiryUrl } from '../lib/whatsapp';
import type { ProductCategory } from '../types';
import { InstagramIcon } from './icons/InstagramIcon';

const CURRENT_YEAR = new Date().getFullYear();

interface FooterProps {
  onSelectCategory: (category: ProductCategory) => void;
  showSampleProducts?: boolean;
  onToggleSampleProducts?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  showSampleProducts,
  onToggleSampleProducts,
}) => {
  return (
    <footer className="bg-[#1C1618] text-[#D8CFD2] pt-14 pb-28 sm:pb-12 border-t border-[#3A2D32]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#3A2D32] text-left">
          
          {/* Brand Info (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ECC8AF] to-[#B76E79] flex items-center justify-center font-brand font-bold text-base text-white">
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

          {/* Quick Category Links (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-heading text-lg font-semibold text-white tracking-wide">
              Jewellery Categories
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {CATEGORIES_LIST.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                    const el = document.getElementById('catalogue-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-left text-[#B3A6AB] hover:text-[#ECC8AF] transition-colors py-1 truncate cursor-pointer"
                >
                  • {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Location & Contact (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading text-lg font-semibold text-white tracking-wide">
              Showroom Contact
            </h4>
            <div className="text-xs space-y-2 text-[#B3A6AB]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D4A373] shrink-0 mt-0.5" />
                <span>
                  {BUSINESS_DETAILS.address.landmark}, {BUSINESS_DETAILS.address.line1}, {BUSINESS_DETAILS.address.area}, Taluka Gadhada, Dist. Botad, Gujarat - {BUSINESS_DETAILS.address.pincode}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-4 h-4 text-[#D4A373] shrink-0" />
                <a href={`tel:${BUSINESS_DETAILS.whatsappPhone}`} className="hover:text-white">
                  {BUSINESS_DETAILS.formattedPhone} ({BUSINESS_DETAILS.ownerName})
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Clean Copyright, No Public Admin Button */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E8085]">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-center sm:text-left">
            <span>
              © {CURRENT_YEAR} {BUSINESS_DETAILS.brandName} • Proprietary Showroom of {BUSINESS_DETAILS.ownerName}. All rights reserved.
            </span>
            {onToggleSampleProducts && (
              <button
                type="button"
                onClick={onToggleSampleProducts}
                className="text-[10px] text-[#8E8085]/60 hover:text-[#ECC8AF] transition-colors cursor-pointer"
                title="Toggle demonstration sample items for testing"
              >
                • {showSampleProducts ? 'Disable Demo Items' : 'Developer Demo'}
              </button>
            )}
          </div>

          <div>
            <a href="#" className="hover:text-white transition-colors">
              Back to Top ↑
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
