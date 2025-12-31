import { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AppLocaleProvider } from '@/contexts/AppLocaleContext';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { perfLogger } from '@/lib/performance-logger';

/**
 * AppLocaleWrapper is a layout route component that provides AppLocaleProvider
 * to all app routes (dashboard, docs, onboarding, etc.) without locale URL logic.
 * 
 * PERFORMANCE: Uses DashboardSkeleton instead of spinner for smoother UX.
 * Suspense boundary is REQUIRED for React.lazy() components to work.
 */
export function AppLocaleWrapper() {
  useEffect(() => {
    perfLogger.logEvent('app_locale_wrapper_mount');
  }, []);

  return (
    <AppLocaleProvider>
      <Suspense fallback={<SuspenseFallback />}>
        <Outlet />
      </Suspense>
    </AppLocaleProvider>
  );
}

function SuspenseFallback() {
  useEffect(() => {
    perfLogger.logEvent('app_locale_suspense_fallback_shown');
  }, []);
  
  return <DashboardSkeleton />;
}

export default AppLocaleWrapper;
