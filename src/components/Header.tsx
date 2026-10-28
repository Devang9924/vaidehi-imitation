import React, { useState } from 'react';
import { Phone, MessageCircle, Search, Menu, X, ShoppingBag } from 'lucide-react';
import { BUSINESS_DETAILS } from '../data/business';
import type { GenderFilter, OrderMode } from '../types';
import { createGeneralInquiryUrl } from '../lib/whatsapp';

interface HeaderProps {
  genderFilter: GenderFilter;
  setGenderFilter: (gender: GenderFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  orderMode?: OrderMode;
  cartItemCount?: number;
  onOpenCart?: () => void;
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  genderFilter,
  setGenderFilter,
  searchQuery,
  setSearchQuery,
  orderMode = 'whatsapp',
  cartItemCount = 0,
  onOpenCart,
  onNavigateHome,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white border-b border-[#F4D9A0]/60 shadow-xs sticky top-0 z-30">
      {/* 1. Top Announcement Bar */}
      <div className="bg-[#7A1830] text-white text-[11px] sm:text-xs py-1.5 px-3 border-b border-[#F4D9A0]/30 text-center font-medium tracking-wide flex items-center justify-center gap-1.5">
        <span className="text-[#F4D9A0]">✨</span>
        <span className="truncate">
          Traditional & Bridal Imitation Jewellery • Dhasa Showroom Open 7 Days • Direct WhatsApp Consultation
        </span>
      </div>
      {/* Main Brand & Navigation Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Brand Logo & Title Area */}
          <div className="flex items-center min-w-0">
            <a
              href="#"
              onClick={handleBrandClick}
              className="group flex items-center gap-2.5 sm:gap-3 text-left focus:outline-hidden"
              aria-label="Vaidehi Imitation Home"
            >
              {/* Brand Logo */}
              <img
                src="/logo.png"
                alt="Vaidehi Imitation Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0 shadow-2xs border border-[#F4D9A0] group-hover:scale-105 transition-transform"
              />

              {/* Brand Typography */}
              <div className="min-w-0">
                <span className="block font-brand text-xs min-[360px]:text-sm sm:text-lg lg:text-xl font-bold tracking-wider text-[#302218] uppercase group-hover:text-[#7A1830] transition-colors leading-tight truncate">
                  VAIDEHI IMITATION
                </span>
                <span className="block text-[8px] min-[360px]:text-[9px] sm:text-[10px] tracking-widest uppercase text-[#7A1830] font-semibold font-sans-clean leading-tight truncate">
                  IMITATION JEWELLERY • DHASA JUNCTION
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => {
                setGenderFilter('All');
                scrollToSection('catalogue-section');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all pressable cursor-pointer ${
                genderFilter === 'All'
                  ? 'bg-[#FAF4EA] text-[#7A1830] font-semibold border border-[#F4D9A0]'
                  : 'text-[#5B4632] hover:text-[#7A1830] hover:bg-[#FAF4EA]'
              }`}
            >
              All Jewellery
            </button>
            <button
              onClick={() => {
                setGenderFilter('Female');
                scrollToSection('catalogue-section');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all pressable cursor-pointer ${
                genderFilter === 'Female'
                  ? 'bg-[#FAF4EA] text-[#7A1830] font-semibold border border-[#F4D9A0]'
                  : 'text-[#5B4632] hover:text-[#7A1830] hover:bg-[#FAF4EA]'
              }`}
            >
              Women's Collection
            </button>
            <button
              onClick={() => {
                setGenderFilter('Male');
                scrollToSection('catalogue-section');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all pressable cursor-pointer ${
                genderFilter === 'Male'
                  ? 'bg-[#FAF4EA] text-[#7A1830] font-semibold border border-[#F4D9A0]'
                  : 'text-[#5B4632] hover:text-[#7A1830] hover:bg-[#FAF4EA]'
              }`}
            >
              Men's Collection
            </button>
            <button
              onClick={() => scrollToSection('featured-collection')}
              className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium text-[#5B4632] hover:text-[#7A1830] hover:bg-[#FAF4EA] transition-all pressable cursor-pointer"
            >
              Featured
            </button>
            <button
              onClick={() => scrollToSection('curated-selection')}
              className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium text-[#5B4632] hover:text-[#7A1830] hover:bg-[#FAF4EA] transition-all pressable cursor-pointer"
            >
              Curated
            </button>
            <button
              onClick={() => scrollToSection('contact-section')}
              className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium text-[#5B4632] hover:text-[#7A1830] hover:bg-[#FAF4EA] transition-all pressable cursor-pointer"
            >
              Showroom Location
            </button>
          </nav>

          {/* Right Action Icons & Mobile Toggle */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Search Toggle Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full text-[#5B4632] hover:text-[#7A1830] hover:bg-[#FAF4EA] transition-all pressable cursor-pointer"
              title="Search catalogue"
              aria-label="Search catalogue"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Shopping Cart Button (Shown in Online Checkout Mode) */}
            {orderMode === 'online_checkout' && (
              <button
                type="button"
                onClick={onOpenCart}
                className="relative inline-flex items-center gap-1.5 bg-[#FAF4EA] hover:bg-white text-[#7A1830] border border-[#F4D9A0] px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all pressable cursor-pointer shadow-2xs"
                title="View Shopping Bag"
                aria-label={`Shopping bag with ${cartItemCount} items`}
              >
                <ShoppingBag className="w-4 h-4 shrink-0 text-[#7A1830]" />
                <span className="hidden min-[420px]:inline">Bag</span>
                {cartItemCount > 0 ? (
                  <span className="w-5 h-5 rounded-full bg-[#7A1830] text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                ) : (
                  <span className="text-[10px] text-[#7A1830]/70 hidden min-[480px]:inline">
                    (0)
                  </span>
                )}
              </button>
            )}

            {/* Direct WhatsApp Action (Shown in WhatsApp Ordering Mode) */}
            {orderMode === 'whatsapp' && (
              <a
                href={createGeneralInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-2xs hover:shadow-sm transition-all pressable"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>WhatsApp Order</span>
              </a>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-[#5B4632] hover:bg-[#FAF4EA] transition-colors pressable cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#7A1830]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Expandable Search Input Bar */}
        {searchOpen && (
          <div className="py-2.5 px-2 border-t border-[#F4D9A0] flex items-center gap-2 animate-fade-in-down">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A1830]" />
              <input
                type="text"
                placeholder="Search jewellery by name, code (e.g. VI-NK-101)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-9 py-2 rounded-full border border-[#F4D9A0] bg-[#FAF4EA]/40 text-[#302218] text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7A1830]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setSearchOpen(false)}
              className="text-xs text-[#7A1830] font-medium px-2.5 py-1.5 rounded-full hover:bg-[#FAF4EA] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu with Backdrop Blur & Smooth Entrance */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-24 bg-black/40 backdrop-blur-2xs z-30 lg:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-40 lg:hidden bg-white/98 backdrop-blur-md border-b border-[#F4D9A0] px-4 pt-3 pb-6 space-y-3 shadow-xl animate-fade-in-down">
            {/* If in Online Checkout Mode, provide Bag link right at the top */}
            {orderMode === 'online_checkout' && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenCart) onOpenCart();
                }}
                className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-[#FAF4EA] text-[#7A1830] border border-[#F4D9A0] text-xs sm:text-sm font-bold flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#7A1830]" />
                  <span>View Shopping Bag</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#7A1830] text-white text-xs font-bold">
                  {cartItemCount}
                </span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1 pb-2">
              <button
                onClick={() => {
                  setGenderFilter('Female');
                  scrollToSection('catalogue-section');
                }}
                className={`min-h-[44px] p-2.5 rounded-xl text-center border text-xs sm:text-sm font-medium transition-all pressable cursor-pointer ${
                  genderFilter === 'Female'
                    ? 'border-[#7A1830] bg-[#FAF4EA] text-[#7A1830] font-bold'
                    : 'border-[#F4D9A0] bg-white text-[#5B4632]'
                }`}
              >
                Women's Jewellery
              </button>
              <button
                onClick={() => {
                  setGenderFilter('Male');
                  scrollToSection('catalogue-section');
                }}
                className={`min-h-[44px] p-2.5 rounded-xl text-center border text-xs sm:text-sm font-medium transition-all pressable cursor-pointer ${
                  genderFilter === 'Male'
                    ? 'border-[#7A1830] bg-[#FAF4EA] text-[#7A1830] font-bold'
                    : 'border-[#F4D9A0] bg-white text-[#5B4632]'
                }`}
              >
                Men's Jewellery
              </button>
            </div>

            <div className="space-y-1 text-xs sm:text-sm border-t border-[#F4D9A0]/60 pt-2">
              <button
                onClick={() => {
                  setGenderFilter('All');
                  scrollToSection('catalogue-section');
                }}
                className="w-full text-left min-h-[42px] py-2 px-3 rounded-lg hover:bg-[#FAF4EA] text-[#5B4632] font-medium flex items-center transition-colors cursor-pointer"
              >
                All Jewellery Catalogue
              </button>
              <button
                onClick={() => scrollToSection('featured-collection')}
                className="w-full text-left min-h-[42px] py-2 px-3 rounded-lg hover:bg-[#FAF4EA] text-[#5B4632] font-medium flex items-center transition-colors cursor-pointer"
              >
                Featured Bridal Collection
              </button>
              <button
                onClick={() => scrollToSection('curated-selection')}
                className="w-full text-left min-h-[42px] py-2 px-3 rounded-lg hover:bg-[#FAF4EA] text-[#5B4632] font-medium flex items-center transition-colors cursor-pointer"
              >
                Curated Selection
              </button>
              <button
                onClick={() => scrollToSection('personal-assistance')}
                className="w-full text-left min-h-[42px] py-2 px-3 rounded-lg hover:bg-[#FAF4EA] text-[#5B4632] font-medium flex items-center transition-colors cursor-pointer"
              >
                Personal Assistance
              </button>
              <button
                onClick={() => scrollToSection('contact-section')}
                className="w-full text-left min-h-[42px] py-2 px-3 rounded-lg hover:bg-[#FAF4EA] text-[#5B4632] font-medium flex items-center transition-colors cursor-pointer"
              >
                Showroom Location & Contact
              </button>
            </div>

            <div className="pt-2 border-t border-[#F4D9A0]/60 flex flex-col gap-2">
              <a
                href={createGeneralInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-2xs transition-all pressable"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: {BUSINESS_DETAILS.formattedPhone}</span>
              </a>
              <a
                href={`tel:${BUSINESS_DETAILS.whatsappPhone}`}
                className="w-full min-h-[44px] py-2 rounded-full border border-[#F4D9A0] text-[#5B4632] hover:bg-[#FAF4EA] text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-all pressable"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Showroom</span>
              </a>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
