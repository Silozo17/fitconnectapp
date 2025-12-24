/**
 * Hook to centralize platform-based restrictions.
 * Handles iOS, Android, and PWA restrictions for marketplace and purchases.
 */

import { useMemo } from "react";
import { useEnvironment } from "./useEnvironment";

export interface PlatformRestrictions {
  /** True if running on iOS inside Despia native app */
  isIOSNative: boolean;
  /** True if running on Android inside Despia native app */
  isAndroidNative: boolean;
  /** True if running on ANY native platform (iOS or Android) inside Despia */
  isNativeMobile: boolean;
  /** True if running as installed PWA */
  isPWA: boolean;
  /** True if running in standard web browser (not PWA, not native) */
  isWebBrowser: boolean;
  /** Hide marketplace on ALL non-web platforms (native apps + PWA) */
  shouldHideMarketplace: boolean;
  /** Hide web checkout, Stripe, external payment links on iOS only */
  shouldHideWebPurchases: boolean;
  /** Hide coach marketplace and booking on iOS (App Store guideline 3.1.1) */
  shouldHideCoachMarketplace: boolean;
  /** Hide package purchasing and product marketplace on non-web */
  shouldHidePackagePurchasing: boolean;
  /** Hide pricing page with web subscription links on iOS */
  shouldHidePricingPage: boolean;
  /** Hide "Find Coaches" and related discovery features on non-web */
  shouldHideCoachDiscovery: boolean;
}

export const usePlatformRestrictions = (): PlatformRestrictions => {
  const { isDespia, isIOS, isAndroid, isPWA, isBrowser } = useEnvironment();

  return useMemo(() => {
    const isIOSNative = isDespia && isIOS;
    const isAndroidNative = isDespia && isAndroid;
    const isNativeMobile = isIOSNative || isAndroidNative;
    const isWebBrowser = isBrowser;

    // Marketplace blocked on ANY non-browser environment (native apps + PWA)
    const shouldHideMarketplace = isNativeMobile || isPWA;

    return {
      isIOSNative,
      isAndroidNative,
      isNativeMobile,
      isPWA,
      isWebBrowser,
      // Marketplace restrictions apply to all non-web platforms
      shouldHideMarketplace,
      shouldHideCoachMarketplace: shouldHideMarketplace,
      shouldHidePackagePurchasing: shouldHideMarketplace,
      shouldHideCoachDiscovery: shouldHideMarketplace,
      // Payment-related restrictions only apply on iOS native (App Store rules)
      shouldHideWebPurchases: isIOSNative,
      shouldHidePricingPage: isIOSNative,
    };
  }, [isDespia, isIOS, isAndroid, isPWA, isBrowser]);
};

// Re-export for backwards compatibility
export const useIOSRestrictions = usePlatformRestrictions;
