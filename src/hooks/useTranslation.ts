import { useTranslation as useI18nTranslation } from 'react-i18next';

/**
 * Custom translation hook that wraps react-i18next's useTranslation
 * with project-specific defaults and type safety.
 * 
 * Usage:
 * const { t } = useTranslation();
 * <span>{t('common.save')}</span>
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
