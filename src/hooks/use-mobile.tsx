import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Reliable mobile detection for Web, PWA, and Despia environments.
 * Uses screen.width as fallback for PWA/Despia where window.innerWidth
 * may not be immediately available.
 */
export function useIsMobile() {
  // Compute initial value synchronously using multiple fallbacks
  const getIsMobile = (): boolean => {
    if (typeof window === "undefined") return false;
    // Use screen.width as fallback for PWA/Despia environments
    const width = window.innerWidth || screen.width || 0;
    return width < MOBILE_BREAKPOINT;
  };

  const [isMobile, setIsMobile] = React.useState<boolean>(getIsMobile);

  React.useEffect(() => {
    const checkWidth = () => {
      const width = window.innerWidth || screen.width || 0;
      setIsMobile(width < MOBILE_BREAKPOINT);
    };
    
    // Immediate re-check on mount to catch hydration edge cases
    checkWidth();

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    mql.addEventListener("change", checkWidth);
    
    // Also listen for resize as additional fallback
    window.addEventListener("resize", checkWidth);
    
    return () => {
      mql.removeEventListener("change", checkWidth);
      window.removeEventListener("resize", checkWidth);
    };
  }, []);

  return isMobile;
}
