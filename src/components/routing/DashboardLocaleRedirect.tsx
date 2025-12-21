import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Redirects locale-prefixed protected URLs to plain URLs
 * e.g., /en-gb/dashboard/client → /dashboard/client
 * e.g., /pl-pl/onboarding/client → /onboarding/client
 */
export function DashboardLocaleRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Extract the protected path from the URL (remove locale prefix)
    // Pattern: /xx-yy/protected/... → /protected/...
    const match = location.pathname.match(/^\/[a-z]{2}-[a-z]{2}(\/(?:dashboard|onboarding|docs|auth|subscribe).*)$/);
    
    if (match) {
      const targetPath = match[1] + location.search + location.hash;
      navigate(targetPath, { replace: true });
    } else {
      // Fallback to dashboard if pattern doesn't match
      navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, location.search, location.hash, navigate]);
  
  return null;
}
