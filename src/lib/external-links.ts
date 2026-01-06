import { isDespia } from '@/lib/despia';

/**
 * Opens a URL in an external browser
 * On native apps (Despia), this opens in Safari/Chrome
 * On web, this opens in a new tab
 */
export const openExternalUrl = (url: string): void => {
  // For both native and web, window.open with _blank works correctly
  // Despia intercepts this and opens in the device's default browser
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Opens a legal page (terms, privacy, eula) in an external browser
 * Builds the full URL using the current origin for native apps
 */
export const openLegalPage = (page: 'terms' | 'privacy' | 'eula'): void => {
  const paths: Record<string, string> = {
    terms: '/terms',
    privacy: '/privacy',
    eula: '/eula',
  };
  
  const path = paths[page];
  const fullUrl = `${window.location.origin}${path}`;
  openExternalUrl(fullUrl);
};

/**
 * Determines if a link should open externally based on environment
 * Returns true for native apps where legal links must open in external browser
 */
export const shouldOpenExternally = (): boolean => {
  return isDespia();
};
