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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#FAF4EA] transition-opacity duration-350 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      {/* Subtle radial ambient background glow */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-[#F4D9A0]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative text-center px-4 space-y-4 animate-scale-in">
        {/* Luxury Brand Monogram with Gentle Rotating Ring */}
        <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
          {/* Delicate decorative rotating border */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#F4D9A0] animate-spin-slow" />
          
          {/* Brand Logo Badge */}
          <img
            src="/logo.png"
            alt="Vaidehi Imitation Logo"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shrink-0 border-2 border-[#F4D9A0] shadow-lg animate-pulse-glow"
          />

          {/* Sparkle Accent */}
          <div className="absolute -top-1 -right-1 text-[#C8792C]">
            <Sparkles className="w-5 h-5 fill-[#F4D9A0]" />
          </div>
        </div>

        {/* Brand Name Typography */}
        <div className="space-y-1">
          <h1 className="font-brand text-lg sm:text-xl font-bold tracking-widest text-[#302218] uppercase">
            Vaidehi Imitation
          </h1>
          <p className="text-[10px] sm:text-xs text-[#7A1830] font-semibold tracking-widest uppercase">
            Traditional & Bridal Jewellery • Dhasa Junction
          </p>
        </div>

        {/* Minimalist Golden Progress Line */}
        <div className="w-24 sm:w-32 h-0.5 mx-auto bg-[#F4D9A0]/50 rounded-full overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-[#F4D9A0] via-[#7A1830] to-[#C8792C] animate-shimmer" />
        </div>
      </div>
    </div>
  );
};
