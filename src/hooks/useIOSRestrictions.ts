/**
 * Hook to centralize iOS App Store compliance restrictions.
 * All purchase-related and marketplace features must be hidden on iOS native.
 */

import { useMemo } from "react";
import { useEnvironment } from "./useEnvironment";

export interface IOSRestrictions {
  /** True if running on iOS inside Despia native app */
  isIOSNative: boolean;
  /** True if running on Android inside Despia native app */
  isAndroidNative: boolean;
  /** Hide web checkout, Stripe, external payment links on iOS */
  shouldHideWebPurchases: boolean;
  /** Hide coach marketplace and booking on iOS (App Store guideline 3.1.1) */
  shouldHideCoachMarketplace: boolean;
  /** Hide package purchasing and product marketplace on iOS */
  shouldHidePackagePurchasing: boolean;
  /** Hide pricing page with web subscription links on iOS */
  shouldHidePricingPage: boolean;
  /** Hide "Find Coaches" and related discovery features on iOS */
  shouldHideCoachDiscovery: boolean;
}

export const useIOSRestrictions = (): IOSRestrictions => {
  const { isDespia, isIOS, isAndroid } = useEnvironment();

  return useMemo(() => {
    const isIOSNative = isDespia && isIOS;
    const isAndroidNative = isDespia && isAndroid;

    return {
      isIOSNative,
      isAndroidNative,
      // All purchase-related restrictions apply only on iOS native
      shouldHideWebPurchases: isIOSNative,
      shouldHideCoachMarketplace: isIOSNative,
      shouldHidePackagePurchasing: isIOSNative,
      shouldHidePricingPage: isIOSNative,
      shouldHideCoachDiscovery: isIOSNative,
    };
  }, [isDespia, isIOS, isAndroid]);
};
