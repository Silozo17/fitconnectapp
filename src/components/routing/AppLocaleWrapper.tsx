import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AppLocaleProvider } from '@/contexts/AppLocaleContext';
import PageLoadingSpinner from '@/components/shared/PageLoadingSpinner';

/**
 * AppLocaleWrapper is a layout route component for DASHBOARD and ONBOARDING routes.
 * Uses branded spinner for smooth transitions between dashboard pages.
 * 
 * IMPORTANT: This is for dashboard/onboarding routes ONLY.
 * For public website routes (docs, auth, subscribe), use WebsiteLocaleWrapper instead.
 * 
 * PERFORMANCE: Spinner provides instant visual feedback during lazy load.
 * Suspense boundary is REQUIRED for React.lazy() components to work.
 */
export function AppLocaleWrapper() {
  return (
    <AppLocaleProvider>
      <Suspense fallback={<PageLoadingSpinner />}>
        <Outlet />
      </Suspense>
    </AppLocaleProvider>
  );
}

export default AppLocaleWrapper;
