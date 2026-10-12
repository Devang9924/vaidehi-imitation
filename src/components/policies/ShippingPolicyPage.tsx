import React from 'react';
import { PolicyLayout } from './PolicyLayout';
import { BUSINESS_DETAILS } from '../../data/business';
import { Truck, Clock, PackageCheck, MapPin, AlertCircle, PhoneCall, Gift } from 'lucide-react';

interface ShippingPolicyPageProps {
  onNavigate: (path: string) => void;
}

export const ShippingPolicyPage: React.FC<ShippingPolicyPageProps> = ({ onNavigate }) => {
  return (
    <PolicyLayout
      title="Shipping & Delivery Policy"
      subtitle="Complete information on packaging safety, domestic courier partners, dispatch timelines, shipping rates, and parcel tracking for Vaidehi Imitation."
      badge="Delivery & Courier Information"
      lastUpdated="October 2026"
      currentPath="/shipping-policy"
      onNavigate={onNavigate}
    >
      {/* 1. Overview */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <Truck className="w-5 h-5 text-[#8B4F58]" />
          <h2>1. Shipping Service & Delivery Coverage</h2>
        </div>
        <p>
          At <strong>{BUSINESS_DETAILS.brandName}</strong>, we take immense care in delivering delicate bridal and traditional imitation jewellery safely to your doorstep. We service customers across <strong>Gujarat and all serviceable postal PIN codes across India</strong> via established domestic express couriers and postal services.
        </p>
      </section>

      {/* 2. Processing & Dispatch Times */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <Clock className="w-5 h-5 text-[#8B4F58]" />
          <h2>2. Order Processing & Dispatch Timelines</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#FFF8F9] p-4 rounded-2xl border border-[#F5D8E0] space-y-1.5">
            <h4 className="font-semibold text-xs text-[#8B4F58] uppercase tracking-wider">
              In-Stock Showroom Items
            </h4>
            <p className="text-sm font-bold text-[#1F1A1C]">
              1 to 2 Business Days <span className="font-mono bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-[10px] font-semibold">[OWNER TO CONFIRM]</span>
            </p>
            <p className="text-xs text-[#6E6267] font-light">
              Orders placed and payment confirmed for in-stock showroom items are inspected, bubble-wrapped, and handed to the courier within 24–48 hours.
            </p>
          </div>

          <div className="bg-[#FFF8F9] p-4 rounded-2xl border border-[#F5D8E0] space-y-1.5">
            <h4 className="font-semibold text-xs text-[#8B4F58] uppercase tracking-wider">
              Custom Bridal Sets & Sizing
            </h4>
            <p className="text-sm font-bold text-[#1F1A1C]">
              2 to 4 Business Days <span className="font-mono bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-[10px] font-semibold">[OWNER TO CONFIRM]</span>
            </p>
            <p className="text-xs text-[#6E6267] font-light">
              Special bangles sizing, custom dori adjustments, or bridal matching sets may require additional preparation before dispatch.
            </p>
          </div>
        </div>
        <p className="text-xs text-[#6E6267] pt-1">
          * Note: Orders are dispatched Monday through Saturday. Couriers do not operate pickups on Sundays and official gazetted public holidays in Gujarat.
        </p>
      </section>

      {/* 3. Estimated Transit Times */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <MapPin className="w-5 h-5 text-[#8B4F58]" />
          <h2>3. Estimated Delivery Times by Destination</h2>
        </div>
        <p>
          Once your parcel is handed over to our logistics partner, approximate delivery transit times are as follows:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-[#F5D8E0] rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[#FFF0F3] text-[#8B4F58] font-semibold border-b border-[#F5D8E0]">
                <th className="p-3">Delivery Zone</th>
                <th className="p-3">Estimated Transit Days</th>
                <th className="p-3">Carrier Partner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5D8E0] text-[#5A4E53]">
              <tr className="hover:bg-[#FFF9FA]">
                <td className="p-3 font-medium text-[#1F1A1C]">Within Saurashtra & Gujarat</td>
                <td className="p-3">2 to 3 Business Days <span className="font-mono bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-[10px] font-semibold">[OWNER TO CONFIRM]</span></td>
                <td className="p-3">Tirupati / DTDC Express <span className="font-mono bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-[10px] font-semibold">[OWNER TO CONFIRM]</span></td>
              </tr>
              <tr className="hover:bg-[#FFF9FA]">
                <td className="p-3 font-medium text-[#1F1A1C]">Major Metro Cities (Mumbai, Delhi, etc.)</td>
                <td className="p-3">3 to 5 Business Days <span className="font-mono bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-[10px] font-semibold">[OWNER TO CONFIRM]</span></td>
                <td className="p-3">DTDC / Express Cargo <span className="font-mono bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-[10px] font-semibold">[OWNER TO CONFIRM]</span></td>
              </tr>
              <tr className="hover:bg-[#FFF9FA]">
                <td className="p-3 font-medium text-[#1F1A1C]">Rest of India & Rural Locations</td>
                <td className="p-3">5 to 7 Business Days <span className="font-mono bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-[10px] font-semibold">[OWNER TO CONFIRM]</span></td>
                <td className="p-3">India Post Speed Post / Regional Courier <span className="font-mono bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-[10px] font-semibold">[OWNER TO CONFIRM]</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Shipping Charges */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <Gift className="w-5 h-5 text-[#8B4F58]" />
          <h2>4. Shipping Charges & Free Delivery Threshold</h2>
        </div>
        <ul className="list-disc pl-5 space-y-2 text-[#5A4E53]">
          <li>
            <strong>Standard Shipping Rates:</strong> Standard shipping fee is calculated transparently based on courier weight and destination pin code (typically ranging from ₹60 to ₹120 for standard domestic parcels <span className="font-mono bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-xs font-semibold">[OWNER TO CONFIRM: Standard Shipping Rate]</span>).
          </li>
          <li>
            <strong>Free Delivery Offer:</strong> Free domestic shipping is provided on prepaid orders above ₹999 <span className="font-mono bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-xs font-semibold">[OWNER TO CONFIRM: Free Shipping Threshold Amount]</span>.
          </li>
          <li>
            <strong>Total Cost Confirmation:</strong> You will always be informed of the exact shipping charges upfront on WhatsApp before making payment.
          </li>
        </ul>
      </section>

      {/* 5. Safe Packaging Standards */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <PackageCheck className="w-5 h-5 text-[#8B4F58]" />
          <h2>5. Safe & Secure Multi-Layer Packaging</h2>
        </div>
        <p>
          Because imitation jewellery contains intricate stone prongs, delicate latches, and fine polish, our packaging protocol includes:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-[#5A4E53]">
          <li><strong>Layer 1:</strong> Individual protective plastic wrapping and velvet card support to prevent entanglement.</li>
          <li><strong>Layer 2:</strong> High-density air bubble wrap cushion around every individual jewellery piece.</li>
          <li><strong>Layer 3:</strong> Rigid crush-resistant cardboard box or hard plastic jewellery container.</li>
          <li><strong>Layer 4:</strong> Water-resistant tamper-evident outer courier flyer with tamper-proof seal.</li>
        </ul>
      </section>

      {/* 6. Parcel Tracking */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <PhoneCall className="w-5 h-5 text-[#8B4F58]" />
          <h2>6. Tracking Your Consignment via WhatsApp</h2>
        </div>
        <p>
          Once your parcel is picked up by the courier service, we will promptly message you on WhatsApp with:
        </p>
        <ol className="list-decimal pl-5 space-y-1 text-[#5A4E53]">
          <li>Name of the assigned Courier Partner (e.g. DTDC, Tirupati, or India Post).</li>
          <li>Unique Consignment / AWB Tracking Number.</li>
          <li>Direct Web Tracking URL to track your shipment in real time.</li>
        </ol>
      </section>

      {/* 7. Unforeseen Delays */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <AlertCircle className="w-5 h-5 text-[#8B4F58]" />
          <h2>7. Delivery Delays & Address Accuracy</h2>
        </div>
        <p>
          While 95%+ of our parcels arrive within the estimated window, delivery times may be subject to minor delays due to adverse weather, festival rush seasons (Diwali, Navratri, Wedding season), or remote route logistics.
        </p>
        <div className="bg-[#FFFDF5] p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
          <strong>Important Customer Responsibility:</strong> Please ensure your delivery address, landmarks, and recipient phone number are complete and reachable. Courier delivery agents call the provided number upon arrival.
        </div>
      </section>
    </PolicyLayout>
  );
};
