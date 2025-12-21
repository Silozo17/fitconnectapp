import { CurrencyCode } from './currency';
import { LocaleCode } from './date';

// ============================================
// Supported Language Codes (UI text language)
// ============================================
export type RouteLanguageCode = 'en' | 'pl';

export const SUPPORTED_LANGUAGES: RouteLanguageCode[] = ['en', 'pl'];

// ============================================
// Supported Location Codes (region/market)
// ============================================
export type RouteLocationCode = 'gb' | 'pl' | 'us' | 'ie' | 'au' | 'ca';

export const SUPPORTED_LOCATIONS: RouteLocationCode[] = ['gb', 'pl', 'us', 'ie', 'au', 'ca'];

// ============================================
// English-speaking countries (language defaults to English)
// ============================================
export const ENGLISH_SPEAKING_COUNTRIES: RouteLocationCode[] = ['gb', 'us', 'ie', 'au', 'ca'];

// ============================================
// Default fallback locale
// ============================================
export const DEFAULT_ROUTE_LOCALE = { 
  language: 'en' as RouteLanguageCode, 
  location: 'gb' as RouteLocationCode 
};

// ============================================
// Country name/code to location code mapping
// ============================================
export const COUNTRY_TO_LOCATION: Record<string, RouteLocationCode> = {
  // Country codes
  'GB': 'gb',
  'UK': 'gb',
  'PL': 'pl',
  'US': 'us',
  'IE': 'ie',
  'AU': 'au',
  'CA': 'ca',
  // Country names (from geo-detection)
  'United Kingdom': 'gb',
  'Poland': 'pl',
  'United States': 'us',
  'Ireland': 'ie',
  'Australia': 'au',
  'Canada': 'ca',
};

// ============================================
// Location to currency mapping
// ============================================
export const LOCATION_TO_CURRENCY: Record<RouteLocationCode, CurrencyCode> = {
  'gb': 'GBP',
  'us': 'USD',
  'ie': 'EUR',
  'pl': 'PLN',
  'au': 'AUD',
  'ca': 'CAD',
};

// ============================================
// Location to date locale mapping
// ============================================
export const LOCATION_TO_DATE_LOCALE: Record<RouteLocationCode, LocaleCode> = {
  'gb': 'en-GB',
  'us': 'en-US',
  'ie': 'en-GB', // Ireland uses UK date format
  'pl': 'en-GB', // Use en-GB until we add pl-PL locale
  'au': 'en-GB', // Australia uses UK date format
  'ca': 'en-US', // Canada uses US date format
};

// ============================================
// Language code to i18n language mapping
// ============================================
export const LANGUAGE_TO_I18N: Record<RouteLanguageCode, string> = {
  'en': 'en',
  'pl': 'pl',
};

// ============================================
// Validation functions
// ============================================
export function isValidLanguage(code: string): code is RouteLanguageCode {
  return SUPPORTED_LANGUAGES.includes(code as RouteLanguageCode);
}

export function isValidLocation(code: string): code is RouteLocationCode {
  return SUPPORTED_LOCATIONS.includes(code as RouteLocationCode);
}

// ============================================
// Locale string format: "en-gb", "pl-pl", etc.
// ============================================
export function formatLocaleString(language: RouteLanguageCode, location: RouteLocationCode): string {
  return `${language}-${location}`;
}

export function parseLocaleString(locale: string): { language: RouteLanguageCode; location: RouteLocationCode } | null {
  const parts = locale.toLowerCase().split('-');
  if (parts.length !== 2) return null;
  
  const [lang, loc] = parts;
  if (isValidLanguage(lang) && isValidLocation(loc)) {
    return { language: lang, location: loc };
  }
  return null;
}

// ============================================
// URL Parsing and Building
// ============================================

export interface ParsedLocaleRoute {
  language: RouteLanguageCode;
  location: RouteLocationCode;
  restOfPath: string;
  isLocaleRoute: boolean;
}

// ============================================
// Protected paths that should NOT use locale routing
// ============================================
const PROTECTED_PATHS = [
  '/dashboard',
  '/onboarding',
  '/docs',
  '/auth',
  '/subscribe',
];

/**
 * Check if a path is protected from locale routing
 */
function isProtectedPath(path: string): boolean {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return PROTECTED_PATHS.some(protectedPath => 
    normalizedPath === protectedPath || normalizedPath.startsWith(`${protectedPath}/`)
  );
}

/**
 * Parse locale from URL path
 * Matches pattern: /en-gb/... or /pl-pl/...
 * Protected paths (dashboard, onboarding, docs, auth, subscribe) are never locale routes
 */
export function parseLocaleFromPath(pathname: string): ParsedLocaleRoute {
  // Match pattern: /xx-yy or /xx-yy/...
  const match = pathname.match(/^\/([a-z]{2})-([a-z]{2})(\/.*)?$/);
  
  if (match) {
    const [, lang, loc, rest] = match;
    if (isValidLanguage(lang) && isValidLocation(loc)) {
      const restOfPath = rest || '/';
      
      // Don't treat as locale route if the rest is a protected path
      if (isProtectedPath(restOfPath)) {
        return {
          ...DEFAULT_ROUTE_LOCALE,
          restOfPath: pathname, // Keep full path for redirect handling
          isLocaleRoute: false,
        };
      }
      
      return {
        language: lang,
        location: loc,
        restOfPath,
        isLocaleRoute: true,
      };
    }
  }
  
  // Not a locale route - return defaults with original path
  return {
    ...DEFAULT_ROUTE_LOCALE,
    restOfPath: pathname,
    isLocaleRoute: false,
  };
}

/**
 * Build a locale-prefixed path
 */
export function buildLocalePath(
  language: RouteLanguageCode,
  location: RouteLocationCode,
  path: string
): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Remove trailing slash unless it's just "/"
  const normalizedPath = cleanPath === '/' ? '' : cleanPath;
  return `/${language}-${location}${normalizedPath}`;
}

/**
 * Check if the locale matches the default (en-gb)
 */
export function isDefaultLocale(language: RouteLanguageCode, location: RouteLocationCode): boolean {
  return language === DEFAULT_ROUTE_LOCALE.language && location === DEFAULT_ROUTE_LOCALE.location;
}

/**
 * Get the default language for a given location
 * English-speaking countries get English, others get their native language
 */
export function getDefaultLanguageForLocation(location: RouteLocationCode): RouteLanguageCode {
  if (ENGLISH_SPEAKING_COUNTRIES.includes(location)) {
    return 'en';
  }
  // Map location to language (only Polish for now)
  if (location === 'pl') {
    return 'pl';
  }
  return 'en';
}

// ============================================
// Storage keys
// ============================================
export const LOCALE_STORAGE_KEY = 'fitconnect-locale-routing';

export interface StoredLocalePreference {
  language: RouteLanguageCode;
  location: RouteLocationCode;
  source: 'geo' | 'manual' | 'url';
  timestamp: number;
}

/**
 * Get stored locale preference from localStorage
 */
export function getStoredLocalePreference(): StoredLocalePreference | null {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored) as StoredLocalePreference;
    // Validate stored values
    if (isValidLanguage(parsed.language) && isValidLocation(parsed.location)) {
      return parsed;
    }
  } catch {
    // Invalid stored data
  }
  return null;
}

/**
 * Store locale preference in localStorage
 */
export function setStoredLocalePreference(
  language: RouteLanguageCode,
  location: RouteLocationCode,
  source: 'geo' | 'manual' | 'url'
): void {
  const preference: StoredLocalePreference = {
    language,
    location,
    source,
    timestamp: Date.now(),
  };
  localStorage.setItem(LOCALE_STORAGE_KEY, JSON.stringify(preference));
}

/**
 * Clear stored locale preference
 */
export function clearStoredLocalePreference(): void {
  localStorage.removeItem(LOCALE_STORAGE_KEY);
}
