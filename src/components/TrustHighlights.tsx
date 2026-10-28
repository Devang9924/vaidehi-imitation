import React from 'react';
import { Gem, Video, ShieldCheck, MapPin } from 'lucide-react';

export const TrustHighlights: React.FC = () => {
  const highlights = [
    {
      icon: Gem,
      iconColor: 'text-[#C8792C]',
      iconBg: 'bg-[#FAF4EA] border-[#F4D9A0]',
      title: 'Direct Showroom Rates',
      description: 'Honest workshop pricing with no middlemen or retail markups.',
    },
    {
      icon: Video,
      iconColor: 'text-emerald-700',
      iconBg: 'bg-emerald-50 border-emerald-200',
      title: 'WhatsApp Video Preview',
      description: 'Inspect gemstone sparkle and finish live with Akshaysinh Kher.',
    },
    {
      icon: ShieldCheck,
      iconColor: 'text-[#7A1830]',
      iconBg: 'bg-[#FAF4EA] border-[#F4D9A0]',
      title: 'Durable Bridal Polish',
      description: 'High-grade micro-gold plating engineered for skin-safe comfort.',
    },
    {
      icon: MapPin,
      iconColor: 'text-[#5B4632]',
      iconBg: 'bg-[#FAF4EA] border-[#F4D9A0]',
      title: 'Showroom & Pan-India Dispatch',
      description: 'Visit our Dhasa store or receive secure insured parcel delivery.',
    },
  ];

  return (
    <section className="bg-[#FAF4EA] py-6 sm:py-8 border-b border-[#F4D9A0]/50 reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 stagger-container">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-[#F4D9A0]/60 shadow-2xs hover:shadow-xs transition-all flex items-start gap-3.5 group hover:border-[#C8792C]/50 stagger-card"
              >
                <div className={`p-2.5 rounded-xl border shrink-0 ${item.iconBg} ${item.iconColor} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left min-w-0">
                  <h3 className="font-heading text-sm sm:text-base font-semibold text-[#302218] leading-tight group-hover:text-[#7A1830] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#5B4632]/80 mt-1 leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

