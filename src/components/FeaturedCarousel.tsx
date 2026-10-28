import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Pause, Play } from 'lucide-react';

interface CarouselItem {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  category: string;
}

const FEATURED_ITEMS: CarouselItem[] = [
  {
    id: 'feat-01',
    image: '/images/hero-jewellery.jpg',
    title: 'Royal Kundan Choker & Jhumkas Showcase',
    subtitle: 'Emerald bead clusters & premium micro-gold plating',
    category: 'Bridal Set',
  },
  {
    id: 'feat-02',
    image: '/images/sample-necklace-1.jpg',
    title: 'Regal Emerald Drops Choker Necklace',
    subtitle: 'High-grade Kundan setting with basra pearl clusters',
    category: 'Choker Necklace',
  },
  {
    id: 'feat-03',
    image: '/images/sample-necklace-2.jpg',
    title: 'Kundan Jhumkas & Bangle Ensemble',
    subtitle: 'Matching bridal earrings, floral choker and designer kangan',
    category: 'Earrings & Choker',
  },
  {
    id: 'feat-04',
    image: '/images/featured-temple-necklace.jpg',
    title: 'Antique Lakshmi Temple Necklace',
    subtitle: 'Traditional 22k matte gold finish with ruby cabochons',
    category: 'Temple Jewellery',
  },
  {
    id: 'feat-05',
    image: '/images/featured-polki-choker.jpg',
    title: 'Royal Rajasthani Polki Choker Set',
    subtitle: 'Uncut polki stones, meenakari and pigeon-blood ruby drops',
    category: 'Polki Collection',
  },
  {
    id: 'feat-06',
    image: '/images/featured-mango-mala.jpg',
    title: 'Antique Mango Mala Guttapusalu',
    subtitle: 'Traditional paisley motifs with rich seed pearl tassels',
    category: 'Heritage Necklace',
  },
  {
    id: 'feat-07',
    image: '/images/featured-matha-patti.jpg',
    title: 'Bridal Matha Patti & Maang Tikka',
    subtitle: 'Multilayer pearl chains with an ornate floral emerald crest',
    category: 'Head Jewellery',
  },
  {
    id: 'feat-08',
    image: '/images/featured-bridal-bangles.jpg',
    title: 'Traditional Bridal Bangles & Kangans',
    subtitle: 'Filigree work, micro-pearl border and gemstone accents',
    category: 'Bangles & Kangans',
  },
  {
    id: 'feat-09',
    image: '/images/featured-haathphool.jpg',
    title: 'Bridal Haathphool Hand Harness',
    subtitle: 'Floral wrist cuff connected to Kundan statement rings',
    category: 'Hand Jewellery',
  },
  {
    id: 'feat-10',
    image: '/images/sample-kada-1.jpg',
    title: "Rajputi Lion Head Men's Kada",
    subtitle: 'Hand-carved antique gold finish with heavy locking hinge',
    category: "Men's Kada",
  },
  {
    id: 'feat-11',
    image: '/images/sample-kada-2.jpg',
    title: 'Traditional Royal Lion Kada Bracelet',
    subtitle: 'Filigree detailing on rich crimson brocade silk',
    category: 'Royal Bracelet',
  },
  {
    id: 'feat-12',
    image: '/images/bridal-hero.jpg',
    title: 'Signature Bridal Heritage Look',
    subtitle: 'Layered haram, statement jhumkas and regal styling',
    category: 'Bridal Heritage',
  },
];

interface FeaturedCarouselProps {
  onShopClick: () => void;
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ onShopClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [isAnimating, setIsAnimating] = useState(false);

  // Default mode is playing (started by default). If someone stops it, it stops.
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState<number>(0);
  const autoplayTimerRef = useRef<number | null>(null);
  const animTimerRef = useRef<number | null>(null);

  const totalItems = FEATURED_ITEMS.length;

  const goToSlide = useCallback((targetIndex: number, direction: 'next' | 'prev') => {
    if (targetIndex === currentIndex) return;
    if (animTimerRef.current) {
      clearTimeout(animTimerRef.current);
    }
    setPrevIndex(currentIndex);
    setCurrentIndex(targetIndex);
    setSlideDirection(direction);
    setIsAnimating(true);

    animTimerRef.current = window.setTimeout(() => {
      setIsAnimating(false);
      setPrevIndex(null);
    }, 750);
  }, [currentIndex]);

  const nextSlide = useCallback(() => {
    const nextIdx = (currentIndex + 1) % totalItems;
    goToSlide(nextIdx, 'next');
  }, [currentIndex, totalItems, goToSlide]);

  const prevSlide = useCallback(() => {
    const prevIdx = (currentIndex - 1 + totalItems) % totalItems;
    goToSlide(prevIdx, 'prev');
  }, [currentIndex, totalItems, goToSlide]);

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  // Keyboard navigation accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      togglePlayPause();
    }
  };

  // Autoplay management:
  // - Starts automatically by default (isPlaying = true)
  // - Pauses when hovered, focused, or when user prefers reduced motion
  // - Resumes smoothly when unhovered / unblurred
  // - Pauses indefinitely if user explicitly clicks Stop/Pause
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const shouldRun = isPlaying && !isHovered && !isFocused && !mediaQuery.matches;

    if (!shouldRun) {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
      return;
    }

    autoplayTimerRef.current = window.setInterval(() => {
      nextSlide();
    }, 5000);

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    };
  }, [isPlaying, isHovered, isFocused, nextSlide]);

  // Clean up animation timeout on unmount
  useEffect(() => {
    return () => {
      if (animTimerRef.current) {
        clearTimeout(animTimerRef.current);
      }
    };
  }, []);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    setTouchDeltaX(currentX - touchStartX);
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null) {
      if (touchDeltaX > 40) {
        prevSlide();
      } else if (touchDeltaX < -40) {
        nextSlide();
      }
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
  };

  const currentItem = FEATURED_ITEMS[currentIndex];
  const prevItem = prevIndex !== null ? FEATURED_ITEMS[prevIndex] : null;

  return (
    <section
      id="featured-collection"
      className="bg-[#FAF4EA] py-12 sm:py-16 lg:py-20 border-b border-[#F4D9A0]/60 scroll-mt-6 reveal-on-scroll"
      aria-label="Featured Jewellery Collection"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Coordinated Typography Stagger */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 stagger-heading">
          <span className="heading-tag inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#F4D9A0] text-[#7A1830] text-xs font-semibold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C8792C]" />
            <span>Curated Showcase ({totalItems} Distinct Designs)</span>
          </span>
          <h2 className="heading-title font-heading text-2xl min-[360px]:text-3xl sm:text-4xl lg:text-5xl text-[#302218] font-semibold mt-2.5">
            Featured Bridal Collection
          </h2>
          <div className="heading-divider w-20 h-0.5 bg-gradient-to-r from-[#7A1830] via-[#C8792C] to-[#F4D9A0] mx-auto mt-2" />
          <p className="heading-subtitle text-xs sm:text-base text-[#5B4632] mt-2 font-light leading-relaxed">
            Rotate through our genuine handcrafted bridal pieces, temple ornaments and royal kadas available in our showroom.
          </p>
        </div>

        {/* Carousel Visual Showcase */}
        <div
          className="relative max-w-4xl mx-auto focus:outline-hidden"
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured Jewellery Showcase"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          
          {/* Main Slide Card with Gold Border & Sweep Effect */}
          <div
            className="relative bg-white rounded-3xl border-2 border-[#F4D9A0] overflow-hidden shadow-xl gold-sweep-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Image Frame with Aspect Ratio */}
            <div className="relative aspect-4/3 sm:aspect-16/10 lg:aspect-16/9 w-full bg-[#FAF4EA] overflow-hidden flex items-center justify-center">

              {/* Outgoing Slide during transition (Depth effect: scales down slightly to 0.97 and crossfades out) */}
              {prevItem && isAnimating && (
                <div
                  key={`slide-${prevItem.id}`}
                  className={`absolute inset-0 z-10 pointer-events-none ${
                    slideDirection === 'next' ? 'animate-cinematic-out-next' : 'animate-cinematic-out-prev'
                  }`}
                  aria-hidden="true"
                >
                  <img
                    src={prevItem.image}
                    alt=""
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent" />
                </div>
              )}

              {/* Incoming / Active Slide (Crossfade + Gentle Slide + Subtle Zoom Settle) */}
              <div
                key={`slide-${currentItem.id}`}
                className={`absolute inset-0 z-20 ${
                  isAnimating
                    ? slideDirection === 'next'
                      ? 'animate-cinematic-in-next'
                      : 'animate-cinematic-in-prev'
                    : ''
                }`}
              >
                <img
                  src={currentItem.image}
                  alt={`${currentItem.title} - Vaidehi Imitation`}
                  className={`w-full h-full object-cover object-center ${
                    isAnimating ? 'animate-cinematic-zoom' : ''
                  }`}
                  loading="lazy"
                />

                {/* Top Badge: Category */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#7A1830] text-white shadow-md border border-[#F4D9A0]/50">
                    {currentItem.category}
                  </span>
                </div>

                {/* Slide Counter Top Right */}
                <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-mono font-medium text-white shadow-md">
                  <span>{currentIndex + 1}</span> / <span>{totalItems}</span>
                </div>

                {/* Bottom Caption Overlay with Animated Staggered Text Transition */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-4 sm:p-6 text-white text-left z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 animate-cinematic-caption">
                  <div className="min-w-0 max-w-xl">
                    <h3 className="font-heading text-lg min-[360px]:text-xl sm:text-2xl font-semibold leading-tight truncate text-[#FAF4EA]">
                      {currentItem.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-200 mt-1 line-clamp-2 font-light">
                      {currentItem.subtitle}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onShopClick}
                    className="px-4 py-2 rounded-full bg-white text-[#7A1830] hover:bg-[#FAF4EA] text-xs font-semibold flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-md transition-colors cursor-pointer"
                  >
                    <span>Explore In Catalogue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Manual Controls: Prev & Next Floating Buttons with Champagne Gold styling */}
            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#302218] border border-[#F4D9A0] shadow-md flex items-center justify-center transition-all pressable cursor-pointer hover:border-[#C8792C]"
              aria-label="Previous jewellery slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#302218] border border-[#F4D9A0] shadow-md flex items-center justify-center transition-all pressable cursor-pointer hover:border-[#C8792C]"
              aria-label="Next jewellery slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Carousel Pagination Dots & Play/Pause State */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            
            {/* Play/Pause Button: Default mode is playing (started by default). If someone stops it, it stops. */}
            <button
              type="button"
              onClick={togglePlayPause}
              className={`w-8 h-8 rounded-full bg-white border border-[#F4D9A0] text-[#7A1830] hover:bg-[#FAF4EA] flex items-center justify-center transition-all shadow-2xs cursor-pointer mr-1 pressable relative ${
                isPlaying && !isHovered ? 'ring-2 ring-[#F4D9A0]/60' : ''
              }`}
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
              title={
                isPlaying
                  ? isHovered
                    ? 'Autoplay paused while hovering (click to stop permanently)'
                    : 'Pause slideshow (currently playing)'
                  : 'Play slideshow (currently stopped)'
              }
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-[#7A1830]" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-[#7A1830] ml-0.5" />
              )}
            </button>

            {/* Elegant Champagne-Gold Pagination Indicators */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto py-1 px-2 max-w-full no-scrollbar">
              {FEATURED_ITEMS.map((item, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goToSlide(idx, idx > currentIndex ? 'next' : 'prev')}
                    className={`h-2.5 rounded-full transition-all duration-300 ease-out cursor-pointer ${
                      isActive
                        ? 'w-8 sm:w-10 bg-[#7A1830] border border-[#F4D9A0] shadow-xs'
                        : 'w-2.5 bg-[#F4D9A0] hover:bg-[#C8792C]'
                    }`}
                    aria-label={`Jump to slide ${idx + 1}: ${item.title}`}
                    aria-current={isActive ? 'true' : undefined}
                  />
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
