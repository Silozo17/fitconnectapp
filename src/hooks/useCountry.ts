import { useCountryContext, useOptionalCountryContext } from "@/contexts/CountryContext";
import { RouteLocationCode, LOCATION_TO_CURRENCY, LOCATION_TO_DATE_LOCALE } from "@/lib/locale-routing";
import { CurrencyCode } from "@/lib/currency";

interface UseCountryReturn {
  /** Current country code */
  countryCode: RouteLocationCode;
  /** Whether user manually selected the country */
  isManualOverride: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Currency for current country */
  currency: CurrencyCode;
  /** Date locale for current country */
  dateLocale: string;
  /** Set country manually */
  setCountry: (code: RouteLocationCode) => void;
  /** Reset to auto-detected country */
  resetToDetected: () => void;
}

/**
 * Simple hook to access country information and settings.
 * Includes derived values like currency and date locale.
 */
export function useCountry(): UseCountryReturn {
  const context = useCountryContext();
  
  return {
    countryCode: context.countryCode,
    isManualOverride: context.isManualOverride,
    isLoading: context.isLoading,
    currency: LOCATION_TO_CURRENCY[context.countryCode] || 'GBP',
    dateLocale: LOCATION_TO_DATE_LOCALE[context.countryCode] || 'en-GB',
    setCountry: context.setCountry,
    resetToDetected: context.resetToDetected,
  };
}

/**
 * Optional version that won't throw if outside provider
 */
export function useOptionalCountry(): UseCountryReturn | null {
  const context = useOptionalCountryContext();
  
  if (!context) return null;
  
  return {
    countryCode: context.countryCode,
    isManualOverride: context.isManualOverride,
    isLoading: context.isLoading,
    currency: LOCATION_TO_CURRENCY[context.countryCode] || 'GBP',
    dateLocale: LOCATION_TO_DATE_LOCALE[context.countryCode] || 'en-GB',
    setCountry: context.setCountry,
    resetToDetected: context.resetToDetected,
  };
}
