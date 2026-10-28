import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Product, GenderFilter, ProductCategory, SortOption, CartItem } from './types';
import {
  loadAllCatalogueProducts,
  getShowSamplesPreference,
  setShowSamplesPreference,
} from './lib/productStore';
import { SAMPLE_PRODUCTS } from './data/sampleProducts';
import { getDiscountPercentage } from './lib/whatsapp';
import { BUSINESS_DETAILS } from './data/business';
import { getActiveStoreSettings, DEFAULT_STORE_SETTINGS, type StoreSettings } from './lib/storeSettings';
import {
  getCartItems,
  addToCart,
  validateCartAgainstProducts,
  subscribeToCart,
} from './lib/cartStore';
import { initGlobalScrollReveal } from './lib/useScrollReveal';

// UI Components
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustHighlights } from './components/TrustHighlights';
import { FeaturedCarousel } from './components/FeaturedCarousel';
import { ShopByCategory } from './components/ShopByCategory';
import { CategoryNav } from './components/CategoryNav';
import { ProductGrid } from './components/ProductGrid';
import { CuratedSelectionSection } from './components/CuratedSelectionSection';
import { PersonalAssistanceSection } from './components/PersonalAssistanceSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { MobileBottomBar } from './components/MobileBottomBar';
import { PageEntranceLoader } from './components/PageEntranceLoader';

// Modals, Cart & Admin Route
import { ProductDetailModal } from './components/ProductDetailModal';
import { BuyOrderModal } from './components/BuyOrderModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { OrderConfirmationPage } from './components/checkout/OrderConfirmationPage';
import { CheckoutErrorPage } from './components/checkout/CheckoutErrorPage';
import { AdminPage } from './components/admin/AdminPage';

// Policy Pages
import {
  PrivacyPolicyPage,
  TermsConditionsPage,
  ShippingPolicyPage,
  CancellationRefundPolicyPage,
  PaymentPolicyPage,
  ContactUsPage,
} from './components/policies';

export type ActiveRoute =
  | 'store'
  | 'admin'
  | 'checkout'
  | 'checkout-error'
  | 'order-confirmation'
  | 'privacy-policy'
  | 'terms-and-conditions'
  | 'shipping-policy'
  | 'cancellation-refund-policy'
  | 'payment-policy'
  | 'contact-us';

function getActiveRoute(): ActiveRoute {
  if (typeof window === 'undefined') return 'store';
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
  const hash = window.location.hash.toLowerCase();

  // 1. Admin route
  if (
    path === '/admin' ||
    path.startsWith('/admin/') ||
    hash === '#/admin' ||
    hash === '#admin' ||
    hash.startsWith('#/admin/')
  ) {
    return 'admin';
  }

  // 2. Checkout & Order Confirmation routes
  if (
    path === '/checkout-error' ||
    path.startsWith('/checkout-error') ||
    hash === '#/checkout-error' ||
    hash === '#checkout-error' ||
    hash.startsWith('#/checkout-error')
  ) {
    return 'checkout-error';
  }

  if (path === '/checkout' || hash === '#/checkout' || hash === '#checkout') {
    return 'checkout';
  }
  if (
    path === '/order-confirmation' ||
    path.startsWith('/order-confirmation') ||
    hash === '#/order-confirmation' ||
    hash.startsWith('#/order-confirmation')
  ) {
    return 'order-confirmation';
  }

  // 3. Policy routes (supports both path and hash)
  if (path === '/privacy-policy' || hash === '#/privacy-policy' || hash === '#privacy-policy') {
    return 'privacy-policy';
  }
  if (
    path === '/terms-and-conditions' ||
    path === '/terms' ||
    hash === '#/terms-and-conditions' ||
    hash === '#terms-and-conditions' ||
    hash === '#/terms'
  ) {
    return 'terms-and-conditions';
  }
  if (
    path === '/shipping-policy' ||
    path === '/shipping' ||
    hash === '#/shipping-policy' ||
    hash === '#shipping-policy' ||
    hash === '#/shipping'
  ) {
    return 'shipping-policy';
  }
  if (
    path === '/cancellation-refund-policy' ||
    path === '/refund-policy' ||
    path === '/cancellation-policy' ||
    hash === '#/cancellation-refund-policy' ||
    hash === '#cancellation-refund-policy' ||
    hash === '#/refund-policy'
  ) {
    return 'cancellation-refund-policy';
  }
  if (
    path === '/payment-policy' ||
    path === '/payment' ||
    hash === '#/payment-policy' ||
    hash === '#payment-policy' ||
    hash === '#/payment'
  ) {
    return 'payment-policy';
  }
  if (
    path === '/contact-us' ||
    path === '/contact' ||
    hash === '#/contact-us' ||
    hash === '#contact-us' ||
    hash === '#/contact'
  ) {
    return 'contact-us';
  }

  return 'store';
}

export const App: React.FC = () => {
  // Routing state
  const [activeRoute, setActiveRoute] = useState<ActiveRoute>(getActiveRoute);

  // Store settings (Order mode & payment controls)
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => getCartItems());
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

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
  const [selectedProductImageIndex, setSelectedProductImageIndex] = useState<number>(0);
  const [buyProduct, setBuyProduct] = useState<Product | null>(null);
  const [buyProductSelectedImage, setBuyProductSelectedImage] = useState<string | null>(null);
  const [buyProductSelectedImageIndex, setBuyProductSelectedImageIndex] = useState<number>(0);

  // Track initial page entrance loader completion for coordinated Hero animation
  const [isHeroReady, setIsHeroReady] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    return false;
  });

  // Initialize luxury scroll-triggered animations observer
  useEffect(() => {
    const cleanup = initGlobalScrollReveal();
    return cleanup;
  }, []);

  // Fetch store settings on mount
  useEffect(() => {
    let isMounted = true;
    void getActiveStoreSettings().then((settings: StoreSettings) => {
      if (isMounted) {
        setStoreSettings(settings);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Subscribe to shopping cart updates
  useEffect(() => {
    const unsubscribe = subscribeToCart((updatedItems: CartItem[]) => {
      setCartItems(updatedItems);
    });
    return unsubscribe;
  }, []);

  // Validate cart against products once catalogue loaded
  useEffect(() => {
    if (allProducts.length > 0) {
      validateCartAgainstProducts(allProducts);
    }
  }, [allProducts]);

  // Listen to browser location changes (history / hash)
  useEffect(() => {
    const handleLocationChange = () => {
      setActiveRoute(getActiveRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Update dynamic page document title and canonical SEO metadata
  useEffect(() => {
    if (typeof document === 'undefined') return;

    let pageTitle = BUSINESS_DETAILS.brandName;
    let pagePath = '/';
    let isNoIndex = false;

    if (activeRoute === 'store' && selectedProductDetails) {
      pageTitle = `${selectedProductDetails.name} | ${BUSINESS_DETAILS.brandName}`;
      pagePath = `/?product=${encodeURIComponent(selectedProductDetails.code)}`;
    } else {
      switch (activeRoute) {
        case 'checkout':
          pageTitle = `Checkout & Payment | ${BUSINESS_DETAILS.brandName}`;
          pagePath = '/checkout';
          isNoIndex = true;
          break;
        case 'checkout-error':
          pageTitle = `Checkout Interrupted | ${BUSINESS_DETAILS.brandName}`;
          pagePath = '/checkout-error';
          isNoIndex = true;
          break;
        case 'order-confirmation':
          pageTitle = `Order Confirmed | ${BUSINESS_DETAILS.brandName}`;
          pagePath = '/order-confirmation';
          isNoIndex = true;
          break;
        case 'privacy-policy':
          pageTitle = `Privacy Policy | ${BUSINESS_DETAILS.brandName}`;
          pagePath = '/privacy-policy';
          break;
        case 'terms-and-conditions':
          pageTitle = `Terms & Conditions | ${BUSINESS_DETAILS.brandName}`;
          pagePath = '/terms-and-conditions';
          break;
        case 'shipping-policy':
          pageTitle = `Shipping & Delivery Policy | ${BUSINESS_DETAILS.brandName}`;
          pagePath = '/shipping-policy';
          break;
        case 'cancellation-refund-policy':
          pageTitle = `Cancellation & Refund Policy | ${BUSINESS_DETAILS.brandName}`;
          pagePath = '/cancellation-refund-policy';
          break;
        case 'payment-policy':
          pageTitle = `Payment Policy | ${BUSINESS_DETAILS.brandName}`;
          pagePath = '/payment-policy';
          break;
        case 'contact-us':
          pageTitle = `Contact Us | ${BUSINESS_DETAILS.brandName}`;
          pagePath = '/contact-us';
          break;
        case 'admin':
          pageTitle = `Admin Dashboard | ${BUSINESS_DETAILS.brandName}`;
          pagePath = '/admin';
          isNoIndex = true;
          break;
        default:
          pageTitle = BUSINESS_DETAILS.brandName;
          pagePath = '/';
          break;
      }
    }

    // 1. Update browser title
    document.title = pageTitle;

    // 2. Update canonical URL tag so each route has its own valid canonical
    const canonicalUrl = `https://vaidehi-imitation.vercel.app${pagePath === '/' ? '/' : pagePath}`;
    let canonicalLink = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;

    // 3. Update Open Graph tags
    const ogUrl = document.querySelector("meta[property='og:url']");
    if (ogUrl) {
      ogUrl.setAttribute('content', canonicalUrl);
    }
    const ogTitle = document.querySelector("meta[property='og:title']");
    if (ogTitle) {
      ogTitle.setAttribute('content', pageTitle);
    }

    // 4. Update robots meta tag
    let robotsMeta = document.querySelector("meta[name='robots']");
    if (isNoIndex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    } else if (robotsMeta) {
      robotsMeta.setAttribute('content', 'index, follow');
    }
  }, [activeRoute, selectedProductDetails]);

  const navigateTo = (path: string) => {
    window.history.pushState(null, '', path);
    setActiveRoute(getActiveRoute());
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

  // Deep-linking: Automatically open individual product details modal if URL has ?product=CODE
  useEffect(() => {
    if (activeRoute !== 'store') return;

    const syncProductFromUrl = () => {
      if (typeof window === 'undefined') return;

      const params = new URLSearchParams(window.location.search);
      const queryParam = params.get('product') || params.get('code') || params.get('p') || params.get('id');
      const imgParam = params.get('img') || params.get('image');

      let target = queryParam;
      if (!target && window.location.hash.startsWith('#product-')) {
        target = decodeURIComponent(window.location.hash.replace('#product-', ''));
      }

      if (target) {
        const clean = target.trim().toLowerCase();
        const stripped = clean.replace(/[\s-_]+/g, '');

        const pool = allProducts.length > 0 ? allProducts : SAMPLE_PRODUCTS;
        const found = pool.find((p) => {
          const codeMatch = p.code.toLowerCase().trim() === clean;
          const idMatch = p.id.toLowerCase() === clean;
          const strippedCodeMatch = p.code.toLowerCase().replace(/[\s-_]+/g, '') === stripped;
          return codeMatch || idMatch || strippedCodeMatch;
        });

        if (found) {
          setSelectedProductDetails(found);
          if (imgParam) {
            const parsedIdx = parseInt(imgParam, 10);
            if (!isNaN(parsedIdx) && parsedIdx >= 0) {
              const maxIdx = Math.max(0, (found.images?.length || 1) - 1);
              setSelectedProductImageIndex(Math.min(parsedIdx, maxIdx));
            } else {
              setSelectedProductImageIndex(0);
            }
          } else {
            setSelectedProductImageIndex(0);
          }
        }
      }
    };

    syncProductFromUrl();
    window.addEventListener('popstate', syncProductFromUrl);
    window.addEventListener('hashchange', syncProductFromUrl);
    return () => {
      window.removeEventListener('popstate', syncProductFromUrl);
      window.removeEventListener('hashchange', syncProductFromUrl);
    };
  }, [allProducts, activeRoute]);

  const handleOpenProductDetails = (product: Product, initialImageIndex?: number) => {
    setSelectedProductDetails(product);
    const imgIdx = initialImageIndex ?? 0;
    setSelectedProductImageIndex(imgIdx);
    if (typeof window !== 'undefined') {
      const imgParam = imgIdx > 0 ? `&img=${imgIdx}` : '';
      const newUrl = `${window.location.pathname}?product=${encodeURIComponent(product.code)}${imgParam}`;
      window.history.replaceState(null, '', newUrl);
    }
  };

  const handleCloseProductDetails = () => {
    setSelectedProductDetails(null);
    setSelectedProductImageIndex(0);
    if (typeof window !== 'undefined' && window.location.search.includes('product=')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  // Add product to cart handler
  const handleAddToCart = (product: Product, selectedImageUrl?: string, selectedImageIndex?: number) => {
    addToCart(product, selectedImageIndex ?? 0, 1, selectedImageUrl);
    setIsCartOpen(true);
  };

  // Unified Buy Now handler: Respects active orderMode
  const handleBuyNow = (product: Product, selectedImageUrl?: string, selectedImageIndex?: number) => {
    if (storeSettings.order_mode === 'online_checkout') {
      // In Online Checkout Mode, add to cart and navigate directly to checkout page
      addToCart(product, selectedImageIndex ?? 0, 1, selectedImageUrl);
      navigateTo('/checkout');
    } else {
      // In WhatsApp Mode, open the existing WhatsApp BuyOrderModal
      setBuyProduct(product);
      setBuyProductSelectedImage(selectedImageUrl || (product.images && product.images[0]) || null);
      setBuyProductSelectedImageIndex(selectedImageIndex ?? 0);
    }
  };

  const handleCloseBuy = () => {
    setBuyProduct(null);
    setBuyProductSelectedImage(null);
    setBuyProductSelectedImageIndex(0);
  };

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
      // 1. Gender filter
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
      return 0;
    });
  }, [allProducts, genderFilter, selectedCategory, searchQuery, sortOption]);

  const scrollToCatalogue = () => {
    const el = document.getElementById('catalogue-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectCategoryFromShowcase = (category: ProductCategory) => {
    setSelectedCategory(category);
    scrollToCatalogue();
  };

  const totalCartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  // Dedicated /admin route
  if (activeRoute === 'admin') {
    return (
      <AdminPage
        products={allProducts}
        onRefreshProducts={refreshProducts}
        onNavigateHome={() => navigateTo('/')}
        showSampleProducts={showSampleProducts}
        onToggleSampleProducts={handleToggleSampleProducts}
        storeSettings={storeSettings}
        onSettingsUpdated={(newSettings) => setStoreSettings(newSettings)}
      />
    );
  }

  // Dedicated Checkout Route
  if (activeRoute === 'checkout') {
    return (
      <CheckoutPage
        items={cartItems}
        settings={storeSettings}
        onNavigate={navigateTo}
        onOrderSuccess={(orderNumber) => {
          navigateTo(`/order-confirmation?order=${encodeURIComponent(orderNumber)}`);
        }}
        onBackToShopping={() => navigateTo('/')}
      />
    );
  }

  // Dedicated Checkout Error Route
  if (activeRoute === 'checkout-error') {
    return (
      <CheckoutErrorPage
        onNavigate={navigateTo}
        onBackToCheckout={() => navigateTo('/checkout')}
        onBackToShopping={() => navigateTo('/')}
        hasCod={Boolean(storeSettings.cod_enabled)}
      />
    );
  }

  // Dedicated Order Confirmation Route
  if (activeRoute === 'order-confirmation') {
    return (
      <OrderConfirmationPage
        onNavigate={navigateTo}
      />
    );
  }

  // Dedicated Policy Routes
  if (activeRoute === 'privacy-policy') {
    return <PrivacyPolicyPage onNavigate={navigateTo} />;
  }
  if (activeRoute === 'terms-and-conditions') {
    return <TermsConditionsPage onNavigate={navigateTo} />;
  }
  if (activeRoute === 'shipping-policy') {
    return <ShippingPolicyPage onNavigate={navigateTo} />;
  }
  if (activeRoute === 'cancellation-refund-policy') {
    return <CancellationRefundPolicyPage onNavigate={navigateTo} />;
  }
  if (activeRoute === 'payment-policy') {
    return <PaymentPolicyPage onNavigate={navigateTo} />;
  }
  if (activeRoute === 'contact-us') {
    return <ContactUsPage onNavigate={navigateTo} />;
  }

  // Customer-facing storefront
  return (
    <div className="min-h-screen bg-[#FAF4EA] text-[#302218] flex flex-col font-sans-clean antialiased overflow-x-hidden w-full relative">

      {/* Page Refresh & Initial Entrance Luxury Animation */}
      <PageEntranceLoader onComplete={() => setIsHeroReady(true)} />

      {/* 1. Existing header and announcement bar */}
      <Header
        genderFilter={genderFilter}
        setGenderFilter={setGenderFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        orderMode={storeSettings.order_mode}
        cartItemCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigateHome={() => navigateTo('/')}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 sm:pb-0">

        {/* 2. New premium bridal-model hero section */}
        <Hero onShopClick={scrollToCatalogue} isReady={isHeroReady} />

        {/* 3. Trust and benefit highlights */}
        <TrustHighlights />

        {/* 4. Featured Collection carousel with 12 distinct jewellery images rotating automatically */}
        <FeaturedCarousel onShopClick={scrollToCatalogue} />

        {/* 5. Shop by Category */}
        <ShopByCategory onSelectCategory={handleSelectCategoryFromShowcase} />

        {/* 6. Discover Handcrafted Elegance / catalogue introduction & filters */}
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

        {/* 7. Product filters and the complete existing product catalogue */}
        <ProductGrid
          products={filteredProducts}
          isLoading={isLoading}
          error={error}
          showSampleProducts={showSampleProducts}
          onToggleSampleProducts={handleToggleSampleProducts}
          onViewDetails={handleOpenProductDetails}
          onBuyNow={handleBuyNow}
          onResetFilters={handleResetFilters}
          orderMode={storeSettings.order_mode}
          onAddToCart={handleAddToCart}
        />

        {/* 8. Curated Selection */}
        <CuratedSelectionSection onShopClick={scrollToCatalogue} />

        {/* 9. Personal Assistance */}
        <PersonalAssistanceSection />

        {/* 10. Local Showroom / location information (Immediately above footer!) */}
        <ContactSection />

      </main>

      {/* 11. Footer with Policies & Category Navigation */}
      <Footer
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onNavigate={navigateTo}
        showSampleProducts={showSampleProducts}
        onToggleSampleProducts={handleToggleSampleProducts}
      />

      {/* 10. Mobile Sticky Action Bar */}
      <MobileBottomBar
        orderMode={storeSettings.order_mode}
        cartItemCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Customer Modals */}

      {/* Slide-over Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          navigateTo('/checkout');
        }}
        onContinueShopping={() => setIsCartOpen(false)}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductDetails}
        initialImageIndex={selectedProductImageIndex}
        onClose={handleCloseProductDetails}
        onBuyNow={handleBuyNow}
        orderMode={storeSettings.order_mode}
        onAddToCart={handleAddToCart}
      />

      {/* Buy Order Modal (WhatsApp formulation when in WhatsApp mode) */}
      <BuyOrderModal
        product={buyProduct}
        selectedImageUrl={buyProductSelectedImage}
        selectedImageIndex={buyProductSelectedImageIndex}
        onClose={handleCloseBuy}
      />

    </div>
  );
};

export default App;
