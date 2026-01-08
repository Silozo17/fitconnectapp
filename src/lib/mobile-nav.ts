/**
 * Mobile navigation utilities for cross-layout communication.
 * Allows any component (e.g., ViewSwitcher) to request the mobile sidebar to close
 * without prop drilling through multiple layout layers.
 */

export const MOBILE_NAV_CLOSE_EVENT = 'fitconnect:close-mobile-nav';

/**
 * Dispatches an event to request closing the mobile navigation drawer.
 * Layout components (AdminLayout, DashboardLayout, ClientDashboardLayout) listen
 * for this event and close their mobile sidebars immediately.
 */
export function requestCloseMobileNav(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(MOBILE_NAV_CLOSE_EVENT));
  }
}
