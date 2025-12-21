import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLocale } from './LocaleContext';
import {
  RouteLanguageCode,
  RouteLocationCode,
  DEFAULT_ROUTE_LOCALE,
  LOCATION_TO_CURRENCY,
  LOCATION_TO_DATE_LOCALE,
  LANGUAGE_TO_I18N,
  getStoredLocalePreference,
} from '@/lib/locale-routing';
import i18n from '@/i18n';

interface AppLocaleContextType {
  language: RouteLanguageCode;
  location: RouteLocationCode;
}

const AppLocaleContext = createContext<AppLocaleContextType | undefined>(undefined);

interface AppLocaleProviderProps {
  children: ReactNode;
}

/**
 * Simplified locale provider for app routes (dashboard, onboarding, etc.)
 * Reads language/location ONLY from stored preferences - no URL involvement.
 * This ensures dashboard routes never read or write locale to URLs.
 */
export function AppLocaleProvider({ children }: AppLocaleProviderProps) {
  const { setCurrency, setLocale } = useLocale();
  
  // Read from storage only - no URL involvement
  const stored = getStoredLocalePreference();
  const language = stored?.language ?? DEFAULT_ROUTE_LOCALE.language;
  const location = stored?.location ?? DEFAULT_ROUTE_LOCALE.location;
  
  // Sync currency and date locale when location changes
  useEffect(() => {
    const currency = LOCATION_TO_CURRENCY[location];
    const dateLocale = LOCATION_TO_DATE_LOCALE[location];
    
    setCurrency(currency);
    setLocale(dateLocale);
  }, [location, setCurrency, setLocale]);
  
  // Sync i18n language when language changes
  useEffect(() => {
    const i18nLang = LANGUAGE_TO_I18N[language];
    if (i18n.language !== i18nLang) {
      i18n.changeLanguage(i18nLang);
    }
  }, [language]);
  
  const value: AppLocaleContextType = {
    language,
    location,
  };
  
  return (
    <AppLocaleContext.Provider value={value}>
      {children}
    </AppLocaleContext.Provider>
  );
}

export function useAppLocale(): AppLocaleContextType {
  const context = useContext(AppLocaleContext);
  if (context === undefined) {
    throw new Error('useAppLocale must be used within an AppLocaleProvider');
  }
  return context;
}

/**
 * Optional hook that returns null if not inside provider
 */
export function useOptionalAppLocale(): AppLocaleContextType | null {
  const context = useContext(AppLocaleContext);
  return context ?? null;
}
