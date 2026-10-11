import React from 'react';
import { MapPin, Phone, MessageCircle, Heart, Gem, ShieldCheck } from 'lucide-react';
import { BUSINESS_DETAILS } from '../data/business';
import { createGeneralInquiryUrl } from '../lib/whatsapp';

export const AboutSection: React.FC = () => {
  return (
    <section id="about-section" className="py-12 sm:py-20 bg-white border-y border-[#F5D8E0] scroll-mt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14 animate-fade-in-up">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] border border-[#F5B8C7] text-[#8B4F58] text-xs font-semibold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 text-[#B76E79]" />
            <span>About Us</span>
          </span>
          <h2 className="font-heading text-2xl min-[360px]:text-3xl sm:text-4xl text-[#1F1A1C] font-semibold mt-2.5">
            About Vaidehi Imitation
          </h2>
          <p className="text-xs sm:text-base text-[#6E6267] mt-2 font-light leading-relaxed max-w-2xl mx-auto">
            Located in Dhasa Junction, Gujarat — providing bridal, traditional, and fashion jewellery for local and nearby patrons.
          </p>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left: Brand Story */}
          <div className="lg:col-span-7 space-y-5 text-left animate-fade-in-left delay-100">
            <div className="space-y-3.5 text-xs sm:text-sm text-[#5A4E53] leading-relaxed font-light">
              <p>
                Owned and operated by <strong>{BUSINESS_DETAILS.ownerName}</strong>, <strong>{BUSINESS_DETAILS.brandName}</strong> is an imitation jewellery showroom located on <strong>{BUSINESS_DETAILS.address.landmark}</strong>, <strong>{BUSINESS_DETAILS.address.area}</strong>.
              </p>
              <p>
                Our collection features bridal necklace sets, traditional Kundan items, bangles, rings, and men's traditional kadas. We assist customers directly with photos and video previews over WhatsApp so you can review details before deciding.
              </p>
              <p>
                Whether you visit our store in Dhasa Junction or get in touch via WhatsApp, Akshaysinh Kher personally assists you with item availability, pricing, and answers to your questions.
              </p>
            </div>

            {/* Key Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#FFF9FA] border border-[#F5D8E0] space-y-1">
                <div className="flex items-center gap-2 text-[#8B4F58] font-semibold text-xs sm:text-sm">
                  <Gem className="w-4 h-4 text-[#D4A373]" />
                  <span>Carefully Curated</span>
                </div>
                <p className="text-xs text-[#6E6267]">
                  Bridal sets, festive ornaments, and everyday imitation pieces chosen for design and finish.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFF9FA] border border-[#F5D8E0] space-y-1">
                <div className="flex items-center gap-2 text-[#8B4F58] font-semibold text-xs sm:text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Personal Service</span>
                </div>
                <p className="text-xs text-[#6E6267]">
                  Speak directly with the owner on WhatsApp to view available stock and discuss your requirements.
                </p>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <a
                href={createGeneralInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href={`tel:${BUSINESS_DETAILS.whatsappPhone}`}
                className="px-4 py-2.5 rounded-full border border-[#B76E79] text-[#8B4F58] hover:bg-[#FFF0F3] text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call: {BUSINESS_DETAILS.formattedPhone}</span>
              </a>
            </div>

          </div>

          {/* Right: Owner & Showroom Card */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-br from-[#FFF5F8] to-[#FFFDFC] rounded-3xl border border-[#F5D8E0] p-5 sm:p-7 shadow-sm space-y-5 text-left">
              
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B4F58] block">
                  Store Proprietor
                </span>
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#1F1A1C] mt-0.5">
                  {BUSINESS_DETAILS.ownerName}
                </h3>
                <p className="text-xs text-[#6E6267] mt-0.5">
                  Vaidehi Imitation, Dhasa Junction
                </p>
              </div>

              <div className="space-y-2.5 pt-2 text-xs sm:text-sm border-t border-[#F5D8E0]">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#8B4F58] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#1F1A1C]">Store Address:</strong>
                    <span className="text-[#6E6267] leading-relaxed text-xs">
                      {BUSINESS_DETAILS.address.fullFormatted}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-[#8B4F58] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#1F1A1C]">Phone & WhatsApp:</strong>
                    <span className="text-[#6E6267] text-xs">
                      {BUSINESS_DETAILS.formattedPhone}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-[#F0C9D3] text-center">
                <span className="text-xs text-[#6E6267] block">
                  Visiting Dhasa Junction?
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#8B4F58] block mt-0.5">
                  Our showroom is located on Railway Station Road
                </span>
                <a
                  href={BUSINESS_DETAILS.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs font-semibold text-white bg-[#8B4F58] hover:bg-[#9E5863] px-3.5 py-1.5 rounded-full transition-colors"
                >
                  View on Google Maps
                </a>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
