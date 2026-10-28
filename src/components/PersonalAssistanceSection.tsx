import React from 'react';
import { MessageCircle, Phone, Video, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { BUSINESS_DETAILS } from '../data/business';
import { createGeneralInquiryUrl } from '../lib/whatsapp';

export const PersonalAssistanceSection: React.FC = () => {
  return (
    <section id="personal-assistance" className="bg-[#FAF4EA] py-14 sm:py-20 border-b border-[#F4D9A0]/60 scroll-mt-6 reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Coordinated Typography Stagger */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 stagger-heading">
          <span className="heading-tag inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#F4D9A0] text-[#7A1830] text-xs font-semibold uppercase tracking-wider shadow-2xs">
            <Heart className="w-3.5 h-3.5 text-[#7A1830]" />
            <span>Dedicated Consultation</span>
          </span>
          <h2 className="heading-title font-heading text-2xl min-[360px]:text-3xl sm:text-4xl lg:text-5xl text-[#302218] font-semibold mt-2.5">
            Personal Assistance
          </h2>
          <div className="heading-divider w-20 h-0.5 bg-gradient-to-r from-[#7A1830] via-[#C8792C] to-[#F4D9A0] mx-auto mt-2" />
          <p className="heading-subtitle text-xs sm:text-base text-[#5B4632] mt-2 font-light max-w-2xl mx-auto leading-relaxed">
            Speak directly with showroom proprietor <strong>{BUSINESS_DETAILS.ownerName}</strong> for personalised styling advice, outfit matching, and close-up video previews.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Personalized Service Highlights */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C8792C] block">
                Direct Owner Support
              </span>
              <h3 className="font-heading text-xl sm:text-2xl lg:text-3xl font-semibold text-[#302218] leading-tight">
                We Help You Choose the Perfect Bridal Match
              </h3>
              <p className="text-xs sm:text-sm text-[#5B4632] leading-relaxed font-light">
                Buying bridal jewellery is an important decision. At <strong>Vaidehi Imitation</strong>, you don't talk to a generic chatbot. Akshaysinh Kher assists you personally on WhatsApp with honest advice, live videos, and tailored recommendations.
              </p>
            </div>

            {/* Assistance Highlights Cards Staggered Entrance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1 stagger-container">
              <div className="bg-white p-4 rounded-2xl border border-[#F4D9A0]/70 space-y-2 shadow-2xs stagger-card">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <strong className="block text-xs sm:text-sm text-[#302218]">Video Previews</strong>
                <p className="text-[11px] sm:text-xs text-[#5B4632]/80 leading-relaxed font-light">
                  Inspect the shine, clasp, and Kundan stones live on camera before making any commitment.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#F4D9A0]/70 space-y-2 shadow-2xs stagger-card">
                <div className="w-9 h-9 rounded-xl bg-[#FAF4EA] border border-[#F4D9A0] text-[#7A1830] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#C8792C]" />
                </div>
                <strong className="block text-xs sm:text-sm text-[#302218]">Outfit Matching</strong>
                <p className="text-[11px] sm:text-xs text-[#5B4632]/80 leading-relaxed font-light">
                  Send a photo of your wedding lehenga or saree to receive matched necklace & earring options.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#F4D9A0]/70 space-y-2 shadow-2xs stagger-card">
                <div className="w-9 h-9 rounded-xl bg-[#FAF4EA] border border-[#F4D9A0] text-[#5B4632] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                </div>
                <strong className="block text-xs sm:text-sm text-[#302218]">Sizing & Fitting</strong>
                <p className="text-[11px] sm:text-xs text-[#5B4632]/80 leading-relaxed font-light">
                  Expert advice on bangle circumferences, necklace chokers, and kada locking hinges.
                </p>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={createGeneralInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs min-[360px]:text-sm flex items-center gap-2 shadow-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with Akshaysinh Kher on WhatsApp</span>
              </a>

              <a
                href={`tel:${BUSINESS_DETAILS.whatsappPhone}`}
                className="px-5 py-3 rounded-full btn-champagne-outline font-semibold text-xs min-[360px]:text-sm flex items-center gap-2 shadow-2xs"
              >
                <Phone className="w-4 h-4" />
                <span>Call {BUSINESS_DETAILS.formattedPhone}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Proprietor Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border-2 border-[#F4D9A0] p-6 sm:p-7 shadow-lg space-y-5 text-left">
              <div className="flex items-center space-x-3.5">
                <img
                  src="/logo.png"
                  alt="Vaidehi Imitation Logo"
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#F4D9A0] shadow-sm"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A1830] block">
                    Showroom Proprietor
                  </span>
                  <h4 className="font-heading text-xl font-bold text-[#302218]">
                    {BUSINESS_DETAILS.ownerName}
                  </h4>
                  <p className="text-xs text-[#5B4632]">
                    {BUSINESS_DETAILS.brandName}, Dhasa Junction
                  </p>
                </div>
              </div>

              <div className="bg-[#FAF4EA]/60 rounded-2xl p-4 border border-[#F4D9A0]/60 space-y-2 text-xs text-[#5B4632]">
                <p className="leading-relaxed">
                  "We believe that every bride deserves to look breathtaking on her wedding day with authentic, heirloom-quality designs that provide complete peace of mind."
                </p>
                <div className="pt-1 font-semibold text-[#302218]">
                  — Akshaysinh Kher, Founder
                </div>
              </div>

              <div className="pt-2 text-xs space-y-2 border-t border-[#F4D9A0]/50">
                <div className="flex items-center justify-between text-[#5B4632]">
                  <span>Showroom Hours:</span>
                  <strong className="text-[#302218]">Mon–Sat: 9:30 AM – 8:30 PM</strong>
                </div>
                <div className="flex items-center justify-between text-[#5B4632]">
                  <span>WhatsApp Inquiries:</span>
                  <strong className="text-emerald-700">Daily Active Support</strong>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

