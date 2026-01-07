import { Suspense, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { AppLocaleProvider } from '@/contexts/AppLocaleContext';
import PageLoadingSpinner from '@/components/shared/PageLoadingSpinner';

interface WebsiteLocaleWrapperProps {
  children?: ReactNode;
}

/**
 * WebsiteLocaleWrapper is a layout component for public website routes
 * (docs, auth, subscribe) that need locale context but should use a simple
 * spinner fallback instead of dashboard skeletons.
 * 
 * Can be used either as:
 * 1. Layout route with Outlet (no children prop)
 * 2. Direct wrapper with children prop
 * 
 * IMPORTANT: This wrapper is for PUBLIC pages - NOT dashboard/onboarding.
 * Dashboard routes use AppLocaleWrapper which has DashboardSkeleton fallback.
 */
export function WebsiteLocaleWrapper({ children }: WebsiteLocaleWrapperProps) {
  return (
    <AppLocaleProvider>
      {children ? (
        children
      ) : (
        <Suspense fallback={<PageLoadingSpinner />}>
          <Outlet />
        </Suspense>
      )}
    </AppLocaleProvider>
  );
}

export default WebsiteLocaleWrapper;
