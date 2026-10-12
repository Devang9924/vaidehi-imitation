import React from 'react';
import { PolicyLayout } from './PolicyLayout';
import { BUSINESS_DETAILS } from '../../data/business';
import { RotateCcw, XCircle, Video, Clock, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';

interface CancellationRefundPolicyPageProps {
  onNavigate: (path: string) => void;
}

export const CancellationRefundPolicyPage: React.FC<CancellationRefundPolicyPageProps> = ({ onNavigate }) => {
  return (
    <PolicyLayout
      title="Cancellation & Refund Policy"
      subtitle="Transparent guidelines on order cancellations, transit damage claims, return criteria, unboxing video protocol, and refund processing for Vaidehi Imitation."
      badge="Returns & Refunds"
      lastUpdated="October 2026"
      currentPath="/cancellation-refund-policy"
      onNavigate={onNavigate}
    >
      {/* 1. Cancellation Policy */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <XCircle className="w-5 h-5 text-[#8B4F58]" />
          <h2>1. Order Cancellation Guidelines</h2>
        </div>
        <p>
          We want you to feel confident when shopping with <strong>{BUSINESS_DETAILS.brandName}</strong>. You may request cancellation of your order under the following conditions:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-[#5A4E53]">
          <li>
            <strong>Cancellation Before Courier Dispatch:</strong> You can cancel your order free of charge at any time <em>before</em> your parcel has been handed over to the courier service. To cancel, please message us immediately on WhatsApp at <strong>{BUSINESS_DETAILS.formattedPhone}</strong> with your order details. If payment was already made, 100% of the payment will be refunded.
          </li>
          <li>
            <strong>Cancellation After Courier Dispatch:</strong> Once your shipment has been picked up by the courier partner and an AWB tracking number has been generated, the order cannot be canceled mid-transit. In such cases, standard delivery must proceed.
          </li>
        </ul>
      </section>

      {/* 2. Return & Replacement Eligibility */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <RotateCcw className="w-5 h-5 text-[#8B4F58]" />
          <h2>2. Return & Replacement Eligibility</h2>
        </div>
        <p>
          Due to hygiene, personal wear nature, and delicate artisanal craftsmanship of imitation jewellery, <strong>we do not accept returns or refunds for general "change of mind" or styling preferences</strong> once delivered in intact condition.
        </p>
        <div className="bg-[#FFF8F9] p-4 rounded-2xl border border-[#F5D8E0] space-y-2">
          <p className="font-semibold text-xs text-[#8B4F58] uppercase tracking-wider">
            Returns or replacements are strictly accepted for the following valid reasons:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-[#5A4E53]">
            <li><strong>Transit Damage:</strong> The piece arrived broken, with detached stones, bent prongs, or damaged lock mechanisms caused during postal transit.</li>
            <li><strong>Wrong Product Delivered:</strong> The item code, design, or category received differs entirely from the confirmed WhatsApp order invoice.</li>
          </ul>
        </div>
      </section>

      {/* 3. Mandatory Unboxing Video Requirement */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <Video className="w-5 h-5 text-[#8B4F58]" />
          <h2>3. Mandatory 360° Unboxing Video Requirement</h2>
        </div>
        <p>
          To maintain transparency and prevent false damage disputes with courier insurance, <strong>an unboxing video is strictly mandatory</strong> to claim any damage or missing item:
        </p>
        <div className="bg-[#FFFDF5] border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
          <p className="font-bold text-amber-950">
            Rules for Valid Unboxing Video <span className="font-mono bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-[10px] font-semibold">[OWNER TO CONFIRM: Unboxing Video Policy]</span>:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-amber-800">
            <li>The video recording must start <strong>before opening the outer flyer</strong>, showing all four sides of the sealed parcel clearly.</li>
            <li>The video must be <strong>continuous, single-take, and completely unedited</strong> without any cuts, pauses, or digital tampering.</li>
            <li>The unboxing and unpacking of the inner jewellery box must be clearly visible within the video frame.</li>
            <li>Any damage or detached stone must be shown clearly in close-up during the video.</li>
          </ol>
          <p className="text-[11px] text-amber-800 italic pt-1">
            * Claims submitted without an unbroken opening video cannot be honored, as courier companies reject transit liability without proof of original opening state.
          </p>
        </div>
      </section>

      {/* 4. Reporting Timeframe */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <Clock className="w-5 h-5 text-[#8B4F58]" />
          <h2>4. Reporting Window (Within 24 to 48 Hours)</h2>
        </div>
        <p>
          Any transit damage or incorrect parcel issue must be reported to our WhatsApp support at <strong>{BUSINESS_DETAILS.formattedPhone}</strong> within <strong>24 to 48 hours of parcel delivery</strong> <span className="font-mono bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-xs font-semibold">[OWNER TO CONFIRM: 24–48 Hours Reporting Window]</span>.
        </p>
        <p className="text-xs text-[#6E6267]">
          Claims raised after this window cannot be entertained as the piece has been out of our packaging custody beyond the reporting timeline.
        </p>
      </section>

      {/* 5. Resolution & Refund Mode */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <CheckCircle2 className="w-5 h-5 text-[#8B4F58]" />
          <h2>5. Resolution & Refund Processing Time</h2>
        </div>
        <p>
          Once your unboxing video and photos are reviewed by proprietor <strong>{BUSINESS_DETAILS.ownerName}</strong>:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-[#5A4E53]">
          <li>
            <strong>Immediate Free Replacement:</strong> If the identical design is in showroom stock, an express replacement will be dispatched to you at no extra courier charge.
          </li>
          <li>
            <strong>Store Credit or Exchange:</strong> If the piece is out of stock, you may choose any other jewellery piece of equal value from our catalogue.
          </li>
          <li>
            <strong>Direct Bank / UPI Refund:</strong> If replacement is not desired or unavailable, a refund will be processed directly to your original UPI ID or Bank Account within <strong>3 to 7 business days</strong> <span className="font-mono bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-xs font-semibold">[OWNER TO CONFIRM: Refund Timeline]</span>.
          </li>
        </ul>
      </section>

      {/* 6. Non-Returnable Items */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <AlertOctagon className="w-5 h-5 text-[#8B4F58]" />
          <h2>6. Non-Returnable & Non-Refundable Items</h2>
        </div>
        <ul className="list-disc pl-5 space-y-1.5 text-[#5A4E53]">
          <li>Items that have been worn, used for events, or have tags/labels removed.</li>
          <li>Custom-altered pieces (custom bangle size re-bending, dori modification requested by buyer).</li>
          <li>Items damaged through customer misuse, perfume spray, water submersion, or physical dropping after delivery.</li>
        </ul>
      </section>

      {/* 7. Need Help */}
      <section className="bg-[#FFF0F3] p-5 rounded-2xl border border-[#F5B8C7] space-y-2">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-base">
          <HelpCircle className="w-4 h-4 text-[#8B4F58]" />
          <h3>7. How to Initiate a Return Request</h3>
        </div>
        <p className="text-xs text-[#5A4E53]">
          Send a WhatsApp message to <strong>{BUSINESS_DETAILS.formattedPhone}</strong> with:
        </p>
        <ol className="list-decimal pl-5 text-xs text-[#1F1A1C] space-y-1 font-medium">
          <li>Your Full Name & Delivery Address</li>
          <li>Product Code or Photo of the ordered item</li>
          <li>Clear 360° Unboxing Video attachment</li>
          <li>Brief description of the issue</li>
        </ol>
      </section>
    </PolicyLayout>
  );
};
