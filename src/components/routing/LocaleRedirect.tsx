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
 * Uses stored preference first, then geo-detection, then defaults to en-gb.
 */
export function LocaleRedirect({ preservePath = false }: LocaleRedirectProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { defaultLocale, isLoading } = useDefaultLocale();
  
  useEffect(() => {
    // Wait for geo-detection to complete (but don't block forever)
    if (isLoading) return;
    
    // Check for stored preference first
    const stored = getStoredLocalePreference();
    const locale = stored || defaultLocale;
    
    // If using geo-detected locale, store it
    if (!stored) {
      setStoredLocalePreference(locale.language, locale.location, 'geo');
    }
    
    // Build the redirect path
    const targetPath = preservePath 
      ? location.pathname + location.search + location.hash
      : '/';
    
    const localePath = buildLocalePath(locale.language, locale.location, targetPath);
    
    // Use replace to avoid adding to history
    navigate(localePath, { replace: true });
  }, [isLoading, defaultLocale, navigate, location, preservePath]);
  
  // Show loading spinner while detecting
  return <PageLoadingSpinner />;
}
