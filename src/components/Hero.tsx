import React, { useState, useEffect } from 'react';
import { Sparkles, MessageCircle, ArrowRight, ShieldCheck, Gem } from 'lucide-react';
import { BUSINESS_DETAILS } from '../data/business';
import { createGeneralInquiryUrl } from '../lib/whatsapp';
import { InstagramIcon } from './icons/InstagramIcon';

interface HeroProps {
  onShopClick: () => void;
  isReady?: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onShopClick, isReady: isReadyProp }) => {
  const [internalReady, setInternalReady] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    // Safety fallback: if isReadyProp is undefined or loader callback is delayed,
    // ensure hero is always fully visible after 1100ms
    const fallbackTimer = setTimeout(() => {
      setInternalReady(true);
    }, 1100);

    return () => clearTimeout(fallbackTimer);
  }, []);

  const isRevealed = isReadyProp !== undefined ? (isReadyProp || internalReady) : internalReady;

  return (
    <section className="relative overflow-hidden bg-[#FAF4EA] pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pt-12 lg:pb-20 border-b border-[#F4D9A0]/60">
      {/* Subtle warm champagne-gold ambient backdrops - 100% stationary */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#F4D9A0]/25 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-6 left-6 w-80 h-80 bg-[#C8792C]/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines & Call to Actions (Smooth Entrance from Left) */}
          <div className={`lg:col-span-7 text-left space-y-5 sm:space-y-6 hero-text-entrance ${isRevealed ? 'is-active' : ''}`}>
            
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2 hero-stagger-item hero-stagger-badges">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#F4D9A0] text-[#7A1830] text-xs font-semibold tracking-wide uppercase shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#C8792C]" />
                <span>Dhasa Junction, Gujarat</span>
              </span>
              <a
                href={BUSINESS_DETAILS.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#F4D9A0] text-[#5B4632] text-xs font-semibold hover:border-[#C8792C] hover:text-[#7A1830] transition-all pressable shadow-2xs"
              >
                <InstagramIcon className="w-3.5 h-3.5 text-[#7A1830]" />
                <span>{BUSINESS_DETAILS.instagramFollowersText}</span>
              </a>
            </div>

            {/* Main Headline (Heading appears first in staggered sequence) */}
            <div className="space-y-2 hero-stagger-item hero-stagger-heading">
              <h1 className="font-heading text-3xl min-[360px]:text-4xl sm:text-5xl lg:text-6xl text-[#302218] leading-[1.12] font-semibold tracking-tight">
                Traditional & Bridal <br />
                <span className="text-rose-gold-gradient italic font-bold">
                  Imitation Jewellery
                </span>
              </h1>
              
              {/* Delicate Gold Flourish Line */}
              <div className="w-24 sm:w-32 h-0.5 bg-gradient-to-r from-[#7A1830] via-[#C8792C] to-transparent animate-ornament-draw" />
            </div>

            {/* Concise, Attractive Hero Text */}
            <div className="space-y-2 max-w-xl hero-stagger-item hero-stagger-text">
              <p className="text-sm min-[360px]:text-base sm:text-lg text-[#302218] font-medium leading-relaxed">
                Discover beautiful necklaces, earrings, bangles, rings and traditional jewellery for every occasion.
              </p>
              <p className="text-xs sm:text-sm text-[#5B4632] leading-relaxed font-light">
                Owned by <strong>{BUSINESS_DETAILS.ownerName}</strong> at <strong>{BUSINESS_DETAILS.brandName}</strong>. Explore bridal Kundan choker sets, temple ornaments, and men's traditional kadas with direct showroom pricing and personal WhatsApp video previews.
              </p>
            </div>

            {/* Working Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 hero-stagger-item hero-stagger-actions">
              <button
                type="button"
                onClick={onShopClick}
                className="px-7 py-3.5 rounded-full btn-burgundy-primary font-semibold text-xs min-[360px]:text-sm flex items-center justify-center gap-2 group cursor-pointer shadow-md"
              >
                <span>Browse Catalogue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href={createGeneralInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-full btn-champagne-outline font-semibold text-xs min-[360px]:text-sm flex items-center justify-center gap-2 shadow-2xs"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Inquire on WhatsApp</span>
              </a>
            </div>

            {/* Quick Micro-Reassurance Strip */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#5B4632] hero-stagger-item hero-stagger-reassurance">
              <div className="flex items-center gap-1.5">
                <Gem className="w-4 h-4 text-[#C8792C]" />
                <span>Premium Micro-Gold Polish</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>100% Quality Inspected</span>
              </div>
            </div>

          </div>

          {/* Right Column: Priority One Bridal Model Photograph (Smooth Entrance from Right) */}
          <div className={`lg:col-span-5 relative hero-image-entrance ${isRevealed ? 'is-active' : ''}`}>
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer Decorative Champagne-Gold Glow */}
              <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-[#F4D9A0] via-[#C8792C]/30 to-[#7A1830]/40 blur-lg pointer-events-none hero-glow-entrance" />
              
              {/* Main Card with Bridal Reveal, Editorial Mask & Gold Light Sweep */}
              <div className="relative rounded-[2rem] overflow-hidden bg-white border-2 border-[#F4D9A0] shadow-xl gold-sweep-container group animate-bridal-reveal editorial-reveal-mask is-revealed">
                
                {/* Bridal Model Image Container: Mobile-Optimized Object Position */}
                <div className="overflow-hidden bg-[#FAF4EA]">
                  <img
                    src="/images/bridal-hero.jpg"
                    alt="South Asian Bridal Model wearing Traditional Vaidehi Imitation Jewellery"
                    className="w-full h-[380px] sm:h-[460px] lg:h-[540px] object-cover object-[center_12%] transform transition-transform duration-700 ease-out group-hover:scale-103 editorial-zoom-settle"
                    loading="eager"
                  />
                </div>
                
                {/* Editorial Floating Badge on Bridal Photo */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-[#F4D9A0] shadow-lg flex items-center justify-between">
                  <div className="text-left min-w-0 pr-2">
                    <span className="block text-[9px] min-[360px]:text-[10px] font-bold tracking-widest uppercase text-[#7A1830]">
                      Bridal Signature Collection
                    </span>
                    <span className="font-heading text-sm min-[360px]:text-base font-semibold text-[#302218] truncate block">
                      Handcrafted Kundan & Polki Sets
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onShopClick}
                    className="p-2 sm:p-2.5 rounded-full bg-[#FAF4EA] hover:bg-[#F4D9A0] text-[#7A1830] transition-all pressable shrink-0 cursor-pointer border border-[#F4D9A0]"
                    aria-label="View bridal catalogue"
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
