import { useCountryContext } from "@/contexts/CountryContext";
import { getActivePricing, ActivePricing } from "@/lib/pricing-config";

/**
 * React hook for accessing country-specific pricing.
 * Returns pricing in the user's local currency - NEVER uses conversion.
 * 
 * Usage:
 * const pricing = useActivePricing();
 * const formattedPrice = pricing.formatPrice(pricing.prices.boost);
 * const monthlyPrice = pricing.getSubscriptionPrice('pro', 'monthly');
 */
export function useActivePricing(): ActivePricing {
  const { countryCode } = useCountryContext();
  return getActivePricing(countryCode);
}
