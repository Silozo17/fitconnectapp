import { useMemo } from 'react';
import { useUserLocation } from './useUserLocation';
import {
  RouteLanguageCode,
  RouteLocationCode,
  DEFAULT_ROUTE_LOCALE,
  COUNTRY_TO_LOCATION,
  getDefaultLanguageForLocation,
  isValidLanguage,
  parseLocaleFromPath,
  getStoredLocalePreference,
} from '@/lib/locale-routing';

type DetectionSource = 'stored' | 'url' | 'device' | 'geo' | 'default';

interface LocaleDetectionResult {
  locale: { 
    language: RouteLanguageCode; 
    location: RouteLocationCode;
  };
  source: DetectionSource;
  isLoading: boolean;
  isReady: boolean;
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
 * Unified hook for locale detection with proper priority order:
 * 1. User saved preference (localStorage)
 * 2. URL (/lang-location/)
 * 3. Device language (navigator.language)
 * 4. Geo-location (IP)
 * 5. Platform default (en-gb)
 */
export function useLocaleDetection(currentPath: string): LocaleDetectionResult {
  const { location: geoLocation, isLoading: geoLoading } = useUserLocation();
  
  return useMemo(() => {
    // Priority 1: Stored preference (from previous visits or manual selection)
    const stored = getStoredLocalePreference();
    if (stored) {
      return { 
        locale: { language: stored.language, location: stored.location },
        source: 'stored' as DetectionSource,
        isLoading: false,
        isReady: true,
      };
    }
    
    // Priority 2: URL locale (e.g., /en-gb/coaches)
    const urlParsed = parseLocaleFromPath(currentPath);
    if (urlParsed.isLocaleRoute) {
      return { 
        locale: { language: urlParsed.language, location: urlParsed.location },
        source: 'url' as DetectionSource,
        isLoading: false,
        isReady: true,
      };
    }
    
    // Priority 3: Device language
    const deviceLanguage = getDeviceLanguage();
    
    // Priority 4: Geo-location (must wait for this if no device language)
    if (geoLoading) {
      // Return default while waiting, mark as not ready
      return { 
        locale: DEFAULT_ROUTE_LOCALE,
        source: 'default' as DetectionSource,
        isLoading: true,
        isReady: false,
      };
    }
    
    // Geo-location is ready, determine location code
    const geoLocationCode: RouteLocationCode | null = geoLocation?.country 
      ? (COUNTRY_TO_LOCATION[geoLocation.country] ?? COUNTRY_TO_LOCATION[geoLocation.countryCode || ''] ?? null)
      : null;
    
    // Combine device language + geo location
    if (deviceLanguage || geoLocationCode) {
      const finalLocation = geoLocationCode ?? DEFAULT_ROUTE_LOCALE.location;
      const finalLanguage = deviceLanguage ?? getDefaultLanguageForLocation(finalLocation);
      
      return {
        locale: {
          language: finalLanguage,
          location: finalLocation,
        },
        source: (deviceLanguage ? 'device' : 'geo') as DetectionSource,
        isLoading: false,
        isReady: true,
      };
    }
    
    // Priority 5: Platform default
    return { 
      locale: DEFAULT_ROUTE_LOCALE,
      source: 'default' as DetectionSource,
      isLoading: false,
      isReady: true,
    };
  }, [currentPath, geoLocation, geoLoading]);
}

/**
 * Synchronous function to get initial locale for preventing flicker
 * Only checks stored preference and URL (no async operations)
 */
export function getInitialLocale(currentPath: string): { 
  language: RouteLanguageCode; 
  location: RouteLocationCode;
} {
  // Check stored preference first
  const stored = getStoredLocalePreference();
  if (stored) {
    return { language: stored.language, location: stored.location };
  }
  
  // Check URL
  const parsed = parseLocaleFromPath(currentPath);
  if (parsed.isLocaleRoute) {
    return { language: parsed.language, location: parsed.location };
  }
  
  // Return default
  return DEFAULT_ROUTE_LOCALE;
}
