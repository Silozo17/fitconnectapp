import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocaleDetection } from '@/hooks/useLocaleDetection';
import { 
  buildLocalePath, 
  parseLocaleFromPath,
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
 * 2. URL (if already on locale route)
 * 3. Device/browser language (from navigator.language)
 * 4. Geo-location (IP-based detection)
 * 5. Default: en-gb
 */
export function LocaleRedirect({ preservePath = false }: LocaleRedirectProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasRedirected, setHasRedirected] = useState(false);
  
  const detection = useLocaleDetection(location.pathname);
  
  useEffect(() => {
    // Prevent infinite redirects
    if (hasRedirected) return;
    
    // Wait for detection to be ready (geo-detection complete or timeout)
    if (!detection.isReady) return;
    
    // If already on a locale route, don't redirect
    const currentParsed = parseLocaleFromPath(location.pathname);
    if (currentParsed.isLocaleRoute) {
      setHasRedirected(true);
      return;
    }
    
    const { locale, source } = detection;
    
    // Build the redirect path
    const targetPath = preservePath 
      ? location.pathname + location.search + location.hash
      : '/';
    
    const localePath = buildLocalePath(locale.language, locale.location, targetPath);
    
    // Store the preference if newly detected (not from stored)
    if (source !== 'stored') {
      setStoredLocalePreference(
        locale.language, 
        locale.location, 
        source === 'device' || source === 'url' ? 'manual' : 'geo'
      );
    }
    
    setHasRedirected(true);
    
    // Use replace to avoid adding to history
    navigate(localePath, { replace: true });
  }, [detection.isReady, detection.locale, detection.source, hasRedirected, navigate, location, preservePath]);
  
  // Show loading spinner while detecting
  return <PageLoadingSpinner />;
}
