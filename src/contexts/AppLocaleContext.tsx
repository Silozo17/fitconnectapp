import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLocale } from './LocaleContext';
import { useUserLocalePreference } from '@/hooks/useUserLocalePreference';
import {
  RouteLanguageCode,
  RouteLocationCode,
  LOCATION_TO_CURRENCY,
  LOCATION_TO_DATE_LOCALE,
  LANGUAGE_TO_I18N,
} from '@/lib/locale-routing';
import i18n from '@/i18n';

interface AppLocaleContextType {
  language: RouteLanguageCode;
  location: RouteLocationCode;
  isLoading: boolean;
}

const AppLocaleContext = createContext<AppLocaleContextType | undefined>(undefined);

interface AppLocaleProviderProps {
  children: ReactNode;
}

/**
 * Locale provider for app routes (dashboard, onboarding, etc.)
 * Uses DB-backed preferences for authenticated users.
 * No URL involvement - preferences are stored in user_profiles table.
 */
export function AppLocaleProvider({ children }: AppLocaleProviderProps) {
  const { setCurrency, setLocale } = useLocale();
  const userLocale = useUserLocalePreference();
  
  const language = userLocale.languagePreference;
  const location = userLocale.countryPreference;
  
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
    isLoading: userLocale.isLoading,
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
