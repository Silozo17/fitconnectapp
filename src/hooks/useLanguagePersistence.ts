/**
 * Hook to ensure language preference is properly restored on app boot.
 * Works across web, PWA, and Despia native app environments.
 */
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGE_STORAGE_KEY, ALL_LANGUAGES, SUPPORTED_LANGUAGES } from '@/i18n';

export function useLanguagePersistence() {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    // Ensure stored language is applied on mount
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (!stored) return;
      
      const isDev = import.meta.env.DEV;
      const availableLanguages = isDev ? ALL_LANGUAGES : SUPPORTED_LANGUAGES;
      const validCodes = availableLanguages.map(l => l.code);
      
      // Only change if stored language is valid and different from current
      if (validCodes.includes(stored) && i18n.language !== stored) {
        i18n.changeLanguage(stored);
      }
    } catch {
      // localStorage not available (SSR, private browsing, etc.)
    }
  }, [i18n]);
}
