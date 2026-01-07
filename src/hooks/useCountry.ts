import { useOptionalCountryContext } from "@/contexts/CountryContext";
import { useOptionalLocaleRouting } from "@/contexts/LocaleRoutingContext";
import { useOptionalAppLocale } from "@/contexts/AppLocaleContext";
import { RouteLocationCode, LOCATION_TO_CURRENCY, LOCATION_TO_DATE_LOCALE } from "@/lib/locale-routing";
import { CurrencyCode } from "@/lib/currency";

interface UseCountryReturn {
  /** Current country code - from URL locale if on locale route, otherwise from context */
  countryCode: RouteLocationCode;
  /** Whether the country is from the URL route */
  isFromRoute: boolean;
  /** Whether user manually selected the country (only applies when not from route) */
  isManualOverride: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Currency for current country */
  currency: CurrencyCode;
  /** Date locale for current country */
  dateLocale: string;
  /** Set country manually (updates URL when on locale route) */
  setCountry: (code: RouteLocationCode) => void;
  /** Reset to auto-detected country */
  resetToDetected: () => void;
}

/**
 * Unified hook to access country information.
 * 
 * Priority:
 * 1. URL locale route (e.g., /en-gb/ → 'gb')
 * 2. Country context (auto-detected or manually set)
 * 
 * This ensures that:
 * - On /pl-gb/coaches → shows UK coaches
 * - On /pl-pl/coaches → shows Polish coaches
 */
export function useCountry(): UseCountryReturn {
  const localeRouting = useOptionalLocaleRouting();
  const appLocale = useOptionalAppLocale();
  const context = useOptionalCountryContext();
  
  // Provide safe defaults if context is not available (race condition during native cold start)
  if (!context) {
    return {
      countryCode: 'gb',
      isFromRoute: false,
      isManualOverride: false,
      isLoading: false,
      currency: 'GBP',
      dateLocale: 'en-GB',
      setCountry: () => {},
      resetToDetected: () => {},
    };
  }
  
  // Priority:
  // 1. LocaleRoutingContext (website routes - handles both locale-prefixed and stored preferences)
  // 2. AppLocaleContext (dashboard - reacts to user preference changes)
  // 3. CountryContext (fallback)
  const isFromRoute = localeRouting?.isLocaleRoute ?? false;
  
  let countryCode: RouteLocationCode;
  if (localeRouting) {
    // LocaleRoutingContext is available (website routes)
    // It handles stored preferences for non-locale routes too
    countryCode = localeRouting.location;
  } else if (appLocale) {
    // Dashboard mode - use AppLocaleContext which reacts to changes
    countryCode = appLocale.location;
  } else {
    countryCode = context.countryCode;
  }
  
  return {
    countryCode,
    isFromRoute,
    isManualOverride: isFromRoute ? false : context.isManualOverride,
    isLoading: appLocale?.isLoading ?? context.isLoading,
    currency: LOCATION_TO_CURRENCY[countryCode] || 'GBP',
    dateLocale: LOCATION_TO_DATE_LOCALE[countryCode] || 'en-GB',
    setCountry: isFromRoute 
      ? (code: RouteLocationCode) => localeRouting?.changeLocation(code)
      : context.setCountry,
    resetToDetected: context.resetToDetected,
  };
}

/**
 * Optional version that won't throw if outside provider
 */
export function useOptionalCountry(): UseCountryReturn | null {
  const localeRouting = useOptionalLocaleRouting();
  const appLocale = useOptionalAppLocale();
  const context = useOptionalCountryContext();
  
  if (!context) return null;
  
  const isFromRoute = localeRouting?.isLocaleRoute ?? false;
  
  let countryCode: RouteLocationCode;
  if (localeRouting) {
    // LocaleRoutingContext is available (website routes)
    // It handles stored preferences for non-locale routes too
    countryCode = localeRouting.location;
  } else if (appLocale) {
    countryCode = appLocale.location;
  } else {
    countryCode = context.countryCode;
  }
  
  return {
    countryCode,
    isFromRoute,
    isManualOverride: isFromRoute ? false : context.isManualOverride,
    isLoading: appLocale?.isLoading ?? context.isLoading,
    currency: LOCATION_TO_CURRENCY[countryCode] || 'GBP',
    dateLocale: LOCATION_TO_DATE_LOCALE[countryCode] || 'en-GB',
    setCountry: isFromRoute 
      ? (code: RouteLocationCode) => localeRouting?.changeLocation(code)
      : context.setCountry,
    resetToDetected: context.resetToDetected,
  };
}
