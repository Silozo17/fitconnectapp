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
 * 4. No browser language detection is enabled
 * 5. Polish translation file exists but is hidden behind dev mode
 * 6. Language preference is persisted to localStorage
 * 7. Missing Polish keys fallback to English
 * 
 * FUTURE EXPANSION STEPS:
 * 1. Extract hardcoded strings from components using t('key') pattern
 * 2. Organise translations into namespaces (auth, coach, client, etc.)
 * 3. Add language files for target locales
 * 4. Enable browser language detection (i18next-browser-languagedetector)
 * 5. Move Polish from DEV_LANGUAGES to SUPPORTED_LANGUAGES when ready
 * 
 * @see src/hooks/useTranslation.ts - Custom hook wrapper
 * @see src/components/shared/LanguageSelector.tsx - Language picker (Polish dev-only)
 * @see src/i18n/locales/en/common.json - English translation keys
 * @see src/i18n/locales/pl/common.json - Polish translation keys (dev-only)
 * ============================================================================
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enCommon from './locales/en/common.json';
import plCommon from './locales/pl/common.json';

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
  },
  pl: {
    common: plCommon,
  },
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getStoredLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS: 'common',
    ns: ['common'],
    
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
