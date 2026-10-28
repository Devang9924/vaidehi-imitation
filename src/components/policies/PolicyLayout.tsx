import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  MessageCircle, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  FileText, 
  Truck, 
  RotateCcw, 
  CreditCard, 
  Headphones,
  ChevronRight
} from 'lucide-react';
import { BUSINESS_DETAILS } from '../../data/business';
import { createGeneralInquiryUrl } from '../../lib/whatsapp';

interface PolicyNavItem {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const POLICY_NAV_ITEMS: PolicyNavItem[] = [
  { title: 'Privacy Policy', path: '/privacy-policy', icon: ShieldCheck },
  { title: 'Terms & Conditions', path: '/terms-and-conditions', icon: FileText },
  { title: 'Shipping & Delivery', path: '/shipping-policy', icon: Truck },
  { title: 'Cancellation & Refund', path: '/cancellation-refund-policy', icon: RotateCcw },
  { title: 'Payment Policy', path: '/payment-policy', icon: CreditCard },
  { title: 'Contact Us', path: '/contact-us', icon: Headphones },
];

interface PolicyLayoutProps {
  title: string;
  subtitle: string;
  badge: string;
  lastUpdated?: string;
  currentPath: string;
  onNavigate: (route: string) => void;
  children: React.ReactNode;
}

export const PolicyLayout: React.FC<PolicyLayoutProps> = ({
  title,
  subtitle,
  badge,
  lastUpdated = 'October 2026',
  currentPath,
  onNavigate,
  children,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPath]);

  return (
    <div className="min-h-screen bg-[#FFF8F9] text-[#1F1A1C] flex flex-col font-sans-clean antialiased selection:bg-[#F2C0CE] selection:text-[#1F1A1C]">
      
      {/* Top Brand Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#F5D8E0] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Back Button & Logo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="p-2 -ml-2 rounded-xl text-[#6E6267] hover:text-[#1F1A1C] hover:bg-[#FFF0F3] transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title="Return to jewellery store"
              >
                <ArrowLeft className="w-4 h-4 text-[#8B4F58]" />
                <span className="hidden sm:inline">Back to Store</span>
              </button>

              <div className="h-6 w-px bg-[#F5D8E0] hidden sm:block" />

              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="flex items-center gap-2.5 text-left cursor-pointer group"
              >
                <img
                  src="/logo.png"
                  alt="Vaidehi Imitation Logo"
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#D4A373] shadow-xs group-hover:scale-105 transition-transform"
                />
                <div>
                  <span className="font-heading font-bold text-base sm:text-lg text-[#1F1A1C] block leading-tight">
                    {BUSINESS_DETAILS.brandName}
                  </span>
                  <span className="text-[10px] text-[#8B4F58] font-medium tracking-wide">
                    Dhasa Junction, Gujarat
                  </span>
                </div>
              </button>
            </div>

            {/* Support Actions in Header */}
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href={createGeneralInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                title="Direct WhatsApp with showroom"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp Help</span>
              </a>
              <a
                href={`tel:${BUSINESS_DETAILS.whatsappPhone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#B76E79] text-[#8B4F58] hover:bg-white text-xs font-semibold transition-colors"
                title="Call showroom"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{BUSINESS_DETAILS.formattedPhone}</span>
              </a>
            </div>

          </div>
        </div>
      </header>

      {/* Hero Banner for Policy */}
      <section className="bg-gradient-to-b from-white via-[#FFF5F7] to-[#FFF8F9] border-b border-[#F5D8E0] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-[#8E8085] mb-4" aria-label="Breadcrumb">
            <button
              onClick={() => onNavigate('/')}
              className="hover:text-[#8B4F58] transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3 h-3 text-[#D4A373]" />
            <span className="text-[#8B4F58] font-medium">Customer Policies</span>
            <ChevronRight className="w-3 h-3 text-[#D4A373]" />
            <span className="text-[#1F1A1C] font-semibold truncate">{title}</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] border border-[#F5B8C7] text-[#8B4F58] text-xs font-semibold uppercase tracking-wider mb-3">
              <span>{badge}</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl text-[#1F1A1C] font-bold tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-base text-[#6E6267] mt-2 font-light leading-relaxed">
              {subtitle}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#8E8085] mt-4 pt-3 border-t border-[#F5D8E0]/70">
              <span>
                <strong>Store:</strong> {BUSINESS_DETAILS.brandName} (Prop. {BUSINESS_DETAILS.ownerName})
              </span>
              <span>•</span>
              <span>
                <strong>Last Updated:</strong> {lastUpdated}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Main Content & Navigation Sidebar */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Navigation (4 cols) */}
          <aside className="lg:col-span-4 order-2 lg:order-1">
            <div className="sticky top-24 space-y-6">
              
              {/* Policies Navigation Card */}
              <div className="bg-white rounded-2xl p-5 border border-[#F5D8E0] shadow-2xs space-y-3">
                <h3 className="font-heading text-sm font-bold text-[#1F1A1C] uppercase tracking-wider">
                  Store Policies
                </h3>
                <nav className="space-y-1">
                  {POLICY_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.path;
                    return (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() => onNavigate(item.path)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                          isActive
                            ? 'bg-[#8B4F58] text-white shadow-xs font-semibold'
                            : 'text-[#5A4E53] hover:bg-[#FFF0F3] hover:text-[#8B4F58]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#ECC8AF]' : 'text-[#8B4F58]'}`} />
                          <span className="truncate">{item.title}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-[#D8CFD2]'}`} />
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Showroom Direct Contact Card */}
              <div className="bg-[#FFF0F3] rounded-2xl p-5 border border-[#F5B8C7] space-y-4">
                <div className="flex items-center gap-2 text-[#8B4F58]">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <h4 className="font-heading font-bold text-sm text-[#1F1A1C]">
                    Showroom Assistance
                  </h4>
                </div>
                <p className="text-xs text-[#5A4E53] leading-relaxed">
                  Have a question about orders, custom bridal sizing, or payment confirmation? We are available directly on WhatsApp.
                </p>
                <div className="space-y-2 text-xs pt-1">
                  <div className="flex items-center gap-2 text-[#1F1A1C] font-medium">
                    <span className="text-[#8B4F58]">Proprietor:</span>
                    <span>{BUSINESS_DETAILS.ownerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#1F1A1C] font-medium">
                    <span className="text-[#8B4F58]">WhatsApp:</span>
                    <span>{BUSINESS_DETAILS.formattedPhone}</span>
                  </div>
                </div>
                <a
                  href={createGeneralInquiryUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors text-center shadow-2xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

            </div>
          </aside>

          {/* Main Policy Document (8 cols) */}
          <article className="lg:col-span-8 order-1 lg:order-2 space-y-6">
            
            {/* Injected Policy Document Content */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#F5D8E0] shadow-2xs space-y-8 text-left leading-relaxed text-sm text-[#4A3E43]">
              {children}
            </div>

          </article>

        </div>
      </main>

    </div>
  );
};
