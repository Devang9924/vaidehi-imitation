import { useEffect, useRef, useState } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

/**
 * Custom React hook for scroll-triggered reveals using IntersectionObserver.
 * - Defaults to `once: true` to prevent aggressive re-triggering during slight scrolls.
 * - Respects `prefers-reduced-motion: reduce` by immediately revealing content.
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  options: UseScrollRevealOptions = {}
) {
  const { threshold = 0.1, rootMargin = '0px 0px -8% 0px', once = true } = options;
  const ref = useRef<T | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsRevealed(true);
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsRevealed(true);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setIsRevealed(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsRevealed(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once]);

  return { ref, isRevealed };
}

/**
 * Global observer that automatically adds `.is-revealed` to elements with:
 * - `.reveal-on-scroll`
 * - `.stagger-container`
 * - `.editorial-reveal-mask`
 * 
 * Configured with `once: true` behavior so that revealed sections remain in place
 * without repetitive jarring re-triggering as the user scrolls up and down.
 */
export function initGlobalScrollReveal(
  rootMargin = '0px 0px -6% 0px',
  threshold = 0.1
): () => void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    document
      .querySelectorAll('.reveal-on-scroll, .stagger-container, .editorial-reveal-mask')
      .forEach((el) => {
        el.classList.add('is-revealed');
      });
    return () => {};
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document
      .querySelectorAll('.reveal-on-scroll, .stagger-container, .editorial-reveal-mask')
      .forEach((el) => {
        el.classList.add('is-revealed');
      });
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold, rootMargin }
  );

  const observeElements = () => {
    const targets = document.querySelectorAll(
      '.reveal-on-scroll:not(.is-revealed), .stagger-container:not(.is-revealed), .editorial-reveal-mask:not(.is-revealed)'
    );
    targets.forEach((el) => observer.observe(el));
  };

  observeElements();

  // Watch for dynamic DOM additions (e.g., catalogue loading)
  const mutationObserver = new MutationObserver(() => {
    observeElements();
  });

  mutationObserver.observe(document.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    mutationObserver.disconnect();
  };
}
