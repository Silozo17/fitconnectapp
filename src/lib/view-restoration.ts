/**
 * Simplified view restoration utility
 * 
 * SINGLE SOURCE OF TRUTH for determining which dashboard view to restore.
 * Reduced from ~165 lines to ~60 lines.
 */

import { STORAGE_KEYS, getStorage, setStorage, removeStorage } from './storage-keys';

export type ViewMode = 'admin' | 'coach' | 'client';

interface ViewState {
  route: string;
  viewMode: ViewMode;
}

/**
 * Get the default dashboard route for a given role
 */
export function getDefaultDashboardForRole(role: string | null): string {
  switch (role) {
    case 'admin':
    case 'manager':
    case 'staff':
      return '/dashboard/admin';
    case 'coach':
      return '/dashboard/coach';
    default:
      return '/dashboard/client';
  }
}

/**
 * Check if a user with the given role can access a specific route
 */
export function validateRouteForRole(route: string, role: string | null): boolean {
  const isAdminUser = role === 'admin' || role === 'manager' || role === 'staff';
  const isCoach = role === 'coach';
  
  if (route.startsWith('/dashboard/admin')) return isAdminUser;
  if (route.startsWith('/dashboard/coach')) return isAdminUser || isCoach;
  if (route.startsWith('/dashboard/client')) return true;
  return false;
}

/**
 * Extract view mode from a dashboard route path
 */
export function getViewModeFromPath(pathname: string): ViewMode | null {
  const match = pathname.match(/^\/dashboard\/(admin|coach|client)/);
  return match ? (match[1] as ViewMode) : null;
}

/**
 * Save the current route for restoration
 */
export function saveRoute(route: string): void {
  if (!route.startsWith('/dashboard')) return;
  
  const viewMode = getViewModeFromPath(route);
  if (viewMode) {
    setStorage<ViewState>(STORAGE_KEYS.VIEW_STATE, { route, viewMode });
  }
}

/**
 * Get saved view state
 */
export function getSavedViewState(): ViewState | null {
  return getStorage<ViewState>(STORAGE_KEYS.VIEW_STATE);
}

/**
 * Get the best route to restore for an authenticated user
 * Returns saved route if valid, otherwise returns role-based default
 */
export function getBestDashboardRoute(role: string | null): string {
  const saved = getSavedViewState();
  
  if (saved?.route && validateRouteForRole(saved.route, role)) {
    return saved.route;
  }
  
  return getDefaultDashboardForRole(role);
}

/**
 * Clear all saved view state (call on logout)
 */
export function clearViewState(): void {
  removeStorage(STORAGE_KEYS.VIEW_STATE);
}

// Legacy exports for backward compatibility
export const getSavedRoute = (): string | null => getSavedViewState()?.route ?? null;
export const getRestoredRoute = (role: string | null): string | null => {
  const saved = getSavedViewState();
  if (saved?.route && validateRouteForRole(saved.route, role)) {
    return saved.route;
  }
  return null;
};
export const saveViewState = (type: ViewMode, profileId: string | null = null): void => {
  const existing = getSavedViewState();
  const route = existing?.route || `/dashboard/${type}`;
  setStorage<ViewState>(STORAGE_KEYS.VIEW_STATE, { route, viewMode: type });
};
