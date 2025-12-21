/**
 * Unified Pricing Source of Truth
 * 
 * All pricing, currency, and Stripe price ID configuration is centralized here.
 * Country determines currency and price IDs - no frontend conversion.
 */

export type PricingCountry = 'GB' | 'PL';
export type PricingCurrency = 'GBP' | 'PLN';
export type SubscriptionTier = 'starter' | 'pro' | 'enterprise';
export type BillingInterval = 'monthly' | 'yearly';

export interface SubscriptionPriceIds {
  monthly: string;
  yearly: string;
}

export interface SubscriptionPricing {
  monthly: number;
  yearly: number;
  savings: number;
}

export interface CountryPricingConfig {
  country: PricingCountry;
  currency: PricingCurrency;
  currencySymbol: string;
  locale: string;
  stripePriceIds: {
    subscriptions: Record<SubscriptionTier, SubscriptionPriceIds>;
    boost: string;
  };
  pricing: {
    subscriptions: Record<SubscriptionTier, SubscriptionPricing>;
    boost: number;
  };
}

/**
 * Master pricing configuration by country.
 * Each country has its own Stripe price IDs and pricing amounts.
 */
export const PRICING_CONFIGS: Record<PricingCountry, CountryPricingConfig> = {
  GB: {
    country: 'GB',
    currency: 'GBP',
    currencySymbol: '£',
    locale: 'en-GB',
    stripePriceIds: {
      subscriptions: {
        starter: {
          monthly: 'price_1Sf80vEztIBHKDEerFCQIjUR',
          yearly: 'price_1Sf812EztIBHKDEevWTflleJ',
        },
        pro: {
          monthly: 'price_1Sf80wEztIBHKDEeO6RxdYCU',
          yearly: 'price_1Sf813EztIBHKDEeqPNPZoRy',
        },
        enterprise: {
          monthly: 'price_1Sf80xEztIBHKDEegrV6T1T7',
          yearly: 'price_1Sf814EztIBHKDEevMuXmU4J',
        },
      },
      boost: 'price_1Sh2QCEztIBHKDEeBoostGBP', // TODO: Add real boost price ID for GBP
    },
    pricing: {
      subscriptions: {
        starter: { monthly: 19, yearly: 190, savings: 38 },
        pro: { monthly: 49, yearly: 490, savings: 98 },
        enterprise: { monthly: 99, yearly: 990, savings: 198 },
      },
      boost: 5,
    },
  },
  PL: {
    country: 'PL',
    currency: 'PLN',
    currencySymbol: 'zł',
    locale: 'pl-PL',
    stripePriceIds: {
      subscriptions: {
        starter: {
          monthly: 'price_1SgvfEEztIBHKDEe5R8Ouqls',
          yearly: 'price_1SgvfGEztIBHKDEedOcGnELa',
        },
        pro: {
          monthly: 'price_1SgvfIEztIBHKDEejNc6oP2q',
          yearly: 'price_1SgvfJEztIBHKDEejTwn9u45',
        },
        enterprise: {
          monthly: 'price_1SgvfLEztIBHKDEeheUytGet',
          yearly: 'price_1SgvfNEztIBHKDEeIaxNaEUD',
        },
      },
      boost: 'price_1SgvfPEztIBHKDEe63hxwTyy',
    },
    pricing: {
      subscriptions: {
        starter: { monthly: 79, yearly: 790, savings: 158 },
        pro: { monthly: 199, yearly: 1990, savings: 398 },
        enterprise: { monthly: 399, yearly: 3990, savings: 798 },
      },
      boost: 25,
    },
  },
};

/**
 * Get pricing configuration for a country code.
 * Defaults to GB if country is not supported.
 */
export function getPricingConfig(countryCode: string | null | undefined): CountryPricingConfig {
  const normalized = countryCode?.toUpperCase();
  if (normalized === 'PL') {
    return PRICING_CONFIGS.PL;
  }
  return PRICING_CONFIGS.GB;
}

/**
 * Get Stripe price ID for a subscription tier and billing interval.
 */
export function getSubscriptionPriceId(
  countryCode: string | null | undefined,
  tier: SubscriptionTier,
  interval: BillingInterval
): string {
  const config = getPricingConfig(countryCode);
  return config.stripePriceIds.subscriptions[tier][interval];
}

/**
 * Get boost price ID for a country.
 */
export function getBoostPriceId(countryCode: string | null | undefined): string {
  const config = getPricingConfig(countryCode);
  return config.stripePriceIds.boost;
}

/**
 * Format a price amount for display using the country's currency settings.
 */
export function formatPrice(
  amount: number,
  countryCode: string | null | undefined
): string {
  const config = getPricingConfig(countryCode);
  
  // Format number with locale-appropriate separators
  const formattedNumber = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  
  // Position currency symbol (£ before, zł after)
  if (config.currency === 'PLN') {
    return `${formattedNumber} ${config.currencySymbol}`;
  }
  return `${config.currencySymbol}${formattedNumber}`;
}

/**
 * Get subscription price for display.
 */
export function getSubscriptionPrice(
  countryCode: string | null | undefined,
  tier: SubscriptionTier,
  interval: BillingInterval
): number {
  const config = getPricingConfig(countryCode);
  return config.pricing.subscriptions[tier][interval];
}

/**
 * Get subscription savings amount.
 */
export function getSubscriptionSavings(
  countryCode: string | null | undefined,
  tier: SubscriptionTier
): number {
  const config = getPricingConfig(countryCode);
  return config.pricing.subscriptions[tier].savings;
}

/**
 * Get boost price for display.
 */
export function getBoostPrice(countryCode: string | null | undefined): number {
  const config = getPricingConfig(countryCode);
  return config.pricing.boost;
}

/**
 * Check if a country code is supported for pricing.
 */
export function isSupportedPricingCountry(countryCode: string | null | undefined): boolean {
  const normalized = countryCode?.toUpperCase();
  return normalized === 'GB' || normalized === 'PL';
}
