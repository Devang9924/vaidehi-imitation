import React from 'react';
import { MapPin, Phone, MessageCircle, Clock, Navigation } from 'lucide-react';
import { BUSINESS_DETAILS } from '../data/business';
import { createGeneralInquiryUrl } from '../lib/whatsapp';

export const ContactSection: React.FC = () => {
  return (
    <section id="contact-section" className="py-14 sm:py-20 bg-[#FAF4EA] border-b border-[#F4D9A0]/60 scroll-mt-6 reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Coordinated Typography Stagger */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 stagger-heading">
          <span className="heading-tag inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#F4D9A0] text-[#7A1830] text-xs font-semibold uppercase tracking-wider shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-[#C8792C]" />
            <span>Showroom Location & Contact</span>
          </span>
          <h2 className="heading-title font-heading text-2xl min-[360px]:text-3xl sm:text-4xl lg:text-5xl text-[#302218] font-semibold mt-2.5">
            Visit Our Showroom in Dhasa Junction
          </h2>
          <div className="heading-divider w-20 h-0.5 bg-gradient-to-r from-[#7A1830] via-[#C8792C] to-[#F4D9A0] mx-auto mt-2" />
          <p className="heading-subtitle text-xs sm:text-base text-[#5B4632] mt-2 font-light">
            Located on Dhasa Railway Station Road, near Bank of Baroda.
          </p>
        </div>

        {/* Contact Grid with Staggered Cascading Entrances */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8 stagger-container">
          
          {/* Card 1: Physical Showroom */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#F4D9A0] text-left space-y-4 flex flex-col justify-between hover:border-[#C8792C] hover:-translate-y-1 transition-all shadow-2xs hover:shadow-sm stagger-card">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#FAF4EA] border border-[#F4D9A0] text-[#7A1830] flex items-center justify-center shadow-2xs">
                <MapPin className="w-5 h-5 text-[#C8792C]" />
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#302218]">
                Showroom Address
              </h3>
              <p className="text-xs sm:text-sm text-[#5B4632] leading-relaxed">
                <strong className="text-[#302218]">{BUSINESS_DETAILS.brandName}</strong><br />
                {BUSINESS_DETAILS.address.line1},<br />
                {BUSINESS_DETAILS.address.landmark},<br />
                {BUSINESS_DETAILS.address.area}, {BUSINESS_DETAILS.address.taluka},<br />
                {BUSINESS_DETAILS.address.district}, {BUSINESS_DETAILS.address.state} - {BUSINESS_DETAILS.address.pincode}
              </p>
            </div>

            <a
              href={BUSINESS_DETAILS.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A1830] hover:text-[#C8792C] underline pt-1"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Open in Google Maps</span>
            </a>
          </div>

          {/* Card 2: Phone & WhatsApp */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#F4D9A0] text-left space-y-4 flex flex-col justify-between hover:border-[#C8792C] hover:-translate-y-1 transition-all shadow-2xs hover:shadow-sm stagger-card">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-2xs">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#302218]">
                Phone & Inquiries
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-[#5B4632]">
                <div>
                  <strong className="block text-[#302218]">Proprietor:</strong>
                  <span>{BUSINESS_DETAILS.ownerName}</span>
                </div>
                <div>
                  <strong className="block text-[#302218]">Phone & WhatsApp:</strong>
                  <span className="font-mono text-sm font-semibold text-[#7A1830]">{BUSINESS_DETAILS.formattedPhone}</span>
                </div>
                <div className="text-[11px] text-[#5B4632]/80 pt-0.5">
                  Feel free to send pictures or ask about specific bridal items on WhatsApp.
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <a
                href={createGeneralInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all text-center shadow-2xs pressable"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Message on WhatsApp</span>
              </a>
              <a
                href={`tel:${BUSINESS_DETAILS.whatsappPhone}`}
                className="py-2.5 px-4 rounded-xl btn-champagne-outline text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center pressable"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {BUSINESS_DETAILS.formattedPhone}</span>
              </a>
            </div>
          </div>

          {/* Card 3: Business Hours */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#F4D9A0] text-left space-y-4 flex flex-col justify-between hover:border-[#C8792C] hover:-translate-y-1 transition-all shadow-2xs hover:shadow-sm stagger-card">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#FAF4EA] border border-[#F4D9A0] text-[#C8792C] flex items-center justify-center shadow-2xs">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#302218]">
                Showroom Hours
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-[#5B4632]">
                <div className="flex justify-between py-1 border-b border-[#F4D9A0]/50">
                  <span>Monday - Saturday</span>
                  <strong className="text-[#302218]">9:30 AM – 8:30 PM</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F4D9A0]/50">
                  <span>Sunday</span>
                  <strong className="text-[#302218]">10:00 AM – 7:00 PM</strong>
                </div>
                <div className="text-[11px] text-[#5B4632]/80 pt-0.5">
                  Visiting hours for customers in Dhasa and nearby areas.
                </div>
              </div>
            </div>

            <div className="bg-[#FAF4EA] rounded-xl p-3 border border-[#F4D9A0] text-[11px] text-[#7A1830] font-medium text-center">
              Direct assistance from Akshaysinh Kher at our Dhasa showroom.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
