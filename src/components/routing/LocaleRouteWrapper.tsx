import { Outlet, useParams } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import {
  isValidLanguage,
  isValidLocation,
  LOCATION_TO_CURRENCY,
  LOCATION_TO_DATE_LOCALE,
  LANGUAGE_TO_I18N,
  setStoredLocalePreference,
  RouteLanguageCode,
  RouteLocationCode,
} from '@/lib/locale-routing';
import i18n from '@/i18n';

/**
 * Wrapper component for locale-prefixed routes.
 * Parses /:locale param (e.g., "en-gb") and sets language/location contexts.
 */
export function LocaleRouteWrapper() {
  const { locale } = useParams<{ locale: string }>();
  const { setCurrency, setLocale } = useLocale();
  
  // Parse the locale param (e.g., "en-gb" -> { lang: "en", loc: "gb" })
  const parsedLocale = useMemo(() => {
    if (!locale) return null;
    
    const match = locale.match(/^([a-z]{2})-([a-z]{2})$/);
    if (!match) return null;
    
    const [, lang, loc] = match;
    if (!isValidLanguage(lang) || !isValidLocation(loc)) return null;
    
    return {
      language: lang as RouteLanguageCode,
      location: loc as RouteLocationCode,
    };
  }, [locale]);
  
  // Apply locale settings when valid
  useEffect(() => {
    if (!parsedLocale) return;
    
    const { language, location } = parsedLocale;
    
    // Update i18n language
    const i18nLang = LANGUAGE_TO_I18N[language];
    if (i18n.language !== i18nLang) {
      i18n.changeLanguage(i18nLang);
    }
    
    // Update currency and date locale
    setCurrency(LOCATION_TO_CURRENCY[location]);
    setLocale(LOCATION_TO_DATE_LOCALE[location]);
    
    // Store preference
    setStoredLocalePreference(language, location, 'url');
  }, [parsedLocale, setCurrency, setLocale]);
  
  return <Outlet />;
}

export default LocaleRouteWrapper;
