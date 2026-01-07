import { Suspense, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { AppLocaleProvider } from '@/contexts/AppLocaleContext';
import PageLoadingSpinner from '@/components/shared/PageLoadingSpinner';

interface AppLocaleWrapperProps {
  children?: ReactNode;
}

/**
 * AppLocaleWrapper is a layout component for DASHBOARD and ONBOARDING routes.
 * Uses branded spinner for smooth transitions between dashboard pages.
 * 
 * Can be used either as:
 * 1. Layout route with Outlet (no children prop)
 * 2. Direct wrapper with children prop
 * 
 * IMPORTANT: This is for dashboard/onboarding routes ONLY.
 * For public website routes (docs, auth, subscribe), use WebsiteLocaleWrapper instead.
 * 
 * PERFORMANCE: Spinner provides instant visual feedback during lazy load.
 * Suspense boundary is REQUIRED for React.lazy() components to work.
 */
export function AppLocaleWrapper({ children }: AppLocaleWrapperProps) {
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

export default AppLocaleWrapper;
