import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
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
    lng: DEFAULT_LANGUAGE,
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
