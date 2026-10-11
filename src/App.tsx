import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Product, GenderFilter, ProductCategory, SortOption } from './types';
import {
  loadAllCatalogueProducts,
  getShowSamplesPreference,
  setShowSamplesPreference,
} from './lib/productStore';
import { getDiscountPercentage } from './lib/whatsapp';

// UI Components
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryNav } from './components/CategoryNav';
import { ProductGrid } from './components/ProductGrid';
import { InstagramBanner } from './components/InstagramBanner';
import { AboutSection } from './components/AboutSection';
import { ReviewsSection } from './components/ReviewsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { MobileBottomBar } from './components/MobileBottomBar';
import { PageEntranceLoader } from './components/PageEntranceLoader';

// Modals & Admin Route
import { ProductDetailModal } from './components/ProductDetailModal';
import { BuyOrderModal } from './components/BuyOrderModal';
import { AdminPage } from './components/admin/AdminPage';

function getIsAdminRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return path === '/admin' || path.startsWith('/admin/') || hash === '#/admin' || hash === '#admin';
}

export const App: React.FC = () => {
  // Routing state ('store' | 'admin')
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(getIsAdminRoute);

  // Store products state
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showSampleProducts, setShowSampleProducts] = useState<boolean>(getShowSamplesPreference());

  // Filter & Search state
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('All');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('featured');

  // Customer modal states
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [buyProduct, setBuyProduct] = useState<Product | null>(null);

  // Listen to browser location changes (history / hash)
  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(getIsAdminRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState(null, '', path);
    setIsAdminRoute(getIsAdminRoute());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load products from repository
  const refreshProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { products, error: fetchErr } = await loadAllCatalogueProducts(showSampleProducts);
      setAllProducts(products);
      if (fetchErr && products.length === 0) {
        setError(fetchErr);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load catalogue');
    } finally {
      setIsLoading(false);
    }
  }, [showSampleProducts]);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  // Toggle sample demo products visibility
  const handleToggleSampleProducts = () => {
    const nextVal = !showSampleProducts;
    setShowSampleProducts(nextVal);
    setShowSamplesPreference(nextVal);
  };

  // Reset all catalogue filters
  const handleResetFilters = () => {
    setGenderFilter('All');
    setSelectedCategory('All');
    setSearchQuery('');
    setSortOption('featured');
  };

  // Filtered & sorted products computation
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // 1. Gender filter: Female includes Female & Unisex; Male includes Male & Unisex
      if (genderFilter === 'Male') {
        if (product.gender !== 'Male' && product.gender !== 'Unisex') return false;
      } else if (genderFilter === 'Female') {
        if (product.gender !== 'Female' && product.gender !== 'Unisex') return false;
      } else if (genderFilter === 'Unisex') {
        if (product.gender !== 'Unisex') return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'All') {
        if (product.category !== selectedCategory) return false;
      }

      // 3. Search query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesCode = product.code.toLowerCase().includes(query);
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesCat = product.category.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        if (!matchesCode && !matchesName && !matchesCat && !matchesDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOption === 'price-asc') {
        return a.selling_price - b.selling_price;
      }
      if (sortOption === 'price-desc') {
        return b.selling_price - a.selling_price;
      }
      if (sortOption === 'discount-desc') {
        const discA = getDiscountPercentage(a.original_price, a.selling_price);
        const discB = getDiscountPercentage(b.original_price, b.selling_price);
        return discB - discA;
      }
      if (sortOption === 'newest') {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      }
      // 'featured': preserve natural order
      return 0;
    });
  }, [allProducts, genderFilter, selectedCategory, searchQuery, sortOption]);

  const scrollToCatalogue = () => {
    const el = document.getElementById('catalogue-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // If on dedicated /admin route, show the full Admin Page
  if (isAdminRoute) {
    return (
      <AdminPage
        products={allProducts}
        onRefreshProducts={refreshProducts}
        onNavigateHome={() => navigateTo('/')}
        showSampleProducts={showSampleProducts}
        onToggleSampleProducts={handleToggleSampleProducts}
      />
    );
  }

  // Otherwise, render the customer-facing storefront
  return (
    <div className="min-h-screen bg-[#FFF8F9] text-[#1F1A1C] flex flex-col font-sans-clean antialiased overflow-x-hidden w-full relative">
      
      {/* Page Refresh & Initial Entrance Luxury Animation */}
      <PageEntranceLoader />

      {/* 1. Header with navigation, brand, search, call, and WhatsApp (No Admin button) */}
      <Header
        genderFilter={genderFilter}
        setGenderFilter={setGenderFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 sm:pb-0">
        
        {/* 2. Hero Section */}
        <Hero onShopClick={scrollToCatalogue} />

        {/* 3. Category & Gender Navigation */}
        <CategoryNav
          genderFilter={genderFilter}
          setGenderFilter={setGenderFilter}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortOption={sortOption}
          setSortOption={setSortOption}
          totalFilteredCount={filteredProducts.length}
          totalAvailableCount={allProducts.length}
          onResetFilters={handleResetFilters}
        />

        {/* 4. Product Catalogue Grid */}
        <ProductGrid
          products={filteredProducts}
          isLoading={isLoading}
          error={error}
          showSampleProducts={showSampleProducts}
          onToggleSampleProducts={handleToggleSampleProducts}
          onViewDetails={(product) => setSelectedProductDetails(product)}
          onBuyNow={(product) => setBuyProduct(product)}
          onResetFilters={handleResetFilters}
        />

        {/* 5. Instagram Highlight Banner */}
        <InstagramBanner />

        {/* 6. About Business Section */}
        <AboutSection />

        {/* 7. Customer Reviews Section (Form + Approved Reviews) */}
        <ReviewsSection />

        {/* 8. Showroom Location & Contact Details */}
        <ContactSection />

      </main>

      {/* 9. Footer (No Admin button) */}
      <Footer
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        showSampleProducts={showSampleProducts}
        onToggleSampleProducts={handleToggleSampleProducts}
      />

      {/* 10. Mobile Sticky Action Bar */}
      <MobileBottomBar />

      {/* Customer Modals */}
      
      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductDetails}
        onClose={() => setSelectedProductDetails(null)}
        onBuyNow={(product) => {
          setSelectedProductDetails(null);
          setBuyProduct(product);
        }}
      />

      {/* Buy Order Modal (WhatsApp formulation) */}
      <BuyOrderModal
        product={buyProduct}
        onClose={() => setBuyProduct(null)}
      />

    </div>
  );
};

export default App;
