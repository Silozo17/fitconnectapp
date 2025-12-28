/**
 * Centralized view restoration utility for native app cold starts.
 * This is the SINGLE SOURCE OF TRUTH for determining which dashboard view to restore.
 */

const STORAGE_KEY = "admin_active_role";
const ROUTE_STORAGE_KEY = "fitconnect_last_route";

export type ViewMode = "admin" | "coach" | "client";

export interface SavedViewState {
  type: ViewMode;
  profileId: string | null;
}

/**
 * Get the default dashboard route for a given role
 */
export const getDefaultDashboardForRole = (role: string | null): string => {
  switch (role) {
    case "admin":
    case "manager":
    case "staff":
      return "/dashboard/admin";
    case "coach":
      return "/dashboard/coach";
    default:
      return "/dashboard/client";
  }
};

/**
 * Check if a user with the given role can access a specific route
 */
export const validateRouteForRole = (route: string, role: string | null): boolean => {
  const isAdminUser = role === "admin" || role === "manager" || role === "staff";
  const isCoach = role === "coach";
  
  if (route.startsWith("/dashboard/admin")) {
    return isAdminUser;
  }
  if (route.startsWith("/dashboard/coach")) {
    return isAdminUser || isCoach;
  }
  if (route.startsWith("/dashboard/client")) {
    // Admins, coaches, and clients can all access client dashboard
    return true;
  }
  return false;
};

/**
 * Extract view mode from a dashboard route path
 */
export const getViewModeFromPath = (pathname: string): ViewMode | null => {
  const match = pathname.match(/^\/dashboard\/(admin|coach|client)/);
  return match ? (match[1] as ViewMode) : null;
};

/**
 * Get saved view state from localStorage
 */
export const getSavedViewState = (): SavedViewState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.type && ["admin", "coach", "client"].includes(parsed.type)) {
        return parsed as SavedViewState;
      }
    }
  } catch {
    // Invalid saved state
  }
  return null;
};

/**
 * Get the last saved route
 */
export const getSavedRoute = (): string | null => {
  try {
    return localStorage.getItem(ROUTE_STORAGE_KEY);
  } catch {
    return null;
  }
};

/**
 * Save view state to localStorage - call this IMMEDIATELY on view switch
 */
export const saveViewState = (type: ViewMode, profileId: string | null = null): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ type, profileId }));
  } catch {
    // Storage error
  }
};

/**
 * Save the current route for restoration
 */
export const saveRoute = (route: string): void => {
  try {
    if (route.startsWith("/dashboard")) {
      localStorage.setItem(ROUTE_STORAGE_KEY, route);
      
      // Also update view state from route for consistency
      const viewMode = getViewModeFromPath(route);
      if (viewMode) {
        const current = getSavedViewState();
        saveViewState(viewMode, current?.profileId || null);
      }
    }
  } catch {
    // Storage error
  }
};

/**
 * Clear all saved view state (call on logout)
 */
export const clearViewState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ROUTE_STORAGE_KEY);
  } catch {
    // Storage error
  }
};

/**
 * MAIN FUNCTION: Determine the correct route to restore for a user.
 * This considers saved state and validates against user permissions.
 * 
 * @returns The route to navigate to, or null if no restoration needed
 */
export const getRestoredRoute = (role: string | null): string | null => {
  // Priority 1: Check for saved last route (most specific)
  const savedRoute = getSavedRoute();
  if (savedRoute && validateRouteForRole(savedRoute, role)) {
    return savedRoute;
  }

  // Priority 2: Check for saved view preference
  const savedViewState = getSavedViewState();
  if (savedViewState) {
    const preferredRoute = `/dashboard/${savedViewState.type}`;
    if (validateRouteForRole(preferredRoute, role)) {
      return preferredRoute;
    }
  }

  // Priority 3: No valid saved state, return null (caller should use default)
  return null;
};

/**
 * Get the best route to use for an authenticated user.
 * Returns saved route if valid, otherwise returns role-based default.
 */
export const getBestDashboardRoute = (role: string | null): string => {
  const restoredRoute = getRestoredRoute(role);
  return restoredRoute || getDefaultDashboardForRole(role);
};
