import React from 'react';
import { Sparkles, MessageCircle, ArrowRight, Shield, MapPin, Heart } from 'lucide-react';
import { BUSINESS_DETAILS } from '../data/business';
import { createGeneralInquiryUrl } from '../lib/whatsapp';
import { InstagramIcon } from './icons/InstagramIcon';

interface HeroProps {
  onShopClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopClick }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF5F8] via-[#FFF8F9] to-white pt-6 pb-14 lg:pt-10 lg:pb-20 border-b border-[#F7DFE6]">
      {/* Subtle decorative radial background blur */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FAD2E1]/40 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#ECC8AF]/30 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 text-left space-y-5 animate-fade-in-left">
            
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2 animate-fade-in-up delay-75">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-[#F0C9D3] text-[#8B4F58] text-xs font-semibold tracking-wide uppercase shadow-2xs gold-border-glow">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A373] animate-pulse" />
                <span>Dhasa Junction, Gujarat</span>
              </span>
              <a
                href={BUSINESS_DETAILS.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] border border-[#F5B8C7] text-[#9E5863] text-xs font-semibold hover:bg-[#FCE4E9] transition-all pressable"
              >
                <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
                <span>{BUSINESS_DETAILS.instagramFollowersText}</span>
              </a>
            </div>

            {/* Main Headline with Staggered Entrance */}
            <h1 className="font-heading text-2xl min-[360px]:text-3xl sm:text-4xl lg:text-5xl text-[#1F1A1C] leading-[1.2] font-semibold tracking-tight animate-fade-in-up delay-150">
              Traditional & Bridal <br />
              <span className="text-rose-gold-gradient font-bold italic">
                Imitation Jewellery
              </span>
              <br />
              in Dhasa Junction
            </h1>

            {/* Natural, professional subtext */}
            <p className="text-xs min-[360px]:text-sm sm:text-base text-[#5A4E53] leading-relaxed max-w-2xl font-light animate-fade-in-up delay-200">
              Welcome to <strong>{BUSINESS_DETAILS.brandName}</strong>, owned by <strong>{BUSINESS_DETAILS.ownerName}</strong>. Explore bridal necklace sets, Kundan jewellery, bangles, and men's traditional kadas. Browse our collection and contact us directly on WhatsApp for pricing, close-up details, and availability.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 animate-fade-in-up delay-250">
              <button
                onClick={onShopClick}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#D4A373] via-[#B76E79] to-[#9E5863] hover:from-[#c99564] hover:via-[#a75e69] hover:to-[#8c4b55] text-white font-medium text-xs min-[360px]:text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 group pressable cursor-pointer"
              >
                <span>Browse Catalogue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href={createGeneralInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-full bg-white hover:bg-[#FFF0F3] border border-[#B76E79]/50 text-[#8B4F58] font-medium text-xs min-[360px]:text-sm shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2 pressable"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Inquire on WhatsApp</span>
              </a>
            </div>

            {/* Highlights Grid */}
            <div className="pt-5 border-t border-[#F5D8E0] grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs text-[#5A4E53] animate-fade-in-up delay-300">
              <div className="flex items-start gap-2 p-2 rounded-xl hover:bg-white/60 transition-colors">
                <div className="p-1.5 rounded-full bg-[#FCECEF] text-[#8B4F58] shrink-0 mt-0.5">
                  <Heart className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="block text-[#1F1A1C]">Curated Selection</strong>
                  <span>Bridal sets, bangles & kadas</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded-xl hover:bg-white/60 transition-colors">
                <div className="p-1.5 rounded-full bg-[#FCECEF] text-[#8B4F58] shrink-0 mt-0.5">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="block text-[#1F1A1C]">Personal Assistance</strong>
                  <span>Direct consultation with Akshaysinh Kher</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded-xl hover:bg-white/60 transition-colors">
                <div className="p-1.5 rounded-full bg-[#FCECEF] text-[#8B4F58] shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="block text-[#1F1A1C]">Local Showroom</strong>
                  <span>Near Bank of Baroda, Dhasa</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative animate-fade-in-right delay-200">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer Decorative Ring */}
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-[#ECC8AF] via-[#FAD2E1] to-[#B76E79] opacity-35 blur-md" />
              
              {/* Main Card with Gentle Hover Zoom */}
              <div className="relative rounded-3xl overflow-hidden bg-white border border-[#F5D8E0] shadow-lg group">
                <div className="overflow-hidden">
                  <img
                    src="/images/hero-jewellery.jpg"
                    alt="Vaidehi Imitation Jewellery in Dhasa Junction"
                    className="w-full h-72 sm:h-88 object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                
                {/* Overlay Badge with Subtle Floating Animation */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-[#F0C9D3] shadow-md flex items-center justify-between">
                  <div className="text-left min-w-0 pr-2">
                    <span className="block text-[10px] font-bold tracking-wider uppercase text-[#8B4F58]">
                      Featured Collection
                    </span>
                    <span className="font-heading text-sm min-[360px]:text-base font-semibold text-[#1F1A1C] truncate block">
                      Bridal & Fashion Jewellery
                    </span>
                  </div>
                  <button
                    onClick={onShopClick}
                    className="p-2 rounded-full bg-[#FCECEF] hover:bg-[#FAD2E1] text-[#8B4F58] transition-all pressable shrink-0 cursor-pointer"
                    aria-label="View catalogue collection"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
