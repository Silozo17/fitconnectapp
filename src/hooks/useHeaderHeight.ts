import { useState, useEffect } from "react";
import { getEnvironment } from "@/hooks/useEnvironment";

/**
 * Hook to calculate the actual header height based on Despia's runtime safe area values.
 * Despia injects --safe-area-top CSS variable with device-specific values.
 * This replaces hardcoded 59px with the actual runtime value.
 */
export const useHeaderHeight = (baseHeight = 64): number => {
  const [height, setHeight] = useState(baseHeight);
  const env = getEnvironment();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1280;

  useEffect(() => {
    if (!isMobile) {
      setHeight(baseHeight);
      return;
    }

    const computeHeight = () => {
      // Read Despia's runtime-injected safe area value
      const safeAreaTop = getComputedStyle(document.documentElement)
        .getPropertyValue('--safe-area-top')
        .trim();
      
      // Parse the value (could be "59px", "47px", or empty)
      const safeAreaPx = safeAreaTop ? parseInt(safeAreaTop, 10) : 0;
      
      if (env.isDespia && env.isIOS) {
        // Despia iOS: safe area + base header + 12px bottom padding
        // Fallback to 59px if variable not set (covers Dynamic Island)
        setHeight((safeAreaPx || 59) + baseHeight + 12);
      } else {
        // Other mobile: base header + 12px padding
        setHeight(baseHeight + 12);
      }
    };

    computeHeight();

    // Re-calculate on orientation change (Despia updates the variable)
    window.addEventListener('resize', computeHeight);
    return () => window.removeEventListener('resize', computeHeight);
  }, [isMobile, env.isDespia, env.isIOS, baseHeight]);

  return height;
};

