import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLocale } from './LocaleContext';
import {
  RouteLanguageCode,
  RouteLocationCode,
  DEFAULT_ROUTE_LOCALE,
  parseLocaleFromPath,
  buildLocalePath as buildLocalePathUtil,
  formatLocaleString,
  isDefaultLocale as checkIsDefaultLocale,
  LOCATION_TO_CURRENCY,
  LOCATION_TO_DATE_LOCALE,
  LANGUAGE_TO_I18N,
  setStoredLocalePreference,
  getStoredLocalePreference,
} from '@/lib/locale-routing';
import i18n from '@/i18n';

interface LocaleRoutingContextType {
  // Current parsed locale from URL
  language: RouteLanguageCode;
  location: RouteLocationCode;
  
  // Locale string (e.g., "en-gb")
  localeString: string;
  
  // Whether this is the default locale
  isDefaultLocale: boolean;
  
  // Whether the current route has a locale prefix
  isLocaleRoute: boolean;
  
  // Navigation helpers
  buildLocalePath: (path: string) => string;
  changeLanguage: (lang: RouteLanguageCode) => void;
  changeLocation: (loc: RouteLocationCode) => void;
  
  // Get path without locale prefix (for internal routing)
  getPathWithoutLocale: () => string;
}

const LocaleRoutingContext = createContext<LocaleRoutingContextType | undefined>(undefined);

interface LocaleRoutingProviderProps {
  children: ReactNode;
}

export function LocaleRoutingProvider({ children }: LocaleRoutingProviderProps) {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const { setCurrency, setLocale } = useLocale();
  
  // Initialize from stored preference synchronously to prevent flicker
  const initialLocale = useMemo(() => {
    const stored = getStoredLocalePreference();
    if (stored) {
      return { language: stored.language, location: stored.location };
    }
    // Fall back to URL parsing
    const parsed = parseLocaleFromPath(routerLocation.pathname);
    return { language: parsed.language, location: parsed.location };
  }, []);
  
  // Parse locale from current URL
  const parsed = useMemo(() => {
    return parseLocaleFromPath(routerLocation.pathname);
  }, [routerLocation.pathname]);
  
  const [language, setLanguage] = useState<RouteLanguageCode>(initialLocale.language);
  const [location, setLocation] = useState<RouteLocationCode>(initialLocale.location);
  const [isLocaleRoute, setIsLocaleRoute] = useState(parsed.isLocaleRoute);
  
  // Update state when URL changes
  useEffect(() => {
    const newParsed = parseLocaleFromPath(routerLocation.pathname);
    
    if (newParsed.isLocaleRoute) {
      setLanguage(newParsed.language);
      setLocation(newParsed.location);
      setIsLocaleRoute(true);
      
      // Store the preference from URL
      setStoredLocalePreference(newParsed.language, newParsed.location, 'url');
    } else {
      // Not a locale route - check stored preference
      const stored = getStoredLocalePreference();
      if (stored) {
        setLanguage(stored.language);
        setLocation(stored.location);
      } else {
        setLanguage(DEFAULT_ROUTE_LOCALE.language);
        setLocation(DEFAULT_ROUTE_LOCALE.location);
      }
      setIsLocaleRoute(false);
    }
  }, [routerLocation.pathname]);
  
  // Sync currency and date locale when location changes
  useEffect(() => {
    const currency = LOCATION_TO_CURRENCY[location];
    const dateLocale = LOCATION_TO_DATE_LOCALE[location];
    
    setCurrency(currency);
    setLocale(dateLocale);
  }, [location, setCurrency, setLocale]);
  
  // Sync i18n language when language changes (load Polish on demand)
  useEffect(() => {
    const syncLanguage = async () => {
      const i18nLang = LANGUAGE_TO_I18N[language];
      if (i18n.language !== i18nLang) {
        // Load Polish translations on demand if switching to Polish
        if (i18nLang === 'pl') {
          const { loadPolishTranslations } = await import('@/i18n');
          await loadPolishTranslations();
        }
        i18n.changeLanguage(i18nLang);
      }
    };
    syncLanguage();
  }, [language]);
  
  const localeString = useMemo(() => {
    return formatLocaleString(language, location);
  }, [language, location]);
  
  const isDefaultLocale = useMemo(() => {
    return checkIsDefaultLocale(language, location);
  }, [language, location]);
  
  const buildLocalePath = useCallback((path: string) => {
    return buildLocalePathUtil(language, location, path);
  }, [language, location]);
  
  const getPathWithoutLocale = useCallback(() => {
    const parsed = parseLocaleFromPath(routerLocation.pathname);
    return parsed.restOfPath;
  }, [routerLocation.pathname]);
  
  const changeLanguage = useCallback((newLang: RouteLanguageCode) => {
    if (newLang === language) return;
    
    // Get current path without locale prefix
    const currentPath = getPathWithoutLocale();
    
    // Always navigate to locale-prefixed URL when language is changed
    const newPath = buildLocalePathUtil(newLang, location, currentPath);
    
    // Store as manual selection (takes priority over geo-detection)
    setStoredLocalePreference(newLang, location, 'manual');
    
    // Update local state immediately
    setLanguage(newLang);
    
    navigate(newPath, { replace: true });
  }, [language, location, getPathWithoutLocale, navigate]);
  
  const changeLocation = useCallback((newLoc: RouteLocationCode) => {
    if (newLoc === location) return;
    
    // Get current path without locale prefix
    const currentPath = getPathWithoutLocale();
    
    // Always navigate to locale-prefixed URL when location is changed
    const newPath = buildLocalePathUtil(language, newLoc, currentPath);
    
    // Store as manual selection (takes priority over geo-detection)
    setStoredLocalePreference(language, newLoc, 'manual');
    
    // Update local state immediately
    setLocation(newLoc);
    
    navigate(newPath, { replace: true });
  }, [language, location, getPathWithoutLocale, navigate]);
  
  const value: LocaleRoutingContextType = {
    language,
    location,
    localeString,
    isDefaultLocale,
    isLocaleRoute,
    buildLocalePath,
    changeLanguage,
    changeLocation,
    getPathWithoutLocale,
  };
  
  return (
    <LocaleRoutingContext.Provider value={value}>
      {children}
    </LocaleRoutingContext.Provider>
  );
}

export function useLocaleRouting(): LocaleRoutingContextType {
  const context = useContext(LocaleRoutingContext);
  if (context === undefined) {
    throw new Error('useLocaleRouting must be used within a LocaleRoutingProvider');
  }
  return context;
}

/**
 * Optional hook that returns null if not inside provider
 * Useful for components that may or may not be in locale routing context
 */
export function useOptionalLocaleRouting(): LocaleRoutingContextType | null {
  const context = useContext(LocaleRoutingContext);
  return context ?? null;
}
