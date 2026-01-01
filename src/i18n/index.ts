/**
 * ============================================================================
 * INTERNATIONALIZATION (i18n) CONFIGURATION
 * ============================================================================
 * 
 * STATUS: English production-ready, Polish in development
 * 
 * This i18n system is fully configured and actively used throughout the
 * application. All user-facing strings use the t('key') pattern.
 * 
 * SUPPORTED LANGUAGES:
 * - English (en) - Primary language, UK market (PRODUCTION)
 * - Polish (pl) - In development (DEV ONLY)
 * 
 * CURRENT FEATURES:
 * 1. Multi-language support (English production, Polish dev)
 * 2. Browser auto-translation disabled (see index.html: translate="no")
 * 3. Language selector available to all users
 * 4. Browser language detection available via feature flag
 * 5. Language preference persisted to localStorage
 * 6. Missing keys fallback to English
 * 
 * ADDING NEW LANGUAGES:
 * 1. Create translation files in src/i18n/locales/{code}/
 * 2. Import files and add to resources object below
 * 3. Add language to SUPPORTED_LANGUAGES array
 * 
 * @see src/i18n/feature-flags.ts - Feature flags for i18n behavior
 * @see src/hooks/useTranslation.ts - Custom hook wrapper
 * @see src/components/shared/LanguageSelector.tsx - Language picker
 * @see src/i18n/locales/en/ - English translation files
 * @see src/i18n/locales/pl/ - Polish translation files (dev only)
 * ============================================================================
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { I18N_FEATURE_FLAGS } from './feature-flags';

// Import ONLY English translation files synchronously (production language)
// Polish translations are loaded on-demand to reduce initial bundle size
import enCommon from './locales/en/common.json';
import enLanding from './locales/en/landing.json';
import enDashboard from './locales/en/dashboard.json';
import enSettings from './locales/en/settings.json';
import enBooking from './locales/en/booking.json';
import enMessaging from './locales/en/messaging.json';
import enCoaches from './locales/en/coaches.json';
import enClient from './locales/en/client.json';
import enCoach from './locales/en/coach.json';
import enAdmin from './locales/en/admin.json';
import enPages from './locales/en/pages.json';
import enGamification from './locales/en/gamification.json';
import enMarketplace from './locales/en/marketplace.json';

// Production-visible languages (what users see in production)
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
] as const;

// Dev-only languages (for testing new languages before production)
export const DEV_LANGUAGES = [] as const;

// Combined type for all language codes
export type LanguageCode = 'en' | 'pl';

// All available languages (for internal use)
export const ALL_LANGUAGES = [...SUPPORTED_LANGUAGES, ...DEV_LANGUAGES];

// Default language for UK launch
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

// Storage key for persisted language preference
export const LANGUAGE_STORAGE_KEY = 'fitconnect-language';

/**
 * Validate and retrieve stored language preference.
 * Falls back to English if stored value is invalid or unavailable.
 */
const getStoredLanguage = (): LanguageCode => {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const validCodes = SUPPORTED_LANGUAGES.map(l => l.code) as string[];
    
    if (stored && validCodes.includes(stored)) {
      return stored as LanguageCode;
    }
  } catch {
    // localStorage not available (SSR, private browsing, etc.)
  }
  return DEFAULT_LANGUAGE;
};

// Translation resources - start with English only
// Polish is loaded on-demand when user switches language
const resources = {
  en: {
    common: enCommon,
    landing: enLanding,
    dashboard: enDashboard,
    settings: enSettings,
    booking: enBooking,
    messaging: enMessaging,
    coaches: enCoaches,
    client: enClient,
    coach: enCoach,
    admin: enAdmin,
    pages: enPages,
    gamification: enGamification,
    marketplace: enMarketplace,
  },
};

/**
 * Dynamically load Polish translations when needed.
 * This reduces initial bundle size by ~50KB+ (gzipped).
 */
export async function loadPolishTranslations(): Promise<void> {
  if (i18n.hasResourceBundle('pl', 'common')) {
    // Already loaded
    return;
  }
  
  try {
    const [
      plCommon,
      plLanding,
      plDashboard,
      plSettings,
      plBooking,
      plMessaging,
      plCoaches,
      plClient,
      plCoach,
      plAdmin,
      plPages,
      plGamification,
      plMarketplace,
    ] = await Promise.all([
      import('./locales/pl/common.json'),
      import('./locales/pl/landing.json'),
      import('./locales/pl/dashboard.json'),
      import('./locales/pl/settings.json'),
      import('./locales/pl/booking.json'),
      import('./locales/pl/messaging.json'),
      import('./locales/pl/coaches.json'),
      import('./locales/pl/client.json'),
      import('./locales/pl/coach.json'),
      import('./locales/pl/admin.json'),
      import('./locales/pl/pages.json'),
      import('./locales/pl/gamification.json'),
      import('./locales/pl/marketplace.json'),
    ]);
    
    i18n.addResourceBundle('pl', 'common', plCommon.default, true, true);
    i18n.addResourceBundle('pl', 'landing', plLanding.default, true, true);
    i18n.addResourceBundle('pl', 'dashboard', plDashboard.default, true, true);
    i18n.addResourceBundle('pl', 'settings', plSettings.default, true, true);
    i18n.addResourceBundle('pl', 'booking', plBooking.default, true, true);
    i18n.addResourceBundle('pl', 'messaging', plMessaging.default, true, true);
    i18n.addResourceBundle('pl', 'coaches', plCoaches.default, true, true);
    i18n.addResourceBundle('pl', 'client', plClient.default, true, true);
    i18n.addResourceBundle('pl', 'coach', plCoach.default, true, true);
    i18n.addResourceBundle('pl', 'admin', plAdmin.default, true, true);
    i18n.addResourceBundle('pl', 'pages', plPages.default, true, true);
    i18n.addResourceBundle('pl', 'gamification', plGamification.default, true, true);
    i18n.addResourceBundle('pl', 'marketplace', plMarketplace.default, true, true);
    
    console.log('[i18n] Polish translations loaded dynamically');
  } catch (error) {
    console.error('[i18n] Failed to load Polish translations:', error);
  }
}

// Get whitelisted languages for detector
const getWhitelistedLanguages = (): string[] => {
  return SUPPORTED_LANGUAGES.map(l => l.code);
};

// Configure the language detector (prepared but gated by feature flag)
const detectionOptions = {
  // Detection priority order: user preference first, then browser
  order: ['localStorage', 'navigator'],
  
  // Where to cache detected language
  caches: ['localStorage'],
  
  // localStorage key (matches our existing key)
  lookupLocalStorage: LANGUAGE_STORAGE_KEY,
  
  // Only detect languages in our whitelist
  checkWhitelist: true,
};

// Build i18next instance
const i18nInstance = i18n.use(initReactI18next);

// Conditionally add language detector based on feature flag
if (I18N_FEATURE_FLAGS.ENABLE_BROWSER_DETECTION) {
  i18nInstance.use(LanguageDetector);
}

// Initialize i18next
i18nInstance.init({
  resources,
  // Only set lng explicitly if detection is disabled
  // When detection is enabled, detector will determine the language
  ...(I18N_FEATURE_FLAGS.ENABLE_BROWSER_DETECTION 
    ? {} 
    : { lng: getStoredLanguage() }
  ),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: getWhitelistedLanguages(),
  defaultNS: 'common',
  ns: ['common', 'landing', 'dashboard', 'settings', 'booking', 'messaging', 'coaches', 'client', 'coach', 'admin', 'pages', 'gamification', 'marketplace'],
  
  // Detection config (only used if detector is added)
  detection: detectionOptions,

  interpolation: {
    escapeValue: false, // React already escapes values
  },

  // Debug mode - disable in production
  debug: false,

  // React options
  react: {
    useSuspense: false, // Disable suspense for now
  },
});

export default i18n;
