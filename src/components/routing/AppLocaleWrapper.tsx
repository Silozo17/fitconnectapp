import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AppLocaleProvider } from '@/contexts/AppLocaleContext';
import PageLoadingSpinner from '@/components/shared/PageLoadingSpinner';

/**
 * AppLocaleWrapper is a layout route component that provides AppLocaleProvider
 * to all app routes (dashboard, docs, onboarding, etc.) without locale URL logic.
 * Uses Outlet pattern to render nested route content.
 * 
 * IMPORTANT: Suspense boundary is REQUIRED here because dashboard routes use
 * lazy-loaded components and don't go through WebsiteRouter's Suspense.
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
