import { useState, useEffect, useMemo } from "react";
import { isDespia } from "@/lib/despia";

export interface EnvironmentInfo {
  /** Running in standard browser (not PWA, not native) */
  isBrowser: boolean;
  /** Running as installed PWA (standalone mode) */
  isPWA: boolean;
  /** Running in Capacitor/Cordova native wrapper */
  isNativeApp: boolean;
  /** Running inside Despia native runtime */
  isDespia: boolean;
  /** Either PWA, native, or Despia (not browser) */
  isStandalone: boolean;
  /** iOS device detected */
  isIOS: boolean;
  /** Android device detected */
  isAndroid: boolean;
}

// Compute initial values synchronously to prevent hydration flash
const getInitialPlatformState = () => {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return { isIOS: false, isAndroid: false, isPWA: false, isDespiaEnv: false, isNativeApp: false };
  }
  
  const ua = navigator.userAgent.toLowerCase();
  const iOS = ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod');
  const android = ua.includes('android');
  const despiaEnv = isDespia();
  const isCapacitor = !!(window as any).Capacitor;
  const isCordova = !!(window as any).cordova;
  const nativeApp = isCapacitor || isCordova;
  
  const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches;
  const isIOSStandalone = (navigator as any).standalone === true;
  const isFullscreen = window.matchMedia("(display-mode: fullscreen)").matches;
  const pwa = (isStandaloneMode || isIOSStandalone || isFullscreen) && !nativeApp && !despiaEnv;
  
  return {
    isIOS: iOS,
    isAndroid: android,
    isPWA: pwa,
    isDespiaEnv: despiaEnv,
    isNativeApp: nativeApp,
  };
};

const initialPlatform = getInitialPlatformState();

/**
 * Centralized environment detection hook.
 * Detects if running in browser, PWA, or native app context.
 */
export const useEnvironment = (): EnvironmentInfo => {
  const [isPWA, setIsPWA] = useState(initialPlatform.isPWA);
  const [isNativeApp, setIsNativeApp] = useState(initialPlatform.isNativeApp);
  const [isDespiaEnv, setIsDespiaEnv] = useState(initialPlatform.isDespiaEnv);
  const [isIOS, setIsIOS] = useState(initialPlatform.isIOS);
  const [isAndroid, setIsAndroid] = useState(initialPlatform.isAndroid);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    
    // Detect iOS (using lowercase as per Despia docs)
    const iOS = ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod');
    setIsIOS(iOS);

    // Detect Android (using lowercase as per Despia docs)
    const android = ua.includes('android');
    setIsAndroid(android);

    // Detect native app (Capacitor or Cordova)
    const isCapacitor = !!(window as any).Capacitor;
    const isCordova = !!(window as any).cordova;
    setIsNativeApp(isCapacitor || isCordova);

    // Detect Despia native runtime
    setIsDespiaEnv(isDespia());

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

  const isStandalone = isPWA || isNativeApp || isDespiaEnv;
  const isBrowser = !isStandalone;

  return useMemo(() => ({
    isBrowser,
    isPWA,
    isNativeApp,
    isDespia: isDespiaEnv,
    isStandalone,
    isIOS,
    isAndroid,
  }), [isBrowser, isPWA, isNativeApp, isDespiaEnv, isStandalone, isIOS, isAndroid]);
};

/**
 * Static environment check (for use outside React components).
 * Note: This runs once at import time, so it won't react to changes.
 */
export const getEnvironment = (): EnvironmentInfo => {
  const isCapacitor = typeof window !== "undefined" && !!(window as any).Capacitor;
  const isCordova = typeof window !== "undefined" && !!(window as any).cordova;
  const isNativeApp = isCapacitor || isCordova;
  const isDespiaEnv = isDespia();

  const isStandaloneMode = typeof window !== "undefined" && 
    window.matchMedia("(display-mode: standalone)").matches;
  const isIOSStandalone = typeof navigator !== "undefined" && 
    (navigator as any).standalone === true;
  const isFullscreen = typeof window !== "undefined" && 
    window.matchMedia("(display-mode: fullscreen)").matches;

  const isPWA = (isStandaloneMode || isIOSStandalone || isFullscreen) && !isNativeApp && !isDespiaEnv;
  const isStandalone = isPWA || isNativeApp || isDespiaEnv;
  const isBrowser = !isStandalone;

  const ua = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
  const isIOS = ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod');
  const isAndroid = ua.includes('android');

  return {
    isBrowser,
    isPWA,
    isNativeApp,
    isDespia: isDespiaEnv,
    isStandalone,
    isIOS,
    isAndroid,
  };
};
