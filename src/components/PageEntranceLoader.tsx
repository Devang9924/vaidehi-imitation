import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface PageEntranceLoaderProps {
  onComplete?: () => void;
}

let hasShownEntranceInSession = false;

export const PageEntranceLoader: React.FC<PageEntranceLoaderProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(() => {
    if (hasShownEntranceInSession) return false;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    return true;
  });
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      onComplete?.();
      return;
    }
    hasShownEntranceInSession = true;

    // Keep the entrance swift and graceful (never keep visitor waiting)
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 600);

    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 950);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#FFF5F8] via-[#FFF8F9] to-white transition-opacity duration-350 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      {/* Subtle radial ambient background glow */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-[#FAD2E1]/50 rounded-full blur-3xl pointer-events-none" />

      <div className="relative text-center px-4 space-y-4 animate-scale-in">
        {/* Luxury Brand Monogram with Gentle Rotating Ring */}
        <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
          {/* Delicate decorative rotating border */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#D4A373]/60 animate-spin-slow" />
          
          {/* Monogram Badge */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#FFF0F3] via-white to-[#FCE4E9] border-2 border-[#D4A373] flex items-center justify-center shadow-lg animate-pulse-glow">
            <span className="font-brand font-bold text-2xl sm:text-3xl text-[#8B4F58] tracking-tight">
              VI
            </span>
          </div>

          {/* Sparkle Accent */}
          <div className="absolute -top-1 -right-1 text-[#D4A373] animate-bounce">
            <Sparkles className="w-5 h-5 fill-[#ECC8AF]" />
          </div>
        </div>

        {/* Brand Name Typography */}
        <div className="space-y-1">
          <h1 className="font-brand text-lg sm:text-xl font-bold tracking-widest text-[#1F1A1C] uppercase">
            Vaidehi Imitation
          </h1>
          <p className="text-[10px] sm:text-xs text-[#8B4F58] font-semibold tracking-widest uppercase">
            Traditional & Bridal Jewellery • Dhasa Junction
          </p>
        </div>

        {/* Minimalist Golden Progress Line */}
        <div className="w-24 sm:w-32 h-0.5 mx-auto bg-[#F0C9D3] rounded-full overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-[#D4A373] via-[#B76E79] to-[#D4A373] animate-shimmer" />
        </div>
      </div>
    </div>
  );
};
