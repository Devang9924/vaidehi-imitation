import React from 'react';
import { MapPin, Phone, MessageCircle, Clock, Navigation } from 'lucide-react';
import { BUSINESS_DETAILS } from '../data/business';
import { createGeneralInquiryUrl } from '../lib/whatsapp';

export const ContactSection: React.FC = () => {
  return (
    <section id="contact-section" className="py-12 sm:py-20 bg-white border-b border-[#F5D8E0] scroll-mt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14 animate-fade-in-up">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] border border-[#F5B8C7] text-[#8B4F58] text-xs font-semibold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>Showroom Location & Contact</span>
          </span>
          <h2 className="font-heading text-2xl min-[360px]:text-3xl sm:text-4xl text-[#1F1A1C] font-semibold mt-2.5">
            Visit Our Showroom in Dhasa Junction
          </h2>
          <p className="text-xs sm:text-base text-[#6E6267] mt-2 font-light">
            Located on Dhasa Railway Station Road, near Bank of Baroda.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
          
          {/* Card 1: Physical Showroom */}
          <div className="bg-[#FFF9FA] rounded-3xl p-4 min-[360px]:p-5 sm:p-7 border border-[#F5D8E0] text-left space-y-4 flex flex-col justify-between hover:border-[#F5B8C7] hover:-translate-y-1 transition-all animate-fade-in-up delay-100 shadow-2xs hover:shadow-xs">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-white border border-[#F0C9D3] text-[#8B4F58] flex items-center justify-center shadow-2xs">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#1F1A1C]">
                Showroom Address
              </h3>
              <p className="text-xs sm:text-sm text-[#5A4E53] leading-relaxed">
                <strong>{BUSINESS_DETAILS.brandName}</strong><br />
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
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B4F58] hover:text-[#9E5863] underline pt-1"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Open in Google Maps</span>
            </a>
          </div>

          {/* Card 2: Phone & WhatsApp */}
          <div className="bg-[#FFF9FA] rounded-3xl p-4 min-[360px]:p-5 sm:p-7 border border-[#F5D8E0] text-left space-y-4 flex flex-col justify-between hover:border-[#F5B8C7] hover:-translate-y-1 transition-all animate-fade-in-up delay-200 shadow-2xs hover:shadow-xs">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-white border border-[#F0C9D3] text-emerald-600 flex items-center justify-center shadow-2xs">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#1F1A1C]">
                Phone & Inquiries
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-[#5A4E53]">
                <div>
                  <strong className="block text-[#1F1A1C]">Proprietor:</strong>
                  <span>{BUSINESS_DETAILS.ownerName}</span>
                </div>
                <div>
                  <strong className="block text-[#1F1A1C]">Phone & WhatsApp:</strong>
                  <span className="font-mono text-sm font-semibold text-[#8B4F58]">{BUSINESS_DETAILS.formattedPhone}</span>
                </div>
                <div className="text-[11px] text-[#6E6267] pt-0.5">
                  Feel free to send pictures or ask about specific items on WhatsApp.
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
                className="py-2 px-4 rounded-xl border border-[#B76E79] text-[#8B4F58] hover:bg-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center pressable"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {BUSINESS_DETAILS.formattedPhone}</span>
              </a>
            </div>
          </div>

          {/* Card 3: Business Hours */}
          <div className="bg-[#FFF9FA] rounded-3xl p-4 min-[360px]:p-5 sm:p-7 border border-[#F5D8E0] text-left space-y-4 flex flex-col justify-between hover:border-[#F5B8C7] hover:-translate-y-1 transition-all animate-fade-in-up delay-300 shadow-2xs hover:shadow-xs">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-white border border-[#F0C9D3] text-[#D4A373] flex items-center justify-center shadow-2xs">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#1F1A1C]">
                Showroom Hours
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-[#5A4E53]">
                <div className="flex justify-between py-1 border-b border-[#F5D8E0]">
                  <span>Monday - Saturday</span>
                  <strong className="text-[#1F1A1C]">9:30 AM – 8:30 PM</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F5D8E0]">
                  <span>Sunday</span>
                  <strong className="text-[#1F1A1C]">10:00 AM – 7:00 PM</strong>
                </div>
                <div className="text-[11px] text-[#6E6267] pt-0.5">
                  Visiting hours for customers in Dhasa and nearby areas.
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 border border-[#F0C9D3] text-[11px] text-[#8B4F58] font-medium text-center">
              Direct assistance from Akshaysinh Kher at our Dhasa showroom.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
