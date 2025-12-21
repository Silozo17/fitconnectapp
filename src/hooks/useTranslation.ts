import { useTranslation as useI18nTranslation } from 'react-i18next';

const isDev = import.meta.env.DEV;

/**
 * Checks if a translation result is an unresolved key (raw key string).
 * i18next returns the key itself when no translation is found.
 */
function isUnresolvedKey(key: string, result: string): boolean {
  // If the result equals the key exactly, it's likely unresolved
  // Also check for common patterns like "namespace.key.subkey"
  return result === key || (result.includes('.') && !result.includes(' ') && result.split('.').length >= 2);
}

/**
 * Creates a safe translation function that:
 * - Logs warnings in development for missing keys
 * - Falls back to English in production
 * - Never renders raw key strings to users
 */
function createSafeT(t: ReturnType<typeof useI18nTranslation>['t'], i18n: any, namespace: string) {
  return ((key: string, options?: any) => {
    const result = t(key, options);
    
    // If result is not a string (e.g., object for plurals), return as-is
    if (typeof result !== 'string') {
      return result;
    }
    
    // Check if this looks like an unresolved key
    if (isUnresolvedKey(key, result)) {
      const fullKey = key.includes('.') ? key : `${namespace}.${key}`;
      
      if (isDev) {
        console.warn(
          `[i18n] Missing translation key: "${fullKey}" for language "${i18n.language}". ` +
          `Add this key to src/i18n/locales/${i18n.language}/${namespace}.json`
        );
      }
      
      // Try to get English fallback
      const englishResult = i18n.getFixedT('en', namespace)(key, options);
      
      if (typeof englishResult === 'string' && !isUnresolvedKey(key, englishResult)) {
        return englishResult;
      }
      
      // Last resort: return empty string or a user-friendly placeholder
      // This prevents raw keys from ever showing to users
      if (isDev) {
        // In dev, show a visible indicator that translation is missing
        return `[${key}]`;
      }
      
      // In production, return empty string to avoid showing raw keys
      return '';
    }
    
    return result;
  }) as ReturnType<typeof useI18nTranslation>['t'];
}

/**
 * Custom translation hook that wraps react-i18next's useTranslation
 * with project-specific defaults, type safety, and missing key protection.
 * 
 * FEATURES:
 * - Logs warnings in development when translation keys are missing
 * - Falls back to English if the current language lacks a translation
 * - Never renders raw key strings (e.g., "common.save") to users
 * - Returns empty string in production for completely missing keys
 * 
 * @example
 * const { t } = useTranslation('pages');
 * <span>{t('successStories.hero.title')}</span>
 * 
 * @see src/i18n/index.ts - Main i18n configuration
 */
export function useTranslation(namespace: string = 'common') {
  const { t, i18n, ready } = useI18nTranslation(namespace);

  // Wrap t function with safety checks
  const safeT = createSafeT(t, i18n, namespace);

  return {
    t: safeT,
    i18n,
    ready,
    currentLanguage: i18n.language,
    changeLanguage: i18n.changeLanguage,
  };
}

export default useTranslation;
