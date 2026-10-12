import React, { useState } from 'react';
import { PolicyLayout } from './PolicyLayout';
import { BUSINESS_DETAILS, CATEGORIES_LIST } from '../../data/business';
import { createGeneralInquiryUrl } from '../../lib/whatsapp';
import { MapPin, Phone, MessageCircle, Navigation, Send, HelpCircle } from 'lucide-react';

interface ContactUsPageProps {
  onNavigate: (path: string) => void;
}

export const ContactUsPage: React.FC<ContactUsPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: 'All',
    message: '',
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryText = encodeURIComponent(
      `Hello ${BUSINESS_DETAILS.brandName},\n` +
      `My Name: ${formData.name.trim() || 'Customer'}\n` +
      `Phone: ${formData.phone.trim() || 'Not provided'}\n` +
      `Category of Interest: ${formData.category}\n` +
      `Inquiry: ${formData.message.trim() || 'I would like to inquire about your jewellery catalogue.'}`
    );
    const whatsappUrl = `https://wa.me/91${BUSINESS_DETAILS.whatsappPhone}?text=${queryText}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <PolicyLayout
      title="Contact Us & Customer Support"
      subtitle="Visit our showroom in Dhasa Junction or reach out directly to proprietor Akshaysinh Kher on WhatsApp for catalogue inquiries and order assistance."
      badge="Showroom & Help Center"
      lastUpdated="October 2026"
      currentPath="/contact-us"
      onNavigate={onNavigate}
    >
      {/* 1. Official Showroom Contact Cards */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <MapPin className="w-5 h-5 text-[#8B4F58]" />
          <h2>1. Official Showroom Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card: Physical Showroom */}
          <div className="bg-[#FFF8F9] rounded-2xl p-5 border border-[#F5D8E0] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#F0C9D3] text-[#8B4F58] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-[#1F1A1C]">
                Showroom Address
              </h3>
              <p className="text-xs text-[#5A4E53] leading-relaxed">
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
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B4F58] hover:text-[#9E5863] underline pt-2"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions on Google Maps</span>
            </a>
          </div>

          {/* Card: Direct Support Contacts */}
          <div className="bg-[#FFF8F9] rounded-2xl p-5 border border-[#F5D8E0] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#F0C9D3] text-emerald-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-[#1F1A1C]">
                Proprietor & Direct Phone
              </h3>
              <div className="text-xs space-y-1.5 text-[#5A4E53]">
                <div>
                  <strong className="block text-[#1F1A1C]">Proprietor:</strong>
                  <span>{BUSINESS_DETAILS.ownerName}</span>
                </div>
                <div>
                  <strong className="block text-[#1F1A1C]">WhatsApp Support:</strong>
                  <span className="font-mono text-sm font-semibold text-[#8B4F58]">{BUSINESS_DETAILS.formattedPhone}</span>
                </div>
                <div>
                  <strong className="block text-[#1F1A1C]">Showroom Hours:</strong>
                  <span>Mon–Sat: 9:30 AM – 8:30 PM | Sun: 10:00 AM – 7:00 PM</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <a
                href={createGeneralInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Chat</span>
              </a>
              <a
                href={`tel:${BUSINESS_DETAILS.whatsappPhone}`}
                className="py-2 px-3 rounded-xl border border-[#B76E79] text-[#8B4F58] hover:bg-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Store</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Interactive Direct Inquiry Form */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <Send className="w-5 h-5 text-[#8B4F58]" />
          <h2>2. Send an Instant Inquiry on WhatsApp</h2>
        </div>
        <p className="text-xs text-[#5A4E53]">
          Fill in your details below to generate a pre-formatted message and chat directly with <strong>{BUSINESS_DETAILS.ownerName}</strong> on WhatsApp:
        </p>

        <form onSubmit={handleFormSubmit} className="bg-[#FFF8F9] rounded-2xl p-5 border border-[#F5D8E0] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1">
              <label htmlFor="customer-name" className="block text-xs font-medium text-[#1F1A1C]">
                Your Name <span className="text-[#8B4F58]">*</span>
              </label>
              <input
                id="customer-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Radhika Patel"
                className="w-full px-3 py-2 rounded-xl border border-[#F0C9D3] bg-white text-xs text-[#1F1A1C] focus:outline-hidden focus:border-[#8B4F58]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="customer-phone" className="block text-xs font-medium text-[#1F1A1C]">
                Mobile / WhatsApp Number
              </label>
              <input
                id="customer-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 98765 43210"
                className="w-full px-3 py-2 rounded-xl border border-[#F0C9D3] bg-white text-xs text-[#1F1A1C] focus:outline-hidden focus:border-[#8B4F58]"
              />
            </div>

          </div>

          <div className="space-y-1">
            <label htmlFor="category-interest" className="block text-xs font-medium text-[#1F1A1C]">
              Jewellery Category of Interest
            </label>
            <select
              id="category-interest"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[#F0C9D3] bg-white text-xs text-[#1F1A1C] focus:outline-hidden focus:border-[#8B4F58]"
            >
              <option value="All">General Catalogue Inquiry</option>
              {CATEGORIES_LIST.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="inquiry-message" className="block text-xs font-medium text-[#1F1A1C]">
              Your Question or Custom Requirement
            </label>
            <textarea
              id="inquiry-message"
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="e.g. Looking for a bridal choker set in maroon Kundan for a December wedding, or checking bangle size 2.6 availability."
              className="w-full px-3 py-2 rounded-xl border border-[#F0C9D3] bg-white text-xs text-[#1F1A1C] focus:outline-hidden focus:border-[#8B4F58] resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Open in WhatsApp & Send Inquiry</span>
          </button>
        </form>
      </section>

      {/* 3. Frequently Asked Questions */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <HelpCircle className="w-5 h-5 text-[#8B4F58]" />
          <h2>3. Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3 text-xs">
          
          <div className="bg-[#FFF8F9] p-4 rounded-xl border border-[#F5D8E0] space-y-1">
            <h4 className="font-semibold text-[#1F1A1C]">
              Q. Can I visit your showroom in Dhasa Junction directly?
            </h4>
            <p className="text-[#5A4E53]">
              Yes, absolutely! We welcome local customers and visitors from across Botad, Gadhada, Bhavnagar, and Amreli districts to try on our bridal sets, Kundan chokers, and Rajputi kadas in person. We are located right on Dhasa Railway Station Road, near Bank of Baroda.
            </p>
          </div>

          <div className="bg-[#FFF8F9] p-4 rounded-xl border border-[#F5D8E0] space-y-1">
            <h4 className="font-semibold text-[#1F1A1C]">
              Q. How do I order jewellery online through this website?
            </h4>
            <p className="text-[#5A4E53]">
              Browse our catalogue, click on any design to view details, and click "Order via WhatsApp". An automated order message with the product code and price will open directly in your WhatsApp, where you can confirm details and arrange courier delivery.
            </p>
          </div>

          <div className="bg-[#FFF8F9] p-4 rounded-xl border border-[#F5D8E0] space-y-1">
            <h4 className="font-semibold text-[#1F1A1C]">
              Q. Can I request video calls to inspect bridal sets before ordering?
            </h4>
            <p className="text-[#5A4E53]">
              Yes! You can request a WhatsApp video call with Akshaysinh Kher during showroom hours to see the shine, finish, and flexibility of any bridal jewellery set live.
            </p>
          </div>

        </div>
      </section>
    </PolicyLayout>
  );
};
