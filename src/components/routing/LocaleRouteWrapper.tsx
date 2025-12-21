import { Outlet, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
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
  const [isI18nReady, setIsI18nReady] = useState(false);
  
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
  
  // Apply locale settings when valid - wait for i18n to be ready
  useEffect(() => {
    // Reset ready state at the start of the effect
    setIsI18nReady(false);
    
    if (!parsedLocale) {
      setIsI18nReady(true);
      return;
    }
    
    const { language, location } = parsedLocale;
    
    // Update i18n language and wait for it to complete
    const i18nLang = LANGUAGE_TO_I18N[language];
    
    const updateLanguage = async () => {
      if (i18n.language !== i18nLang) {
        await i18n.changeLanguage(i18nLang);
      }
      setIsI18nReady(true);
    };
    
    updateLanguage();
    
    // Update currency and date locale
    setCurrency(LOCATION_TO_CURRENCY[location]);
    setLocale(LOCATION_TO_DATE_LOCALE[location]);
    
    // Store preference with 'url' source
    setStoredLocalePreference(language, location, 'url');
  }, [parsedLocale, setCurrency, setLocale]);
  
  // Don't render children until i18n is ready
  if (!isI18nReady) {
    return null;
  }
  
  return <Outlet />;
}

export default LocaleRouteWrapper;
