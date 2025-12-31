import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AppLocaleProvider } from '@/contexts/AppLocaleContext';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

/**
 * AppLocaleWrapper is a layout route component that provides AppLocaleProvider
 * to all app routes (dashboard, docs, onboarding, etc.) without locale URL logic.
 * 
 * PERFORMANCE: Uses DashboardSkeleton instead of spinner for smoother UX.
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
