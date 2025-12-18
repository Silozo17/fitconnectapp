import { usePlatformSettings } from "@/hooks/useAdminData";

const FALLBACK_URL = "https://getfitconnect.co.uk";

export function usePlatformUrl() {
  const { data: settings } = usePlatformSettings();
  
  // Remove trailing slash if present
  const siteUrl = ((settings?.site_url as string) || FALLBACK_URL).replace(/\/$/, '');
  
  return {
    siteUrl,
    getAbsoluteUrl: (path: string) => `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`,
  };
}

// For non-hook contexts (like SEO schema helpers)
export const DEFAULT_SITE_URL = FALLBACK_URL;
