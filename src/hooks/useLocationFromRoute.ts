import { useMemo } from 'react';
import { useOptionalLocaleRouting } from '@/contexts/LocaleRoutingContext';
import {
  RouteLocationCode,
  DEFAULT_ROUTE_LOCALE,
  LOCATION_TO_CURRENCY,
  LOCATION_TO_DATE_LOCALE,
} from '@/lib/locale-routing';
import { CurrencyCode } from '@/lib/currency';

interface UseLocationFromRouteReturn {
  /** Location code from URL (e.g., 'gb', 'pl') */
  locationCode: RouteLocationCode;
  /** Whether we're on a locale-prefixed route */
  isLocaleRoute: boolean;
  /** Currency for this location */
  currency: CurrencyCode;
  /** Date locale for this location */
  dateLocale: string;
}

/**
 * Hook that provides location from URL locale routing.
 * This is the single source of truth for location-dependent features like:
 * - Coach filtering by country
 * - Currency formatting
 * - Date formatting
 * 
 * URL format: /{language}-{location}/
 * - /en-gb/ → location: 'gb'
 * - /pl-pl/ → location: 'pl'
 * - /pl-gb/ → location: 'gb' (Polish UI, UK coaches)
 */
export function useLocationFromRoute(): UseLocationFromRouteReturn {
  const localeRouting = useOptionalLocaleRouting();
  
  return useMemo(() => {
    const locationCode = localeRouting?.location ?? DEFAULT_ROUTE_LOCALE.location;
    
    return {
      locationCode,
      isLocaleRoute: localeRouting?.isLocaleRoute ?? false,
      currency: LOCATION_TO_CURRENCY[locationCode] || 'GBP',
      dateLocale: LOCATION_TO_DATE_LOCALE[locationCode] || 'en-GB',
    };
  }, [localeRouting?.location, localeRouting?.isLocaleRoute]);
}
