import { useState, useEffect } from "react";
import { getEnvironment } from "@/hooks/useEnvironment";

/**
 * Hook to calculate the actual header height by reading the computed style
 * of the visible header element. This ensures the ProfileNotch aligns with
 * the actual rendered header, including CSS fallbacks for safe areas.
 */
export const useHeaderHeight = (baseHeight = 64): number => {
  const env = getEnvironment();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1280;
  
  // Native iOS uses 42px, everything else uses the default baseHeight (64px)
  const effectiveBaseHeight = (env.isDespia && env.isIOS) ? 42 : baseHeight;
  
  // Initial value: use reasonable default for native iOS
  const [height, setHeight] = useState(() => {
    if (isMobile && env.isDespia && env.isIOS) {
      return 59 + effectiveBaseHeight; // 101px for iOS native (59px safe area + 42px content)
    }
    return effectiveBaseHeight;
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
        
        // Total header height = safe area padding + effective base height + bottom padding
        setHeight(paddingTop + effectiveBaseHeight + paddingBottom);
      } else if (env.isDespia && env.isIOS) {
        // Fallback: Use the same 59px fallback as CSS
        setHeight(59 + effectiveBaseHeight);
      } else {
        setHeight(effectiveBaseHeight);
      }
    };

    // Small delay to ensure CSS has applied
    const timeoutId = setTimeout(computeHeight, 50);

    window.addEventListener('resize', computeHeight);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', computeHeight);
    };
  }, [isMobile, env.isDespia, env.isIOS, effectiveBaseHeight]);

  return height;
};

