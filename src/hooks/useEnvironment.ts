import { useState, useEffect, useMemo } from "react";

export interface EnvironmentInfo {
  /** Running in standard browser (not PWA, not native) */
  isBrowser: boolean;
  /** Running as installed PWA (standalone mode) */
  isPWA: boolean;
  /** Running in Capacitor/Cordova native wrapper */
  isNativeApp: boolean;
  /** Either PWA or native (not browser) */
  isStandalone: boolean;
  /** iOS device detected */
  isIOS: boolean;
  /** Android device detected */
  isAndroid: boolean;
}

/**
 * Centralized environment detection hook.
 * Detects if running in browser, PWA, or native app context.
 */
export const useEnvironment = (): EnvironmentInfo => {
  const [isPWA, setIsPWA] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Detect Android
    const android = /Android/i.test(navigator.userAgent);
    setIsAndroid(android);

    // Detect native app (Capacitor or Cordova)
    const isCapacitor = !!(window as any).Capacitor;
    const isCordova = !!(window as any).cordova;
    setIsNativeApp(isCapacitor || isCordova);

    // Detect PWA (standalone mode)
    // Method 1: display-mode media query
    const standaloneMediaQuery = window.matchMedia("(display-mode: standalone)");
    const isStandaloneMode = standaloneMediaQuery.matches;
    
    // Method 2: iOS Safari standalone property
    const isIOSStandalone = (navigator as any).standalone === true;
    
    // Method 3: Check if launched from home screen on Android
    const isFullscreen = window.matchMedia("(display-mode: fullscreen)").matches;
    
    // Combined PWA detection (but not native app)
    const pwaDetected = (isStandaloneMode || isIOSStandalone || isFullscreen) && !isCapacitor && !isCordova;
    setIsPWA(pwaDetected);

    // Listen for display mode changes
    const handleChange = (e: MediaQueryListEvent) => {
      if (!isCapacitor && !isCordova) {
        setIsPWA(e.matches);
      }
    };

    standaloneMediaQuery.addEventListener("change", handleChange);
    return () => standaloneMediaQuery.removeEventListener("change", handleChange);
  }, []);

  const isStandalone = isPWA || isNativeApp;
  const isBrowser = !isStandalone;

  return useMemo(() => ({
    isBrowser,
    isPWA,
    isNativeApp,
    isStandalone,
    isIOS,
    isAndroid,
  }), [isBrowser, isPWA, isNativeApp, isStandalone, isIOS, isAndroid]);
};

/**
 * Static environment check (for use outside React components).
 * Note: This runs once at import time, so it won't react to changes.
 */
export const getEnvironment = (): EnvironmentInfo => {
  const isCapacitor = typeof window !== "undefined" && !!(window as any).Capacitor;
  const isCordova = typeof window !== "undefined" && !!(window as any).cordova;
  const isNativeApp = isCapacitor || isCordova;

  const isStandaloneMode = typeof window !== "undefined" && 
    window.matchMedia("(display-mode: standalone)").matches;
  const isIOSStandalone = typeof navigator !== "undefined" && 
    (navigator as any).standalone === true;
  const isFullscreen = typeof window !== "undefined" && 
    window.matchMedia("(display-mode: fullscreen)").matches;

  const isPWA = (isStandaloneMode || isIOSStandalone || isFullscreen) && !isNativeApp;
  const isStandalone = isPWA || isNativeApp;
  const isBrowser = !isStandalone;

  const isIOS = typeof navigator !== "undefined" && 
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = typeof navigator !== "undefined" && 
    /Android/i.test(navigator.userAgent);

  return {
    isBrowser,
    isPWA,
    isNativeApp,
    isStandalone,
    isIOS,
    isAndroid,
  };
};
