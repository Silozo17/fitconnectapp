import { useEffect } from "react";

/**
 * Minimal Zoom OAuth redirect page.
 * 
 * This page receives the OAuth callback from Zoom on the verified domain
 * (getfitconnect.co.uk) and immediately redirects to the Supabase edge
 * function that handles the actual token exchange.
 * 
 * Requirements:
 * - No state
 * - No data fetching
 * - No conditional rendering
 * - Single redirect on mount
 */
export default function ZoomOAuth() {
  useEffect(() => {
    const targetUrl = `https://ntgfihgneyoxxbwmtceq.supabase.co/functions/v1/video-oauth-callback${window.location.search}`;
    window.location.replace(targetUrl);
  }, []);

  return null;
}
