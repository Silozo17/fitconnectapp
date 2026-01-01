import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AppLocaleProvider } from '@/contexts/AppLocaleContext';
import PageLoadingSpinner from '@/components/shared/PageLoadingSpinner';

/**
 * WebsiteLocaleWrapper is a layout route component for public website routes
 * (docs, auth, subscribe) that need locale context but should use a simple
 * spinner fallback instead of dashboard skeletons.
 * 
 * IMPORTANT: This wrapper is for PUBLIC pages - NOT dashboard/onboarding.
 * Dashboard routes use AppLocaleWrapper which has DashboardSkeleton fallback.
 */
export function WebsiteLocaleWrapper() {
  return (
    <AppLocaleProvider>
      <Suspense fallback={<PageLoadingSpinner />}>
        <Outlet />
      </Suspense>
    </AppLocaleProvider>
  );
}

export default WebsiteLocaleWrapper;
