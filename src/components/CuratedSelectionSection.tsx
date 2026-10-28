import React from 'react';
import { Gem, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

interface CuratedSelectionSectionProps {
  onShopClick: () => void;
}

export const CuratedSelectionSection: React.FC<CuratedSelectionSectionProps> = ({ onShopClick }) => {
  return (
    <section id="curated-selection" className="bg-white py-14 sm:py-20 border-b border-[#F4D9A0]/60 scroll-mt-6 reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Coordinated Typography Stagger */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 stagger-heading">
          <span className="heading-tag inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4EA] border border-[#F4D9A0] text-[#7A1830] text-xs font-semibold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C8792C]" />
            <span>Showroom Excellence</span>
          </span>
          <h2 className="heading-title font-heading text-2xl min-[360px]:text-3xl sm:text-4xl lg:text-5xl text-[#302218] font-semibold mt-2.5">
            Curated Selection
          </h2>
          <div className="heading-divider w-20 h-0.5 bg-gradient-to-r from-[#7A1830] via-[#C8792C] to-[#F4D9A0] mx-auto mt-2" />
          <p className="heading-subtitle text-xs sm:text-base text-[#5B4632] mt-2 font-light max-w-2xl mx-auto leading-relaxed">
            Bridal necklace sets, festive ornaments, and heritage pieces handpicked for design, durability, and flawless finish.
          </p>
        </div>

        {/* Feature Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Narrative & Quality Points */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C8792C] block">
                Artisanal Quality Standards
              </span>
              <h3 className="font-heading text-xl sm:text-2xl lg:text-3xl font-semibold text-[#302218] leading-tight">
                Designed to Match the Radiance of Fine Gold
              </h3>
              <p className="text-xs sm:text-sm text-[#5B4632] leading-relaxed font-light">
                Every piece in the <strong>Vaidehi Imitation</strong> showroom is selected to deliver the exact weight, warm glow, and stone sparkle of traditional bridal heirloom jewellery without the exorbitant cost.
              </p>
            </div>

            {/* Feature Points Staggered Entrance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 stagger-container">
              <div className="bg-[#FAF4EA]/50 p-4 rounded-2xl border border-[#F4D9A0]/70 space-y-1.5 stagger-card">
                <div className="flex items-center gap-2 text-[#7A1830] font-semibold text-xs sm:text-sm">
                  <Gem className="w-4 h-4 text-[#C8792C]" />
                  <span>Kundan & Polki Finishes</span>
                </div>
                <p className="text-xs text-[#5B4632]/85 leading-relaxed font-light">
                  Hand-set stones with meenakari backing and lustrous basra pearl drops.
                </p>
              </div>

              <div className="bg-[#FAF4EA]/50 p-4 rounded-2xl border border-[#F4D9A0]/70 space-y-1.5 stagger-card">
                <div className="flex items-center gap-2 text-[#7A1830] font-semibold text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Micro-Gold Durability</span>
                </div>
                <p className="text-xs text-[#5B4632]/85 leading-relaxed font-light">
                  High-micron electroplating that resists tarnishing during weddings and celebrations.
                </p>
              </div>

              <div className="bg-[#FAF4EA]/50 p-4 rounded-2xl border border-[#F4D9A0]/70 space-y-1.5 stagger-card">
                <div className="flex items-center gap-2 text-[#7A1830] font-semibold text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Skin-Safe & Comfortable</span>
                </div>
                <p className="text-xs text-[#5B4632]/85 leading-relaxed font-light">
                  Hypoallergenic base alloy engineered for extended wear throughout wedding festivities.
                </p>
              </div>

              <div className="bg-[#FAF4EA]/50 p-4 rounded-2xl border border-[#F4D9A0]/70 space-y-1.5 stagger-card">
                <div className="flex items-center gap-2 text-[#7A1830] font-semibold text-xs sm:text-sm">
                  <Gem className="w-4 h-4 text-[#C8792C]" />
                  <span>Men's Antique Kadas</span>
                </div>
                <p className="text-xs text-[#5B4632]/85 leading-relaxed font-light">
                  Heavy Rajputi lion-head kadas with secure locking mechanisms.
                </p>
              </div>
            </div>

            {/* Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onShopClick}
                className="px-6 py-3 rounded-full btn-burgundy-primary font-semibold text-xs min-[360px]:text-sm flex items-center gap-2 group cursor-pointer shadow-sm"
              >
                <span>Browse Curated Collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: Editorial Showcase Card with Mask Reveal & Ken Burns Zoom Settle */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative rounded-3xl overflow-hidden bg-[#FAF4EA] border-2 border-[#F4D9A0] shadow-lg gold-sweep-container group editorial-reveal-mask">
                <img
                  src="/images/featured-polki-choker.jpg"
                  alt="Curated Royal Rajasthani Polki Choker at Vaidehi Imitation"
                  className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700 editorial-zoom-settle"
                  loading="lazy"
                />
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-[#F4D9A0] shadow-md text-left">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7A1830]">
                    Showroom Verified
                  </span>
                  <span className="font-heading text-base font-semibold text-[#302218]">
                    Royal Rajasthani Polki Choker Set
                  </span>
                  <p className="text-xs text-[#5B4632] mt-0.5">
                    Available with matching jhumkas in our Dhasa showroom.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

