import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AppLocaleProvider } from '@/contexts/AppLocaleContext';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

/**
 * AppLocaleWrapper is a layout route component for DASHBOARD and ONBOARDING routes.
 * Uses DashboardSkeleton as fallback for smooth transitions between dashboard pages.
 * 
 * IMPORTANT: This is for dashboard/onboarding routes ONLY.
 * For public website routes (docs, auth, subscribe), use WebsiteLocaleWrapper instead.
 * 
 * PERFORMANCE: DashboardSkeleton matches the dashboard layout to prevent jarring shifts.
 * Suspense boundary is REQUIRED for React.lazy() components to work.
 */
export function AppLocaleWrapper() {
  return (
    <AppLocaleProvider>
      <Suspense fallback={<DashboardSkeleton />}>
        <Outlet />
      </Suspense>
    </AppLocaleProvider>
  );
}

export default AppLocaleWrapper;
