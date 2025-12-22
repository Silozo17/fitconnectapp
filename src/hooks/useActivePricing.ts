import { useCountry } from "@/hooks/useCountry";
import { getActivePricing, ActivePricing } from "@/lib/pricing-config";

/**
 * React hook for accessing country-specific pricing.
 * Returns pricing in the user's local currency - NEVER uses conversion.
 * Respects URL locale routes (e.g., /pl-en/ → PLN pricing).
 * 
 * Usage:
 * const pricing = useActivePricing();
 * const formattedPrice = pricing.formatPrice(pricing.prices.boost);
 * const monthlyPrice = pricing.getSubscriptionPrice('pro', 'monthly');
 */
export function useActivePricing(): ActivePricing {
  const { countryCode } = useCountry();
  return getActivePricing(countryCode);
}
