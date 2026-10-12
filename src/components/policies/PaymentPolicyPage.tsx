import React from 'react';
import { PolicyLayout } from './PolicyLayout';
import { BUSINESS_DETAILS } from '../../data/business';
import { CreditCard, QrCode, ShieldCheck, AlertTriangle, RefreshCw, Lock, HelpCircle } from 'lucide-react';

interface PaymentPolicyPageProps {
  onNavigate: (path: string) => void;
}

export const PaymentPolicyPage: React.FC<PaymentPolicyPageProps> = ({ onNavigate }) => {
  return (
    <PolicyLayout
      title="Payment Policy"
      subtitle="Details on accepted payment modes, UPI transactions, online payment gateway verification status, safety measures, and payment confirmation for Vaidehi Imitation."
      badge="Billing & Payment Methods"
      lastUpdated="October 2026"
      currentPath="/payment-policy"
      onNavigate={onNavigate}
    >
      {/* 1. Accepted Payment Methods */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <CreditCard className="w-5 h-5 text-[#8B4F58]" />
          <h2>1. Accepted Payment Methods</h2>
        </div>
        <p>
          At <strong>{BUSINESS_DETAILS.brandName}</strong>, we offer transparent, hassle-free payment options for our customers across India:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          
          <div className="bg-[#FFF8F9] p-4 rounded-2xl border border-[#F5D8E0] space-y-2">
            <div className="flex items-center gap-2 text-[#8B4F58]">
              <QrCode className="w-4 h-4" />
              <h4 className="font-semibold text-xs uppercase tracking-wider">
                Direct UPI & QR Code
              </h4>
            </div>
            <p className="text-xs text-[#5A4E53] leading-relaxed">
              Instant 0% transaction fee payments via <strong>Google Pay, PhonePe, Paytm, BHIM UPI, and WhatsApp Pay</strong>. Our official showroom UPI QR code or VPA is shared directly during WhatsApp order confirmation.
            </p>
          </div>

          <div className="bg-[#FFF8F9] p-4 rounded-2xl border border-[#F5D8E0] space-y-2">
            <div className="flex items-center gap-2 text-[#8B4F58]">
              <RefreshCw className="w-4 h-4" />
              <h4 className="font-semibold text-xs uppercase tracking-wider">
                Bank Transfer (IMPS / NEFT)
              </h4>
            </div>
            <p className="text-xs text-[#5A4E53] leading-relaxed">
              Direct bank transfer to the official proprietary account of <strong>{BUSINESS_DETAILS.ownerName}</strong> for high-value bridal set purchases.
            </p>
          </div>

        </div>
      </section>

      {/* 2. Cash on Delivery Policy */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <ShieldCheck className="w-5 h-5 text-[#8B4F58]" />
          <h2>2. Cash on Delivery (COD) Guidelines</h2>
        </div>
        <div className="bg-[#FFFDF5] border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
          <p className="font-semibold text-amber-950">
            Cash on Delivery Availability <span className="font-mono bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-[10px] font-semibold">[OWNER TO CONFIRM: COD Availability]</span>:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-amber-800">
            <li>Cash on Delivery may be enabled for selected postal pin codes upon phone/WhatsApp verification.</li>
            <li>For high-value custom bridal sets, an advance confirmation token deposit (e.g. ₹200 to ₹500 <span className="font-mono bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-[10px] font-semibold">[OWNER TO CONFIRM]</span>) may be requested prior to dispatch to cover courier transit charges in case of customer unavailability.</li>
            <li>The balance amount is payable in cash or UPI directly to the courier delivery agent upon parcel handover.</li>
          </ul>
        </div>
      </section>

      {/* 3. Payment Gateway Notice */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <Lock className="w-5 h-5 text-[#8B4F58]" />
          <h2>3. Online Payment Gateway Status (Razorpay Integration)</h2>
        </div>
        <div className="bg-[#F8F9FA] border border-gray-200 rounded-2xl p-4 text-xs text-[#4A5568] space-y-2">
          <p className="font-semibold text-gray-900">
            Transparent Disclosure regarding Payment Gateway Providers:
          </p>
          <p className="leading-relaxed">
            {BUSINESS_DETAILS.brandName} is currently in the process of merchant onboarding and verification with certified online payment gateway service providers (such as <strong>Razorpay</strong> <span className="font-mono bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-[10px] font-semibold">[OWNER TO CONFIRM: Gateway Status - Under Activation]</span>).
          </p>
          <p className="leading-relaxed">
            Until the automated online gateway is fully activated and verified on our website, transactions are carried out seamlessly and safely via direct UPI and bank transfers with verified payment confirmation on WhatsApp. Once live, customer credit cards, debit cards, and net banking options will be processed under RBI-regulated 256-bit encrypted security standards.
          </p>
        </div>
      </section>

      {/* 4. Payment Confirmation Workflow */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <QrCode className="w-5 h-5 text-[#8B4F58]" />
          <h2>4. Payment Confirmation Workflow</h2>
        </div>
        <p>
          To ensure your payment is credited to the correct order without delay:
        </p>
        <ol className="list-decimal pl-5 space-y-1.5 text-xs text-[#5A4E53]">
          <li>After transferring via UPI or Net Banking, please take a clear screenshot of the successful transaction page displaying the <strong>12-digit UTR / Transaction Reference Number</strong>.</li>
          <li>Share the screenshot in your ongoing WhatsApp chat with <strong>{BUSINESS_DETAILS.formattedPhone}</strong>.</li>
          <li>Our showroom representative will reconcile the credit with our bank and issue an official WhatsApp order confirmation along with your estimated dispatch date.</li>
        </ol>
      </section>

      {/* 5. Anti-Fraud & Security Notice */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h2>5. Customer Safety & Anti-Fraud Warnings</h2>
        </div>
        <div className="bg-[#FFF0F3] border border-[#F5B8C7] rounded-2xl p-4 text-xs text-[#8B4F58] space-y-2">
          <p className="font-bold text-[#1F1A1C]">
            Please protect yourself against digital fraud:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#5A4E53]">
            <li><strong>Never Share Your UPI PIN:</strong> Entering your UPI PIN is only required to send money from your account, <em>never</em> to receive a refund or receive cashback.</li>
            <li><strong>Official Contact Only:</strong> Only communicate and transfer payments through the official number of proprietor <strong>{BUSINESS_DETAILS.ownerName} ({BUSINESS_DETAILS.formattedPhone})</strong>.</li>
            <li>We will never ask you to install any remote desktop applications (such as AnyDesk, TeamViewer, or RustDesk) on your phone.</li>
          </ul>
        </div>
      </section>

      {/* 6. Failed Transactions */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <RefreshCw className="w-5 h-5 text-[#8B4F58]" />
          <h2>6. Failed Transactions & Double Debits</h2>
        </div>
        <p>
          In rare circumstances where your bank debits funds but your transaction shows as failed or timed out:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#5A4E53]">
          <li>Funds are securely held in the inter-bank NPCI settlement pool and are automatically reversed by your bank to your source account within <strong>48 to 72 bank working hours</strong>.</li>
          <li>If the debited amount does not revert within 3 bank working days, please share the transaction UTR number with us on WhatsApp so we can verify whether the funds reached our merchant account.</li>
        </ul>
      </section>

      {/* 7. Billing Contact */}
      <section className="bg-white p-5 rounded-2xl border border-[#F5D8E0] space-y-2 text-xs">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-base">
          <HelpCircle className="w-4 h-4 text-[#8B4F58]" />
          <h3>7. Billing Inquiries & Payment Verification Support</h3>
        </div>
        <p className="text-[#5A4E53]">
          For any payment status queries, invoice copies, or corporate bridal gifting bills:
        </p>
        <p className="font-semibold text-[#1F1A1C]">
          Contact Akshaysinh Kher on WhatsApp: <span className="text-[#8B4F58]">{BUSINESS_DETAILS.formattedPhone}</span>
        </p>
      </section>
    </PolicyLayout>
  );
};
