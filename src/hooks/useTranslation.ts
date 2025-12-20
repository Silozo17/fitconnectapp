import { useTranslation as useI18nTranslation } from 'react-i18next';

/**
 * Custom translation hook that wraps react-i18next's useTranslation
 * with project-specific defaults and type safety.
 * 
 * STATUS: Production-ready but NOT currently used
 * 
 * This hook is safe to import anywhere, but is intentionally not being used
 * to render UI text yet. All user-facing strings are currently hardcoded
 * in English throughout the application.
 * 
 * CURRENT STATE:
 * - The hook works correctly and can be imported safely
 * - Calling t('key') will return the key string if no translation exists
 * - Fallback to English is guaranteed via i18n configuration
 * - String extraction has NOT been performed on components
 * 
 * WHEN TO USE:
 * - Do NOT use this hook until string extraction is prioritised
 * - When ready, replace hardcoded text with: {t('namespace.key')}
 * 
 * @example
 * // Future usage (not implemented yet):
 * const { t } = useTranslation();
 * <span>{t('common.save')}</span>
 * 
 * @see src/i18n/index.ts - Main i18n configuration with full documentation
 */
export function useTranslation(namespace: string = 'common') {
  const { t, i18n, ready } = useI18nTranslation(namespace);

  return {
    t,
    i18n,
    ready,
    currentLanguage: i18n.language,
    changeLanguage: i18n.changeLanguage,
  };
}

export default useTranslation;
