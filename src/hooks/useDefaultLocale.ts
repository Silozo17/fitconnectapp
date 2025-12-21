import { useMemo } from 'react';
import { useUserLocation } from './useUserLocation';
import {
  RouteLanguageCode,
  RouteLocationCode,
  DEFAULT_ROUTE_LOCALE,
  COUNTRY_TO_LOCATION,
  getDefaultLanguageForLocation,
} from '@/lib/locale-routing';

interface DefaultLocaleResult {
  defaultLocale: {
    language: RouteLanguageCode;
    location: RouteLocationCode;
  };
  isLoading: boolean;
  detectedCountry: string | null;
}

/**
 * Hook to determine the default locale based on user's geo-location.
 * Uses the existing useUserLocation hook for geo-detection.
 */
export function useDefaultLocale(): DefaultLocaleResult {
  const { location, isLoading } = useUserLocation();

  const result = useMemo(() => {
    if (!location?.country) {
      return {
        defaultLocale: DEFAULT_ROUTE_LOCALE,
        detectedCountry: null,
      };
    }

    // Map country name to location code
    const locationCode = COUNTRY_TO_LOCATION[location.country];
    
    if (!locationCode) {
      // Unknown country - default to UK
      return {
        defaultLocale: DEFAULT_ROUTE_LOCALE,
        detectedCountry: location.country,
      };
    }

    // Get default language for this location
    const languageCode = getDefaultLanguageForLocation(locationCode);

    return {
      defaultLocale: {
        language: languageCode,
        location: locationCode,
      },
      detectedCountry: location.country,
    };
  }, [location?.country]);

  return {
    ...result,
    isLoading,
  };
}
