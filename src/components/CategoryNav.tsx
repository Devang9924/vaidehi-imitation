import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Sparkles, User, Users } from 'lucide-react';
import type { GenderFilter, ProductCategory, SortOption, JewelleryCategory } from '../types';
import { loadAllCategories, DEFAULT_CATEGORIES } from '../lib/categoryStore';

interface CategoryNavProps {
  genderFilter: GenderFilter;
  setGenderFilter: (gender: GenderFilter) => void;
  selectedCategory: ProductCategory;
  setSelectedCategory: (category: ProductCategory) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  totalFilteredCount: number;
  totalAvailableCount: number;
  onResetFilters: () => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  genderFilter,
  setGenderFilter,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
  totalFilteredCount,
  totalAvailableCount,
  onResetFilters,
}) => {
  const [categories, setCategories] = useState<JewelleryCategory[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    let mounted = true;
    const fetchCats = async () => {
      try {
        const { categories: loaded } = await loadAllCategories();
        if (mounted) setCategories(loaded);
      } catch (err) {
        console.error('Failed to load categories for CategoryNav:', err);
      }
    };
    fetchCats();

    const handleUpdated = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setCategories(e.detail);
      } else {
        fetchCats();
      }
    };
    window.addEventListener('vaidehi-categories-updated', handleUpdated);
    return () => {
      mounted = false;
      window.removeEventListener('vaidehi-categories-updated', handleUpdated);
    };
  }, []);

  // Filter active categories by current gender filter
  const activeCategories = categories.filter((cat) => {
    if (!cat.is_active) return false;
    if (genderFilter === 'Female') return cat.gender === 'Female' || cat.gender === 'All';
    if (genderFilter === 'Male') return cat.gender === 'Male' || cat.gender === 'All';
    return true; // 'All'
  });

  const hasActiveFilters = genderFilter !== 'All' || selectedCategory !== 'All' || searchQuery.trim() !== '';

  return (
    <div id="catalogue-section" className="pt-8 pb-4 scroll-mt-6 space-y-6">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto px-4 animate-fade-in-up">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] border border-[#F5B8C7] text-[#8B4F58] text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
          <span>Curated Jewellery Catalogue</span>
        </span>
        <h2 className="font-heading text-2xl min-[360px]:text-3xl sm:text-4xl text-[#1F1A1C] font-semibold mt-2">
          Discover Handcrafted Elegance
        </h2>
        <p className="text-xs sm:text-base text-[#6E6267] mt-1 font-light max-w-xl mx-auto">
          Filter by gender and jewellery category to explore our exclusive collection available at Dhasa Junction.
        </p>
      </div>

      {/* Primary Gender Selectors */}
      <div className="max-w-xl mx-auto px-3 sm:px-4 animate-fade-in-up delay-75">
        <div className="bg-[#FFF0F3] p-1 sm:p-1.5 rounded-full border border-[#F3D7DE] flex items-center shadow-xs">
          <button
            onClick={() => setGenderFilter('All')}
            className={`flex-1 py-2 px-2 min-[360px]:px-3 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1 sm:gap-1.5 pressable cursor-pointer ${
              genderFilter === 'All'
                ? 'bg-white text-[#8B4F58] shadow-xs'
                : 'text-[#6E6267] hover:text-[#1F1A1C]'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>All <span className="hidden min-[420px]:inline">Collections</span></span>
          </button>

          <button
            onClick={() => setGenderFilter('Female')}
            className={`flex-1 py-2 px-2 min-[360px]:px-3 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1 sm:gap-1.5 pressable cursor-pointer ${
              genderFilter === 'Female'
                ? 'bg-white text-[#8B4F58] shadow-xs'
                : 'text-[#6E6267] hover:text-[#1F1A1C]'
            }`}
          >
            <User className="w-3.5 h-3.5 text-pink-500 shrink-0" />
            <span>Women <span className="hidden min-[420px]:inline">(Female)</span></span>
          </button>

          <button
            onClick={() => setGenderFilter('Male')}
            className={`flex-1 py-2 px-2 min-[360px]:px-3 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1 sm:gap-1.5 pressable cursor-pointer ${
              genderFilter === 'Male'
                ? 'bg-white text-[#8B4F58] shadow-xs'
                : 'text-[#6E6267] hover:text-[#1F1A1C]'
            }`}
          >
            <User className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Men <span className="hidden min-[420px]:inline">(Male)</span></span>
          </button>
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 animate-fade-in-up delay-100">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`shrink-0 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-all pressable cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-[#8B4F58] text-white border-[#8B4F58] shadow-xs'
                : 'bg-white text-[#5A4E53] border-[#F0C9D3] hover:border-[#8B4F58] hover:bg-[#FFF5F7]'
            }`}
          >
            All Categories
          </button>

          {activeCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`shrink-0 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-all pressable cursor-pointer ${
                selectedCategory === cat.name
                  ? 'bg-[#8B4F58] text-white border-[#8B4F58] shadow-xs'
                  : 'bg-white text-[#5A4E53] border-[#F0C9D3] hover:border-[#8B4F58] hover:bg-[#FFF5F7]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-[#F5D8E0] p-3.5 sm:p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B4F58]" />
            <input
              type="text"
              placeholder="Search by name, code (e.g. VI-NK-101)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#F0C9D3] text-xs sm:text-sm bg-[#FFFDFE] focus:outline-hidden focus:ring-2 focus:ring-[#B76E79]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Counts & Sort Dropdown */}
          <div className="w-full md:w-auto flex items-center justify-between md:justify-end space-x-3 text-xs sm:text-sm">
            
            <div className="text-[#6E6267] font-medium shrink-0">
              Showing <span className="font-bold text-[#8B4F58]">{totalFilteredCount}</span> of {totalAvailableCount} designs
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-[#8B4F58] hidden sm:inline" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-[#FFF8F9] border border-[#F0C9D3] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#1F1A1C] focus:outline-hidden focus:ring-1 focus:ring-[#B76E79]"
              >
                <option value="featured">Featured First</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount-desc">Highest Discount</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="text-xs text-[#8B4F58] hover:text-[#9E5863] underline shrink-0 font-medium ml-2"
              >
                Reset All
              </button>
            )}

          </div>

        </div>
      </div>

    </div>
  );
};
