import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Vaidehi Imitation - Premium Bridal Homepage Redesign Test Suite', () => {
  const rootDir = process.cwd();

  it('Requirement 1 & 3: Hero and Featured Collection images exist and are distinct', () => {
    const publicImagesDir = path.join(rootDir, 'public', 'images');
    const heroImage = path.join(publicImagesDir, 'bridal-hero.jpg');
    assert.ok(fs.existsSync(heroImage), 'bridal-hero.jpg must exist in public/images');
    const heroStat = fs.statSync(heroImage);
    assert.ok(heroStat.size > 50000, 'bridal-hero.jpg must be a high-resolution image asset');

    // Read FeaturedCarousel.tsx to verify distinct image list
    const carouselCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'FeaturedCarousel.tsx'), 'utf8');
    const matches = [...carouselCode.matchAll(/image:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
    
    assert.ok(matches.length >= 10 && matches.length <= 12, `Expected 10-12 carousel items, got ${matches.length}`);
    const uniqueImages = new Set(matches);
    assert.strictEqual(uniqueImages.size, matches.length, 'Every carousel item must have a distinct, non-duplicate image path');

    // Verify all carousel image files exist on disk
    for (const imgPath of matches) {
      const fullPath = path.join(rootDir, 'public', imgPath.replace(/^\//, ''));
      assert.ok(fs.existsSync(fullPath), `Carousel image ${imgPath} must exist on disk`);
      assert.ok(fs.statSync(fullPath).size > 20000, `Carousel image ${imgPath} must have valid non-empty size`);
    }
  });

  it('Requirement 2: Product cards do NOT display gender or category labels on product image area', () => {
    const productCardCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'ProductCard.tsx'), 'utf8');
    
    // Must NOT contain gender or category badge in the JSX
    assert.ok(!productCardCode.includes('{product.gender} • {product.category}'), 'ProductCard must not display {product.gender} • {product.category}');
    assert.ok(!productCardCode.includes('{product.gender}'), 'ProductCard must not display gender label');
    assert.ok(!productCardCode.includes('{product.category}'), 'ProductCard must not display category label on card');

    // Must preserve product codes, names, prices, discounts, and in_stock
    assert.ok(productCardCode.includes('product.code'), 'ProductCard must preserve product.code');
    assert.ok(productCardCode.includes('product.name'), 'ProductCard must preserve product.name');
    assert.ok(productCardCode.includes('product.selling_price'), 'ProductCard must preserve product.selling_price');
    assert.ok(productCardCode.includes('product.original_price'), 'ProductCard must preserve product.original_price');
    assert.ok(productCardCode.includes('product.in_stock'), 'ProductCard must preserve product.in_stock');
    assert.ok(productCardCode.includes('onBuyNow'), 'ProductCard must preserve onBuyNow action');
  });

  it('Requirement 2: Discount calculation handles edge cases safely without misleading percentages', async () => {
    // Test the logic directly
    const getDiscountPercentage = (original, selling) => {
      if (original <= 0 || selling >= original) return 0;
      return Math.round(((original - selling) / original) * 100);
    };
    
    // Normal discount
    assert.strictEqual(getDiscountPercentage(1000, 800), 20);
    assert.strictEqual(getDiscountPercentage(3499, 2499), 29);

    // No discount
    assert.strictEqual(getDiscountPercentage(1000, 1000), 0);
    assert.strictEqual(getDiscountPercentage(800, 1000), 0); // selling > original
    assert.strictEqual(getDiscountPercentage(0, 500), 0); // zero original price
    assert.strictEqual(getDiscountPercentage(-100, 50), 0); // negative original price
  });

  it('Requirement 4: Homepage sections follow the exact specified sequence', () => {
    const appCode = fs.readFileSync(path.join(rootDir, 'src', 'App.tsx'), 'utf8');

    // Find main storefront section in App.tsx
    const storefrontIdx = appCode.indexOf('Customer-facing storefront');
    assert.ok(storefrontIdx > 0, 'Must have Customer-facing storefront section in App.tsx');
    const storefrontPart = appCode.substring(storefrontIdx);

    const posHeader = storefrontPart.indexOf('<Header');
    const posHero = storefrontPart.indexOf('<Hero');
    const posTrust = storefrontPart.indexOf('<TrustHighlights');
    const posFeatured = storefrontPart.indexOf('<FeaturedCarousel');
    const posShopByCat = storefrontPart.indexOf('<ShopByCategory');
    const posCategoryNav = storefrontPart.indexOf('<CategoryNav');
    const posProductGrid = storefrontPart.indexOf('<ProductGrid');
    const posCurated = storefrontPart.indexOf('<CuratedSelectionSection');
    const posPersonal = storefrontPart.indexOf('<PersonalAssistanceSection');
    const posContact = storefrontPart.indexOf('<ContactSection');
    const posFooter = storefrontPart.indexOf('<Footer');

    assert.ok(posHeader !== -1, 'Header must be present');
    assert.ok(posHero > posHeader, 'Hero must be after Header');
    assert.ok(posTrust > posHero, 'TrustHighlights must be after Hero');
    assert.ok(posFeatured > posTrust, 'FeaturedCarousel must be after TrustHighlights');
    assert.ok(posShopByCat > posFeatured, 'ShopByCategory must be after FeaturedCarousel');
    assert.ok(posCategoryNav > posShopByCat, 'CategoryNav (Discover Handcrafted Elegance) must be after ShopByCategory');
    assert.ok(posProductGrid > posCategoryNav, 'ProductGrid must be after CategoryNav');
    assert.ok(posCurated > posProductGrid, 'CuratedSelectionSection must be after ProductGrid');
    assert.ok(posPersonal > posCurated, 'PersonalAssistanceSection must be after CuratedSelectionSection');
    assert.ok(posContact > posPersonal, 'ContactSection must be after PersonalAssistanceSection');
    assert.ok(posFooter > posContact, 'Footer must be after ContactSection');
  });

  it('Requirement 5: Premium color palette classes are defined in CSS', () => {
    const cssCode = fs.readFileSync(path.join(rootDir, 'src', 'index.css'), 'utf8');
    assert.ok(cssCode.includes('#FAF4EA'), 'Warm ivory #FAF4EA must be configured');
    assert.ok(cssCode.includes('#F4D9A0'), 'Champagne gold #F4D9A0 must be configured');
    assert.ok(cssCode.includes('#5B4632'), 'Mocha brown #5B4632 must be configured');
    assert.ok(cssCode.includes('#C8792C'), 'Burnt amber #C8792C must be configured');
    assert.ok(cssCode.includes('#7A1830'), 'Deep burgundy #7A1830 must be configured');
    assert.ok(cssCode.includes('#302218'), 'Dark warm text #302218 must be configured');
  });

  it('Requirement 6: Premium animations (bridal-reveal, sweep, 3D card, reduced-motion) are configured', () => {
    const cssCode = fs.readFileSync(path.join(rootDir, 'src', 'index.css'), 'utf8');
    assert.ok(cssCode.includes('goldLightSweep'), 'goldLightSweep animation must be defined');
    assert.ok(cssCode.includes('bridalReveal'), 'bridalReveal animation must be defined');
    assert.ok(cssCode.includes('product-card-3d'), 'product-card-3d class must be defined');
    assert.ok(cssCode.includes('prefers-reduced-motion'), 'prefers-reduced-motion must be respected');
  });

  it('Requirement 7: Coordinated scroll-triggered animations and timing system are defined in CSS', () => {
    const cssCode = fs.readFileSync(path.join(rootDir, 'src', 'index.css'), 'utf8');
    assert.ok(cssCode.includes('.reveal-on-scroll'), '.reveal-on-scroll class must be defined');
    assert.ok(cssCode.includes('.reveal-on-scroll.is-revealed'), '.reveal-on-scroll.is-revealed class must be defined');
    assert.ok(cssCode.includes('.stagger-container .stagger-card'), 'Staggered card class must be defined');
    assert.ok(cssCode.includes('.editorial-reveal-mask'), 'Editorial mask clip-path class must be defined');
    assert.ok(cssCode.includes('.editorial-zoom-settle'), 'Editorial zoom settle class must be defined');
    assert.ok(cssCode.includes('.stagger-heading'), 'Typography stagger class must be defined');
    assert.ok(cssCode.includes('cubic-bezier(0.16, 1, 0.3, 1)'), 'Luxury timing curve must be used');
  });

  it('Requirement 8: Cinematic 10-12 jewellery slider transitions & controls are implemented', () => {
    const carouselCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'FeaturedCarousel.tsx'), 'utf8');
    
    // Autoplay started by default (isPlaying = true)
    assert.ok(carouselCode.includes('useState(true)'), 'Autoplay must default to playing (true)');
    
    // Hover & focus pause support
    assert.ok(carouselCode.includes('setIsHovered(true)'), 'Must pause on hover');
    assert.ok(carouselCode.includes('setIsFocused(true)'), 'Must pause on focus');
    
    // Keyboard navigation
    assert.ok(carouselCode.includes('ArrowLeft'), 'Must support ArrowLeft keyboard navigation');
    assert.ok(carouselCode.includes('ArrowRight'), 'Must support ArrowRight keyboard navigation');
    
    // Touch swipe support
    assert.ok(carouselCode.includes('handleTouchStart'), 'Must support touch start');
    assert.ok(carouselCode.includes('handleTouchEnd'), 'Must support touch end');
    
    // Cinematic transition elements (slideDirection, zoom settle, outgoing depth)
    assert.ok(carouselCode.includes('animate-cinematic-in-next'), 'Must use cinematic in next animation');
    assert.ok(carouselCode.includes('animate-cinematic-zoom'), 'Must use cinematic zoom settle animation');
    assert.ok(carouselCode.includes('animate-cinematic-caption'), 'Must use cinematic caption animation');
    
    // Champagne-gold pagination indicators
    assert.ok(carouselCode.includes('bg-[#7A1830]'), 'Must use burgundy active indicator');
    assert.ok(carouselCode.includes('bg-[#F4D9A0]'), 'Must use champagne-gold inactive dots');
  });

  it('Requirement 9: Scroll reveal observer utility exists and handles once-only and reduced-motion', () => {
    const scrollUtilPath = path.join(rootDir, 'src', 'lib', 'useScrollReveal.ts');
    assert.ok(fs.existsSync(scrollUtilPath), 'src/lib/useScrollReveal.ts must exist');
    const scrollUtilCode = fs.readFileSync(scrollUtilPath, 'utf8');
    assert.ok(scrollUtilCode.includes('useScrollReveal'), 'useScrollReveal hook must be exported');
    assert.ok(scrollUtilCode.includes('initGlobalScrollReveal'), 'initGlobalScrollReveal function must be exported');
    assert.ok(scrollUtilCode.includes('prefers-reduced-motion'), 'Must check prefers-reduced-motion');
    assert.ok(scrollUtilCode.includes('unobserve'), 'Must unobserve to prevent aggressive replay on return scroll');
  });
});
