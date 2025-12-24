import { useCountry } from "@/hooks/useCountry";
import { isDespia } from "@/lib/despia";
import { 
  getPricingConfig, 
  NATIVE_PRICING_CONFIGS, 
  formatPrice,
  SubscriptionTier,
  BillingInterval,
  PricingCountry,
  PricingCurrency,
} from "@/lib/pricing-config";

/**
 * Native app pricing interface
 * Used for iOS/Android where prices are higher due to store fees
 */
export interface NativePricing {
  isNative: boolean;
  country: PricingCountry;
  currency: PricingCurrency;
  currencySymbol: string;
  locale: string;
  prices: {
    subscriptions: Record<SubscriptionTier, { monthly: number; yearly: number; savings: number }>;
    boost: number;
  };
  formatPrice: (amount: number) => string;
  getSubscriptionPrice: (tier: SubscriptionTier, interval: BillingInterval) => number;
  getSubscriptionSavings: (tier: SubscriptionTier) => number;
}

/**
 * Hook for native app pricing (iOS/Android)
 * Returns higher prices that account for App Store/Play Store fees (~30%)
 * Automatically detects if running in native environment (Despia)
 */
export function useNativePricing(): NativePricing {
  const { countryCode } = useCountry();
  const config = getPricingConfig(countryCode);
  const isNative = isDespia();
  
  // Use native pricing when in Despia, otherwise fall back to web pricing
  const pricing = isNative 
    ? NATIVE_PRICING_CONFIGS[config.country] 
    : config.pricing;
  
  return {
    isNative,
    country: config.country,
    currency: config.currency,
    currencySymbol: config.currencySymbol,
    locale: config.locale,
    prices: pricing,
    formatPrice: (amount: number) => formatPrice(amount, countryCode),
    getSubscriptionPrice: (tier: SubscriptionTier, interval: BillingInterval) => 
      pricing.subscriptions[tier][interval],
    getSubscriptionSavings: (tier: SubscriptionTier) => 
      pricing.subscriptions[tier].savings,
  };
}
