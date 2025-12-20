/**
 * ============================================================================
 * INTERNATIONALIZATION (i18n) CONFIGURATION
 * ============================================================================
 * 
 * STATUS: Infrastructure ready, English default, Polish dev-only
 * 
 * This i18n system is fully configured and production-safe, but is NOT
 * currently being used to render UI text. All user-facing strings are
 * hardcoded in English throughout the application.
 * 
 * WHY IS THIS UNUSED?
 * - The platform is launching in the UK market first (English-only)
 * - String extraction will be performed when multi-language support is prioritised
 * - This infrastructure exists to enable future internationalisation
 * 
 * CURRENT GUARDRAILS (do not remove without explicit approval):
 * 1. App remains English-only in production
 * 2. Browser auto-translation is disabled (see index.html: translate="no")
 * 3. Language selector shows Polish only in development mode
 * 4. Browser language detection is PREPARED but disabled via feature flag
 * 5. Polish translation file exists but is hidden behind dev mode
 * 6. Language preference is persisted to localStorage
 * 7. Missing Polish keys fallback to English
 * 
 * FUTURE EXPANSION STEPS:
 * 1. Extract hardcoded strings from components using t('key') pattern
 * 2. Organise translations into namespaces (auth, coach, client, etc.)
 * 3. Add language files for target locales
 * 4. Enable browser detection: set I18N_FEATURE_FLAGS.ENABLE_BROWSER_DETECTION = true
 * 5. Move Polish from DEV_LANGUAGES to SUPPORTED_LANGUAGES when ready
 * 
 * @see src/i18n/feature-flags.ts - Feature flags for i18n behavior
 * @see src/hooks/useTranslation.ts - Custom hook wrapper
 * @see src/components/shared/LanguageSelector.tsx - Language picker (Polish dev-only)
 * @see src/i18n/locales/en/common.json - English translation keys
 * @see src/i18n/locales/pl/common.json - Polish translation keys (dev-only)
 * ============================================================================
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { I18N_FEATURE_FLAGS } from './feature-flags';

// Import translation files
import enCommon from './locales/en/common.json';
import enLanding from './locales/en/landing.json';
import enDashboard from './locales/en/dashboard.json';
import plCommon from './locales/pl/common.json';
import plLanding from './locales/pl/landing.json';
import plDashboard from './locales/pl/dashboard.json';

// Production-visible languages (what users see in production)
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
] as const;

// Dev-only languages (hidden from production users)
export const DEV_LANGUAGES = [
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
] as const;

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
 * Always falls back to English if stored value is invalid or unavailable.
 * Polish is only allowed if in development mode.
 */
const getStoredLanguage = (): LanguageCode => {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    
    // If Polish is stored but we're in production, force English
    if (stored === 'pl' && !import.meta.env.DEV) {
      return DEFAULT_LANGUAGE;
    }
    
    const allCodes = ALL_LANGUAGES.map(l => l.code) as string[];
    if (stored && allCodes.includes(stored)) {
      return stored as LanguageCode;
    }
  } catch {
    // localStorage not available (SSR, private browsing, etc.)
  }
  return DEFAULT_LANGUAGE;
};

// Translation resources (includes Polish for dev mode)
const resources = {
  en: {
    common: enCommon,
    landing: enLanding,
    dashboard: enDashboard,
  },
  pl: {
    common: plCommon,
    landing: plLanding,
    dashboard: plDashboard,
  },
};

// Get whitelisted languages for detector (respects dev mode)
const getWhitelistedLanguages = (): string[] => {
  if (import.meta.env.DEV) {
    return ALL_LANGUAGES.map(l => l.code);
  }
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
  ns: ['common', 'landing', 'dashboard'],
  
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
