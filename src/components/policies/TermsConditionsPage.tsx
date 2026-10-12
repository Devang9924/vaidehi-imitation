import React from 'react';
import { PolicyLayout } from './PolicyLayout';
import { BUSINESS_DETAILS } from '../../data/business';
import { FileText, Sparkles, AlertCircle, ShoppingBag, Scale, ShieldAlert, CheckCircle } from 'lucide-react';

interface TermsConditionsPageProps {
  onNavigate: (path: string) => void;
}

export const TermsConditionsPage: React.FC<TermsConditionsPageProps> = ({ onNavigate }) => {
  return (
    <PolicyLayout
      title="Terms & Conditions"
      subtitle="Terms of service, browsing guidelines, imitation jewellery craftsmanship disclaimers, pricing terms, and order policies for Vaidehi Imitation."
      badge="Legal & Store Terms"
      lastUpdated="October 2026"
      currentPath="/terms-and-conditions"
      onNavigate={onNavigate}
    >
      {/* 1. Introduction & Agreement */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <FileText className="w-5 h-5 text-[#8B4F58]" />
          <h2>1. Introduction & Agreement</h2>
        </div>
        <p>
          These Terms and Conditions govern your access to and use of the website <strong>https://vaidehi-imitation.vercel.app</strong> and all direct customer sales channels (including WhatsApp catalogue inquiries, showroom visits, and phone orders) provided by <strong>{BUSINESS_DETAILS.brandName}</strong>, managed by proprietor <strong>{BUSINESS_DETAILS.ownerName}</strong>, located at Near Bank of Baroda, Dhasa Railway Station Road, Dhasa Junction, Gujarat - 364740.
        </p>
        <p>
          By accessing our online jewellery catalogue, browsing items, or initiating an order via WhatsApp or phone, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please refrain from using our online catalogue.
        </p>
      </section>

      {/* 2. Imitation Jewellery Specifications & Craftsmanship */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <Sparkles className="w-5 h-5 text-[#8B4F58]" />
          <h2>2. Imitation Jewellery Craftsmanship & Product Disclaimers</h2>
        </div>
        <p>
          <strong>Nature of Products:</strong> All jewellery items showcased by {BUSINESS_DETAILS.brandName} (including bridal necklace sets, Kundan chokers, Rajputi kadas, bangles, juda pins, earrings, and rings) are <strong>premium fashion & imitation jewellery</strong> crafted from brass, copper, copper-alloy, micro gold-plating, artificial stones, simulated pearls, and Kundan-polki glass work.
        </p>
        <div className="bg-[#FFF8F9] rounded-2xl p-4 border border-[#F5D8E0] space-y-2 text-xs text-[#5A4E53]">
          <p className="font-semibold text-[#8B4F58]">
            Please take note of the following natural characteristics of imitation jewellery:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Handmade Variations:</strong> Handcrafted Kundan, meenakari, and stone-setting work may exhibit minor irregularities or slight variations in alignment, which are intrinsic signatures of traditional craftsmanship, not manufacturing flaws.
            </li>
            <li>
              <strong>Screen & Lighting Variations:</strong> Product photographs are captured under high-definition showroom studio lighting. Minor variations in stone hue, sparkle, or metal tone may appear between different mobile/desktop screens and the physical piece in natural daylight.
            </li>
            <li>
              <strong>Care & Preservation:</strong> Imitation jewellery should never be exposed to direct water, sweat, perfume sprays, deodorants, soaps, or harsh household chemicals. Always store pieces wrapped in cotton cloth or airtight ziplock pouches to maintain their plating luster.
            </li>
          </ul>
        </div>
      </section>

      {/* 3. Pricing & Currency */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <Scale className="w-5 h-5 text-[#8B4F58]" />
          <h2>3. Pricing, Currency & Taxes</h2>
        </div>
        <ul className="list-disc pl-5 space-y-2 text-[#5A4E53]">
          <li>
            <strong>Currency:</strong> All prices listed on our website and WhatsApp quotes are quoted in <strong>Indian Rupees (INR / ₹)</strong>.
          </li>
          <li>
            <strong>Price Adjustments:</strong> While we endeavor to ensure all prices displayed in our online catalogue are accurate, {BUSINESS_DETAILS.brandName} reserves the right to correct typographical pricing errors or adjust prices prior to final order confirmation.
          </li>
          <li>
            <strong>Shipping Charges:</strong> Shipping fees (if applicable) are quoted separately during WhatsApp order confirmation based on delivery destination and total parcel weight.
          </li>
        </ul>
      </section>

      {/* 4. Orders & Acceptance */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <ShoppingBag className="w-5 h-5 text-[#8B4F58]" />
          <h2>4. Orders & Mutual Acceptance</h2>
        </div>
        <p>
          Placing an item inquiry through our website creates an itemized WhatsApp draft message. An order is considered legally placed and confirmed only when:
        </p>
        <ol className="list-decimal pl-5 space-y-1.5 text-[#5A4E53]">
          <li>Both parties mutually confirm product availability, bangles/ring sizing, and delivery address on WhatsApp.</li>
          <li>The agreed payment or advance deposit is received and confirmed by the showroom.</li>
          <li>Our showroom generates a formal order acknowledgment or parcel dispatch note.</li>
        </ol>
        <p className="text-xs text-[#6E6267]">
          We reserve the right to limit order quantities or decline orders where stock has depleted, addresses are unreachable by couriers, or unauthorized commercial resale is suspected.
        </p>
      </section>

      {/* 5. Payment Terms */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <CheckCircle className="w-5 h-5 text-[#8B4F58]" />
          <h2>5. Payment Terms</h2>
        </div>
        <p>
          Orders are processed for dispatch upon receipt of cleared payment via authorized digital payment methods (UPI, Google Pay, PhonePe, Paytm, Direct Bank Transfer, or Cash on Delivery where approved <span className="font-mono bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-xs font-semibold">[OWNER TO CONFIRM: Payment Options & COD Policy]</span>).
        </p>
        <p>
          Customers must verify that payment transactions are transferred exclusively to the designated official account of <strong>{BUSINESS_DETAILS.ownerName}</strong> or official showroom UPI QR. We are not liable for transfers made to unauthorized third-party numbers.
        </p>
      </section>

      {/* 6. Limitation of Liability */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <ShieldAlert className="w-5 h-5 text-[#8B4F58]" />
          <h2>6. Limitation of Liability</h2>
        </div>
        <p>
          To the maximum extent permitted by applicable Indian law, {BUSINESS_DETAILS.brandName} and its proprietor shall not be liable for:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-[#5A4E53]">
          <li>Any indirect, incidental, or consequential damages arising from delays caused by third-party courier companies, natural weather emergencies, or transport strikes.</li>
          <li>Allergic skin reactions resulting from metallic components or individual skin sensitivities. Customers with known copper or brass allergies are advised to take appropriate precautions.</li>
          <li>Wear and tear, color fading, or plating damage caused by neglect or improper storage with perfumes, lotions, or water.</li>
        </ul>
        <p className="text-xs text-[#6E6267]">
          In all circumstances, our maximum financial liability shall strictly not exceed the invoice price actually paid by the customer for the specific item in dispute.
        </p>
      </section>

      {/* 7. Governing Law & Jurisdiction */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <AlertCircle className="w-5 h-5 text-[#8B4F58]" />
          <h2>7. Governing Law & Jurisdiction</h2>
        </div>
        <p>
          These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes or claims arising out of or in connection with these terms, website usage, or purchase transactions shall be subject to the exclusive jurisdiction of the competent courts in <strong>Botad / Gujarat, India</strong>.
        </p>
      </section>

      {/* 8. Contact for Legal Matters */}
      <section className="space-y-2 bg-[#FFF0F3] p-4 rounded-2xl border border-[#F5B8C7] text-xs">
        <p className="font-semibold text-[#8B4F58]">Questions regarding Terms & Conditions:</p>
        <p className="text-[#5A4E53]">
          Please contact <strong>{BUSINESS_DETAILS.ownerName}</strong> at our showroom in Dhasa Junction or via WhatsApp at <strong>{BUSINESS_DETAILS.formattedPhone}</strong>.
        </p>
      </section>
    </PolicyLayout>
  );
};
