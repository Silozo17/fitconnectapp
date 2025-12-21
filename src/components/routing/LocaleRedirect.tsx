import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDefaultLocale } from '@/hooks/useDefaultLocale';
import { 
  buildLocalePath, 
  getStoredLocalePreference,
  setStoredLocalePreference,
} from '@/lib/locale-routing';
import PageLoadingSpinner from '@/components/shared/PageLoadingSpinner';

interface LocaleRedirectProps {
  /**
   * If true, will redirect to locale-prefixed version of current path
   * If false, will redirect to locale-prefixed home page
   */
  preservePath?: boolean;
}

/**
 * Component that redirects bare routes (e.g., "/") to locale-prefixed routes (e.g., "/en-gb")
 * 
 * Priority order:
 * 1. Stored preference (from previous visits or manual selection)
 * 2. Device/browser language (from navigator.language)
 * 3. Geo-location (IP-based detection)
 * 4. Default: en-gb
 */
export function LocaleRedirect({ preservePath = false }: LocaleRedirectProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { defaultLocale, isLoading, deviceLanguageUsed } = useDefaultLocale();
  
  useEffect(() => {
    // Wait for geo-detection to complete (but don't block forever)
    if (isLoading) return;
    
    // Priority 1: Check for stored preference first
    const stored = getStoredLocalePreference();
    
    let locale: { language: typeof defaultLocale.language; location: typeof defaultLocale.location };
    
    if (stored) {
      // Use stored preference
      locale = { language: stored.language, location: stored.location };
    } else {
      // Use detected locale (device language or geo)
      locale = defaultLocale;
      
      // Store the detected locale for future visits
      setStoredLocalePreference(locale.language, locale.location, deviceLanguageUsed ? 'manual' : 'geo');
    }
    
    // Build the redirect path
    const targetPath = preservePath 
      ? location.pathname + location.search + location.hash
      : '/';
    
    const localePath = buildLocalePath(locale.language, locale.location, targetPath);
    
    // Use replace to avoid adding to history
    navigate(localePath, { replace: true });
  }, [isLoading, defaultLocale, deviceLanguageUsed, navigate, location, preservePath]);
  
  // Show loading spinner while detecting
  return <PageLoadingSpinner />;
}
