import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { BUSINESS_DETAILS } from '../data/business';
import { InstagramIcon } from './icons/InstagramIcon';

export const InstagramBanner: React.FC = () => {
  return (
    <section className="py-10 sm:py-12 bg-gradient-to-r from-[#FFF0F3] via-[#FCE4E9] to-[#FFF5F8] border-b border-[#F5D8E0]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-4 min-[360px]:p-6 sm:p-10 border border-[#F0C9D3] shadow-md flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 animate-fade-in-up">
          
          <div className="flex items-center gap-3.5 sm:gap-5 text-left w-full md:w-auto">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-sm shrink-0 group hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                <InstagramIcon className="w-7 h-7 sm:w-10 sm:h-10 text-[#C13584]" />
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-heading text-xl min-[360px]:text-2xl sm:text-3xl font-bold text-[#1F1A1C] truncate">
                  {BUSINESS_DETAILS.instagramHandle}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] min-[360px]:text-xs font-bold bg-[#FFF0F3] text-[#8B4F58] border border-[#F5B8C7]">
                  {BUSINESS_DETAILS.instagramFollowersText}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#6E6267] max-w-xl font-light">
                Follow our official Instagram for daily bridal reel updates, behind-the-scenes showroom previews in Dhasa, and newly arrived imitation jewellery designs.
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <a
              href={BUSINESS_DETAILS.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#C13584] to-[#E1306C] hover:opacity-95 text-white font-semibold text-xs sm:text-sm shadow-md transition-all pressable"
            >
              <InstagramIcon className="w-4 h-4" />
              <span>Follow on Instagram</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};
