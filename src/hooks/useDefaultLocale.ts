import { useMemo } from 'react';
import { useUserLocation } from './useUserLocation';
import {
  RouteLanguageCode,
  RouteLocationCode,
  DEFAULT_ROUTE_LOCALE,
  COUNTRY_TO_LOCATION,
  getDefaultLanguageForLocation,
  isValidLanguage,
} from '@/lib/locale-routing';

interface DefaultLocaleResult {
  defaultLocale: {
    language: RouteLanguageCode;
    location: RouteLocationCode;
  };
  isLoading: boolean;
  detectedCountry: string | null;
  /** Whether device language was detected */
  deviceLanguageUsed: boolean;
}

/**
 * Gets the device/browser language if valid
 */
function getDeviceLanguage(): RouteLanguageCode | null {
  if (typeof navigator === 'undefined') return null;
  
  // Try navigator.language first (e.g., 'pl-PL' or 'en')
  const browserLang = navigator.language?.split('-')[0]?.toLowerCase();
  if (browserLang && isValidLanguage(browserLang)) {
    return browserLang;
  }
  
  // Try navigator.languages array
  const languages = navigator.languages || [];
  for (const lang of languages) {
    const code = lang.split('-')[0]?.toLowerCase();
    if (code && isValidLanguage(code)) {
      return code;
    }
  }
  
  return null;
}

/**
 * Hook to determine the default locale based on:
 * 1. Device/browser language (priority 2, after stored preference which is checked elsewhere)
 * 2. Geo-location (priority 3)
 * 3. Default en-gb (priority 4)
 * 
 * Stored preference is checked in LocaleRedirect component.
 */
export function useDefaultLocale(): DefaultLocaleResult {
  const { location, isLoading } = useUserLocation();

  const result = useMemo(() => {
    // Priority 2: Device/browser language
    const deviceLanguage = getDeviceLanguage();
    
    // Priority 3: Geo-detected location
    let locationCode: RouteLocationCode | null = null;
    let detectedCountry: string | null = null;
    
    if (location?.country) {
      detectedCountry = location.country;
      locationCode = COUNTRY_TO_LOCATION[location.country] || null;
    }
    
    // Determine final language
    // - Use device language if detected
    // - Otherwise use location's default language
    // - Otherwise use 'en'
    let languageCode: RouteLanguageCode;
    let deviceLanguageUsed = false;
    
    if (deviceLanguage) {
      languageCode = deviceLanguage;
      deviceLanguageUsed = true;
    } else if (locationCode) {
      languageCode = getDefaultLanguageForLocation(locationCode);
    } else {
      languageCode = DEFAULT_ROUTE_LOCALE.language;
    }
    
    // Determine final location
    // - Use geo-detected location if available
    // - Otherwise use default
    const finalLocation = locationCode ?? DEFAULT_ROUTE_LOCALE.location;

    return {
      defaultLocale: {
        language: languageCode,
        location: finalLocation,
      },
      detectedCountry,
      deviceLanguageUsed,
    };
  }, [location?.country]);

  return {
    ...result,
    isLoading,
  };
}
