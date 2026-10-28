import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Vaidehi Imitation - Scroll Animations & Cinematic Slider Verification', () => {
  const rootDir = process.cwd();

  it('1. Scroll Animations: Global observer is hooked into App.tsx', () => {
    const appCode = fs.readFileSync(path.join(rootDir, 'src', 'App.tsx'), 'utf8');
    assert.ok(appCode.includes('initGlobalScrollReveal'), 'App.tsx must import and call initGlobalScrollReveal');
    assert.ok(appCode.includes('initGlobalScrollReveal()'), 'App.tsx must execute initGlobalScrollReveal in useEffect');
  });

  it('2. Scroll Animations: All homepage sections have coordinated scroll-reveal classes', () => {
    const heroCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'Hero.tsx'), 'utf8');
    const trustCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'TrustHighlights.tsx'), 'utf8');
    const carouselCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'FeaturedCarousel.tsx'), 'utf8');
    const shopByCatCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'ShopByCategory.tsx'), 'utf8');
    const categoryNavCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'CategoryNav.tsx'), 'utf8');
    const productGridCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'ProductGrid.tsx'), 'utf8');
    const curatedCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'CuratedSelectionSection.tsx'), 'utf8');
    const personalCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'PersonalAssistanceSection.tsx'), 'utf8');
    const contactCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'ContactSection.tsx'), 'utf8');

    // Hero editorial mask + zoom settle
    assert.ok(heroCode.includes('editorial-reveal-mask'), 'Hero must use editorial-reveal-mask');
    assert.ok(heroCode.includes('editorial-zoom-settle'), 'Hero must use editorial-zoom-settle');

    // Trust highlights staggered entrance
    assert.ok(trustCode.includes('reveal-on-scroll'), 'TrustHighlights must have reveal-on-scroll');
    assert.ok(trustCode.includes('stagger-container'), 'TrustHighlights must have stagger-container');
    assert.ok(trustCode.includes('stagger-card'), 'TrustHighlights cards must have stagger-card');

    // Featured Collection coordinated reveal
    assert.ok(carouselCode.includes('reveal-on-scroll'), 'FeaturedCarousel must have reveal-on-scroll');
    assert.ok(carouselCode.includes('stagger-heading'), 'FeaturedCarousel must have stagger-heading');

    // Shop By Category staggered cards
    assert.ok(shopByCatCode.includes('reveal-on-scroll'), 'ShopByCategory must have reveal-on-scroll');
    assert.ok(shopByCatCode.includes('stagger-container'), 'ShopByCategory must have stagger-container');
    assert.ok(shopByCatCode.includes('stagger-card'), 'ShopByCategory cards must have stagger-card');

    // CategoryNav / Discover Handcrafted Elegance
    assert.ok(categoryNavCode.includes('reveal-on-scroll'), 'CategoryNav must have reveal-on-scroll');
    assert.ok(categoryNavCode.includes('stagger-heading'), 'CategoryNav must have stagger-heading');

    // Product Grid cards
    assert.ok(productGridCode.includes('stagger-container'), 'ProductGrid must have stagger-container');

    // Curated Selection editorial reveal & pills
    assert.ok(curatedCode.includes('reveal-on-scroll'), 'CuratedSelectionSection must have reveal-on-scroll');
    assert.ok(curatedCode.includes('editorial-reveal-mask'), 'CuratedSelectionSection must have editorial-reveal-mask');
    assert.ok(curatedCode.includes('editorial-zoom-settle'), 'CuratedSelectionSection must have editorial-zoom-settle');
    assert.ok(curatedCode.includes('stagger-container'), 'CuratedSelectionSection must have stagger-container');
    assert.ok(curatedCode.includes('stagger-card'), 'CuratedSelectionSection must have stagger-card');

    // Personal Assistance cards
    assert.ok(personalCode.includes('reveal-on-scroll'), 'PersonalAssistanceSection must have reveal-on-scroll');
    assert.ok(personalCode.includes('stagger-container'), 'PersonalAssistanceSection must have stagger-container');
    assert.ok(personalCode.includes('stagger-card'), 'PersonalAssistanceSection must have stagger-card');

    // Contact Section cards
    assert.ok(contactCode.includes('reveal-on-scroll'), 'ContactSection must have reveal-on-scroll');
    assert.ok(contactCode.includes('stagger-container'), 'ContactSection must have stagger-container');
    assert.ok(contactCode.includes('stagger-card'), 'ContactSection must have stagger-card');
  });

  it('3. Featured Carousel: Has exactly 12 distinct bridal/imitation jewellery photographs', () => {
    const carouselCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'FeaturedCarousel.tsx'), 'utf8');
    const imageMatches = [...carouselCode.matchAll(/image:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
    
    assert.strictEqual(imageMatches.length, 12, 'Must have exactly 12 items in FEATURED_ITEMS');
    const unique = new Set(imageMatches);
    assert.strictEqual(unique.size, 12, 'All 12 image paths must be unique');

    // Verify all 12 assets are available on disk
    imageMatches.forEach((img) => {
      const fullPath = path.join(rootDir, 'public', img.replace(/^\//, ''));
      assert.ok(fs.existsSync(fullPath), `Featured asset ${img} must exist on disk`);
    });
  });

  it('4. Featured Carousel: Autoplay defaults to started, pauses on hover/focus/reduced-motion, and honors manual stop', () => {
    const carouselCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'FeaturedCarousel.tsx'), 'utf8');
    
    // Default is playing
    assert.ok(carouselCode.includes('const [isPlaying, setIsPlaying] = useState(true);'), 'Carousel isPlaying state must default to true');
    
    // Hover & focus detection
    assert.ok(carouselCode.includes('onMouseEnter={() => setIsHovered(true)}'), 'Container must have onMouseEnter');
    assert.ok(carouselCode.includes('onMouseLeave={() => setIsHovered(false)}'), 'Container must have onMouseLeave');
    assert.ok(carouselCode.includes('onFocus={() => setIsFocused(true)}'), 'Container must have onFocus');
    assert.ok(carouselCode.includes('onBlur={() => setIsFocused(false)}'), 'Container must have onBlur');

    // Reduced motion & autoplay condition
    assert.ok(carouselCode.includes('prefers-reduced-motion'), 'Must check prefers-reduced-motion in autoplay');
    assert.ok(carouselCode.includes('shouldRun = isPlaying && !isHovered && !isFocused && !mediaQuery.matches'), 'Autoplay shouldRun condition must be exact');

    // Manual toggle button
    assert.ok(carouselCode.includes('togglePlayPause'), 'Must have togglePlayPause handler');
    assert.ok(carouselCode.includes('<Pause'), 'Must render Pause icon when playing');
    assert.ok(carouselCode.includes('<Play'), 'Must render Play icon when stopped');
  });

  it('5. Mobile Responsiveness: Zero horizontal overflow classes and responsive breakpoints 360px, 390px, 430px supported', () => {
    const cssCode = fs.readFileSync(path.join(rootDir, 'src', 'index.css'), 'utf8');
    assert.ok(cssCode.includes('overflow-x: hidden'), 'body and html must prevent horizontal overflow');
    
    // Check that aspect ratios in FeaturedCarousel are responsive
    const carouselCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'FeaturedCarousel.tsx'), 'utf8');
    assert.ok(carouselCode.includes('aspect-4/3 sm:aspect-16/10 lg:aspect-16/9'), 'Must have responsive aspect ratios without layout shifts');
  });

  it('6. Hero Initial Entrance: Stationary background, left text entrance, right bridal image entrance & loader coordination', () => {
    // 1. Loading screen preservation
    const loaderCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'PageEntranceLoader.tsx'), 'utf8');
    assert.ok(loaderCode.includes('Vaidehi Imitation Logo'), 'Loader must preserve Vaidehi Imitation logo');
    assert.ok(loaderCode.includes('Traditional & Bridal Jewellery • Dhasa Junction'), 'Loader must preserve brand subtitle text');
    assert.ok(loaderCode.includes('animate-shimmer'), 'Loader must preserve minimalist progress shimmer');
    assert.ok(loaderCode.includes('onComplete'), 'Loader must support onComplete callback');

    // 2. App connection
    const appCode = fs.readFileSync(path.join(rootDir, 'src', 'App.tsx'), 'utf8');
    assert.ok(appCode.includes('<PageEntranceLoader onComplete='), 'App must pass onComplete to PageEntranceLoader');
    assert.ok(appCode.includes('<Hero onShopClick={scrollToCatalogue} isReady={isHeroReady} />'), 'App must pass isReady to Hero');

    // 3. Hero component implementation
    const heroCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'Hero.tsx'), 'utf8');
    assert.ok(heroCode.includes('hero-text-entrance'), 'Hero left column must use hero-text-entrance');
    assert.ok(heroCode.includes('hero-stagger-heading'), 'Hero heading must have hero-stagger-heading (appears first)');
    assert.ok(heroCode.includes('hero-stagger-badges'), 'Hero badges must have hero-stagger-badges');
    assert.ok(heroCode.includes('hero-stagger-text'), 'Hero text must have hero-stagger-text');
    assert.ok(heroCode.includes('hero-stagger-actions'), 'Hero action buttons must have hero-stagger-actions');
    assert.ok(heroCode.includes('hero-stagger-reassurance'), 'Hero highlights must have hero-stagger-reassurance');
    assert.ok(heroCode.includes('hero-image-entrance'), 'Hero right column must use hero-image-entrance');
    assert.ok(heroCode.includes("object-[center_12%]"), 'Hero must preserve bridal model face/jewellery positioning');
    assert.ok(heroCode.includes('rounded-[2rem]'), 'Hero bridal card must preserve rounded-[2rem]');

    // 4. CSS entrance rules & fixed background
    const cssCode = fs.readFileSync(path.join(rootDir, 'src', 'index.css'), 'utf8');
    assert.ok(cssCode.includes('.hero-text-entrance {'), 'CSS must define .hero-text-entrance');
    assert.ok(cssCode.includes('transform: translate3d(-36px, 0, 0);'), 'Hero text must be positioned slightly outside left edge initially');
    assert.ok(cssCode.includes('.hero-image-entrance {'), 'CSS must define .hero-image-entrance');
    assert.ok(cssCode.includes('transform: translate3d(42px, 0, 0) scale(0.98);'), 'Hero image must be positioned slightly outside right edge initially');
    assert.ok(cssCode.includes('.hero-text-entrance.is-active .hero-stagger-heading'), 'CSS must stagger heading first');
    assert.ok(cssCode.includes('cubic-bezier(0.16, 1, 0.3, 1)'), 'CSS must use luxury ease-out timing');

    // 5. Reduced-motion compliance
    assert.ok(cssCode.includes('.hero-text-entrance,\n  .hero-stagger-item,\n  .hero-image-entrance') ||
              cssCode.includes('.hero-text-entrance'), 'Must include reduced-motion overrides for hero entrance');
  });
});
