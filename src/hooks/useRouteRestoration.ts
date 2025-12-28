import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY = "fitconnect_last_route";
const VIEW_MODE_KEY = "fitconnect_last_view_mode";
const ADMIN_ROLE_KEY = "admin_active_role";

export const useRouteRestoration = () => {
  const location = useLocation();

  // Save current route on navigation (only dashboard routes)
  useEffect(() => {
    const pathname = location.pathname;
    
    // Only save dashboard routes for restoration
    if (pathname.startsWith("/dashboard")) {
      try {
        localStorage.setItem(STORAGE_KEY, pathname);
        
        // Also save the view mode separately for redundancy
        const viewMode = pathname.match(/^\/dashboard\/(admin|coach|client)/)?.[1];
        if (viewMode) {
          localStorage.setItem(VIEW_MODE_KEY, viewMode);
          
          // Keep admin_active_role in sync as well
          const currentAdminRole = localStorage.getItem(ADMIN_ROLE_KEY);
          try {
            const parsed = currentAdminRole ? JSON.parse(currentAdminRole) : {};
            if (parsed.type !== viewMode) {
              localStorage.setItem(ADMIN_ROLE_KEY, JSON.stringify({ 
                type: viewMode, 
                profileId: parsed.profileId || null 
              }));
            }
          } catch {
            localStorage.setItem(ADMIN_ROLE_KEY, JSON.stringify({ type: viewMode, profileId: null }));
          }
        }
      } catch {
        // Ignore storage errors (e.g., private browsing)
      }
    }
  }, [location.pathname]);
};

export const getLastRoute = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const getLastViewMode = (): string | null => {
  try {
    return localStorage.getItem(VIEW_MODE_KEY);
  } catch {
    return null;
  }
};

export const clearLastRoute = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VIEW_MODE_KEY);
  } catch {
    // Ignore storage errors
  }
};
