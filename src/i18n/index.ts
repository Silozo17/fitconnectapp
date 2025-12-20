/**
 * ============================================================================
 * INTERNATIONALIZATION (i18n) CONFIGURATION
 * ============================================================================
 * 
 * STATUS: Infrastructure ready, intentionally unused
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
 * 1. App remains English-only
 * 2. Browser auto-translation is disabled (see index.html: translate="no")
 * 3. Language selector is functional but only English is selectable
 * 4. No browser language detection is enabled
 * 5. No additional language files exist beyond en/common.json
 * 6. Language preference is persisted to localStorage
 * 
 * FUTURE EXPANSION STEPS:
 * 1. Extract hardcoded strings from components using t('key') pattern
 * 2. Organise translations into namespaces (auth, coach, client, etc.)
 * 3. Add language files for target locales
 * 4. Enable browser language detection (i18next-browser-languagedetector)
 * 5. Enable the LanguageSelector component
 * 
 * @see src/hooks/useTranslation.ts - Custom hook wrapper
 * @see src/components/settings/LanguageSelector.tsx - Disabled language picker
 * @see src/i18n/locales/en/common.json - English translation keys
 * ============================================================================
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files (English only for now)
import enCommon from './locales/en/common.json';

// Define supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  // Add more languages here when expanding internationally
  // { code: 'es', name: 'Spanish', nativeName: 'Español' },
  // { code: 'fr', name: 'French', nativeName: 'Français' },
  // { code: 'de', name: 'German', nativeName: 'Deutsch' },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

// Default language for UK launch
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

// Storage key for persisted language preference
export const LANGUAGE_STORAGE_KEY = 'fitconnect-language';

/**
 * Validate and retrieve stored language preference.
 * Always falls back to English if stored value is invalid or unavailable.
 */
const getStoredLanguage = (): LanguageCode => {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const supportedCodes = SUPPORTED_LANGUAGES.map(l => l.code) as string[];
    if (stored && supportedCodes.includes(stored)) {
      return stored as LanguageCode;
    }
  } catch {
    // localStorage not available (SSR, private browsing, etc.)
  }
  return DEFAULT_LANGUAGE;
};

// Translation resources
const resources = {
  en: {
    common: enCommon,
  },
  // Add more languages here when expanding
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
