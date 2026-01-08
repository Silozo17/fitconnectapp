import { Outlet, useParams, Navigate, useLocation } from 'react-router-dom';
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
 * Parses /:locale param (e.g., "gb-en") and sets language/location contexts.
 * Format: /{location}-{language}/ where location = country, language = i18n
 */
export function LocaleRouteWrapper() {
  const { locale, '*': wildcardPath } = useParams<{ locale: string; '*': string }>();
  const location = useLocation();
  const { setCurrency, setLocale } = useLocale();
  const [isI18nReady, setIsI18nReady] = useState(false);
  
  // Parse the locale param (e.g., "gb-en" -> { loc: "gb", lang: "en" })
  const parsedLocale = useMemo(() => {
    if (!locale) return null;
    
    const match = locale.match(/^([a-z]{2})-([a-z]{2})$/);
    if (!match) return null;
    
    const [, loc, lang] = match; // Location first, then language
    if (!isValidLanguage(lang) || !isValidLocation(loc)) return null;
    
    return {
      language: lang as RouteLanguageCode,
      location: loc as RouteLocationCode,
    };
  }, [locale]);
  
  // If locale param is invalid (e.g., "coaches" matched as :locale), redirect to the path without locale
  // This is a safeguard - primary fix is route ordering in WebsiteRouter
  if (!parsedLocale && locale) {
    // Build the redirect path: remove the invalid locale prefix
    const remainingPath = wildcardPath ? `/${wildcardPath}` : '/';
    return <Navigate to={remainingPath + location.search + location.hash} replace />;
  }
  
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
