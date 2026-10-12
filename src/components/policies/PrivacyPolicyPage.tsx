import React from 'react';
import { PolicyLayout } from './PolicyLayout';
import { BUSINESS_DETAILS } from '../../data/business';
import { ShieldCheck, Lock, Eye, Database, Share2, UserCheck, MailQuestion } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigate: (path: string) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
  return (
    <PolicyLayout
      title="Privacy Policy"
      subtitle="How Vaidehi Imitation collects, uses, protects, and handles your personal information when you browse our jewellery catalogue and place orders."
      badge="Data Protection & Privacy"
      lastUpdated="October 2026"
      currentPath="/privacy-policy"
      onNavigate={onNavigate}
    >
      {/* 1. Introduction */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <ShieldCheck className="w-5 h-5 text-[#8B4F58]" />
          <h2>1. Introduction & Overview</h2>
        </div>
        <p>
          Welcome to <strong>{BUSINESS_DETAILS.brandName}</strong>, operated as a proprietary jewellery showroom managed by <strong>{BUSINESS_DETAILS.ownerName}</strong>, located at Near Bank of Baroda, Dhasa Railway Station Road, Dhasa Junction, Taluka Gadhada, District Botad, Gujarat - 364740.
        </p>
        <p>
          We are committed to respecting and protecting the privacy of our visitors and customers. This Privacy Policy details our data collection practices, storage mechanisms, and usage policies when you visit our website (<strong>https://vaidehi-imitation.vercel.app</strong>), interact with our online catalogue, submit product inquiries, or complete purchases through our WhatsApp checkout system.
        </p>
      </section>

      {/* 2. Information We Collect */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <Database className="w-5 h-5 text-[#8B4F58]" />
          <h2>2. Information We Collect</h2>
        </div>
        <p>
          When you interact with our website or initiate an order inquiry, we may collect the following categories of information:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-[#5A4E53]">
          <li>
            <strong>Customer Contact Details:</strong> Your full name, mobile phone number, WhatsApp contact number, and city/town.
          </li>
          <li>
            <strong>Delivery & Shipping Information:</strong> Complete recipient delivery address including building/house details, nearby landmarks, street, taluka, district, state, and 6-digit postal PIN code required for accurate courier dispatch.
          </li>
          <li>
            <strong>Order & Enquiry History:</strong> The specific jewellery items (product codes, names, categories, selected quantities, custom size requests, and price quotations) inquired about or ordered.
          </li>
          <li>
            <strong>Customer Reviews & Feedback:</strong> Name, star rating, feedback messages, and associated product codes voluntarily submitted through our customer review system.
          </li>
          <li>
            <strong>Technical & Device Data:</strong> Standard browser user-agent, device screen dimensions, and referral URLs collected automatically by web hosting infrastructure to ensure optimal mobile responsiveness and site performance.
          </li>
        </ul>
        <div className="bg-[#FFF8F9] border-l-4 border-[#8B4F58] p-3 rounded-r-xl text-xs text-[#6E6267]">
          <strong>Note on Financial Data:</strong> We <em>do not</em> store customer credit card numbers, debit card numbers, CVVs, or Net Banking credentials on our servers. All direct UPI payments occur securely through your authorized banking application (such as Google Pay, PhonePe, Paytm, or BHIM).
        </div>
      </section>

      {/* 3. Why We Collect Information */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <Eye className="w-5 h-5 text-[#8B4F58]" />
          <h2>3. Purpose & How We Use Your Information</h2>
        </div>
        <p>
          The information we gather is used strictly for legitimate commercial and customer-support purposes:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-[#5A4E53]">
          <li>Processing, packing, and dispatching your jewellery orders.</li>
          <li>Printing accurate shipping and delivery labels for parcel carriers.</li>
          <li>Communicating order status, dispatch docket numbers, and tracking links via WhatsApp.</li>
          <li>Responding to your sizing queries, bridal set customizations, and product availability requests.</li>
          <li>Preventing fraudulent inquiries and duplicate orders.</li>
          <li>Publishing approved customer reviews on our website (only with customer consent).</li>
        </ul>
      </section>

      {/* 4. Data Sharing & Third Parties */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <Share2 className="w-5 h-5 text-[#8B4F58]" />
          <h2>4. Data Sharing with Third-Party Service Providers</h2>
        </div>
        <p>
          <strong>We never sell, trade, or rent customer personal information to third-party marketing agencies or data brokers.</strong>
        </p>
        <p>
          We share necessary data solely with essential operational partners who assist us in running our business:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-[#5A4E53]">
          <li>
            <strong>Courier & Logistics Partners:</strong> We share your recipient name, contact phone number, and delivery address with authorized domestic courier and postal delivery companies (e.g. DTDC, Tirupati Courier, Indian Speed Post <span className="font-mono bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-xs font-semibold">[OWNER TO CONFIRM: Active Courier Partners]</span>) solely to execute door delivery.
          </li>
          <li>
            <strong>Payment Processing Providers:</strong> When online payment gateways are activated (e.g. Razorpay or authorized UPI payment interfaces <span className="font-mono bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-xs font-semibold">[OWNER TO CONFIRM: Payment Gateway Status]</span>), transaction information is shared with certified, RBI-compliant payment gateway providers to complete fund settlement and fraud monitoring.
          </li>
          <li>
            <strong>Legal & Regulatory Authorities:</strong> We may disclose information if legally obligated to do so by applicable laws, court orders, or government regulations in India.
          </li>
        </ul>
      </section>

      {/* 5. Data Security & Storage */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <Lock className="w-5 h-5 text-[#8B4F58]" />
          <h2>5. Data Security & Storage</h2>
        </div>
        <p>
          We employ robust technical and organizational safeguards to protect customer data:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-[#5A4E53]">
          <li>All web traffic between your browser and our website is protected using industry-standard SSL/TLS encryption (HTTPS).</li>
          <li>Catalogue product data and customer reviews are stored on secure cloud database infrastructure provided by Supabase with Row-Level Security (RLS) enforcement.</li>
          <li>Administrative access to customer records is restricted strictly to authorized store personnel under password-protected authentication.</li>
        </ul>
        <p className="text-xs text-[#6E6267]">
          While we implement strong security practices, no transmission of data over the internet can be guaranteed as 100% impenetrable. We encourage customers never to share sensitive banking PINs or OTPs over public channels.
        </p>
      </section>

      {/* 6. Customer Rights */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-lg border-b border-[#F5D8E0] pb-2">
          <UserCheck className="w-5 h-5 text-[#8B4F58]" />
          <h2>6. Your Privacy Rights</h2>
        </div>
        <p>
          As our customer, you have the following rights regarding your information:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-[#5A4E53]">
          <li><strong>Right to Review & Correct:</strong> You may request corrections to your delivery address, recipient name, or phone number before your order is dispatched.</li>
          <li><strong>Right to Deletion:</strong> You may request the deletion of your customer review or inquiry records from our database by messaging us directly.</li>
          <li><strong>Opt-Out of Updates:</strong> You may at any time request that we discontinue sending you WhatsApp promotional broadcasts or new catalogue updates.</li>
        </ul>
      </section>

      {/* 7. Contact for Privacy Inquiries */}
      <section className="space-y-3 bg-[#FFF0F3] p-5 rounded-2xl border border-[#F5B8C7]">
        <div className="flex items-center gap-2 text-[#8B4F58] font-heading font-bold text-base">
          <MailQuestion className="w-4 h-4 text-[#8B4F58]" />
          <h3>7. Privacy Inquiries & Grievance Contact</h3>
        </div>
        <p className="text-xs text-[#5A4E53]">
          If you have any questions, suggestions, or concerns regarding this Privacy Policy or how your personal information is handled, please reach out to our proprietor directly:
        </p>
        <div className="text-xs space-y-1 pt-1 text-[#1F1A1C]">
          <p><strong>Business Name:</strong> {BUSINESS_DETAILS.brandName}</p>
          <p><strong>Proprietor & Grievance Officer:</strong> {BUSINESS_DETAILS.ownerName}</p>
          <p><strong>Showroom Address:</strong> {BUSINESS_DETAILS.address.fullFormatted}</p>
          <p><strong>WhatsApp & Phone:</strong> {BUSINESS_DETAILS.formattedPhone}</p>
        </div>
      </section>
    </PolicyLayout>
  );
};
