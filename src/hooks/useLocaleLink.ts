import { useCallback } from 'react';
import { useOptionalLocaleRouting } from '@/contexts/LocaleRoutingContext';
import { buildLocalePath, DEFAULT_ROUTE_LOCALE } from '@/lib/locale-routing';

interface UseLocaleLinkReturn {
  /**
   * Wrap a path with the current locale prefix
   * Returns the original path if not in a locale routing context
   */
  localePath: (path: string) => string;
  
  /**
   * Whether locale routing is active
   */
  isLocaleRoutingActive: boolean;
}

/**
 * Hook to help with locale-prefixed links.
 * Safe to use outside of LocaleRoutingProvider (will return original paths).
 */
// Protected paths that should never have locale prefixes
const PROTECTED_PATHS = ['/dashboard', '/onboarding', '/docs', '/auth', '/subscribe'];

function isProtectedPath(path: string): boolean {
  return PROTECTED_PATHS.some(protectedPath => 
    path === protectedPath || path.startsWith(`${protectedPath}/`)
  );
}

export function useLocaleLink(): UseLocaleLinkReturn {
  const localeRouting = useOptionalLocaleRouting();
  
  const localePath = useCallback((path: string): string => {
    // Never prefix protected paths (dashboard, onboarding, etc.)
    if (isProtectedPath(path)) {
      return path;
    }
    
    // If locale routing is active and we're on a locale route, prefix the path
    if (localeRouting?.isLocaleRoute) {
      return localeRouting.buildLocalePath(path);
    }
    // Otherwise, return the path as-is
    return path;
  }, [localeRouting]);
  
  return {
    localePath,
    isLocaleRoutingActive: !!localeRouting?.isLocaleRoute,
  };
}

/**
 * Utility function to build locale path without hook (for use outside React)
 * Uses default locale if no preference stored
 */
export function buildLocalePathStatic(path: string): string {
  return buildLocalePath(DEFAULT_ROUTE_LOCALE.language, DEFAULT_ROUTE_LOCALE.location, path);
}
