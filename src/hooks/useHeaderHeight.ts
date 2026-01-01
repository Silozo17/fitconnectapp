import { useState, useEffect } from "react";
import { getEnvironment } from "@/hooks/useEnvironment";

/**
 * Hook to calculate the actual header height by reading the computed style
 * of the visible header element. This ensures the ProfileNotch aligns with
 * the actual rendered header, including CSS fallbacks for safe areas.
 */
export const useHeaderHeight = (baseHeight = 42): number => {
  const env = getEnvironment();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1280;
  
  // Initial value: use reasonable default for native iOS
  const [height, setHeight] = useState(() => {
    if (isMobile && env.isDespia && env.isIOS) {
      return 59 + baseHeight; // 123px for iOS native (no bottom padding)
    }
    return baseHeight;
  });

  useEffect(() => {
    if (!isMobile) {
      setHeight(baseHeight);
      return;
    }

    const computeHeight = () => {
      // Find the actual header element to read its computed padding
      const header = document.querySelector('header[role="banner"]');
      
      if (header) {
        // Read the actual computed padding-top of the header
        const computedStyle = getComputedStyle(header);
        const paddingTop = parseInt(computedStyle.paddingTop, 10) || 0;
        const paddingBottom = parseInt(computedStyle.paddingBottom, 10) || 0;
        
        // Total header height = safe area padding + base height + bottom padding
        setHeight(paddingTop + baseHeight + paddingBottom);
      } else if (env.isDespia && env.isIOS) {
        // Fallback: Use the same 59px fallback as CSS
        setHeight(59 + baseHeight);
      } else {
        setHeight(baseHeight);
      }
    };

    // Small delay to ensure CSS has applied
    const timeoutId = setTimeout(computeHeight, 50);

    window.addEventListener('resize', computeHeight);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', computeHeight);
    };
  }, [isMobile, env.isDespia, env.isIOS, baseHeight]);

  return height;
};

