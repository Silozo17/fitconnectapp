import { Outlet } from 'react-router-dom';
import { AppLocaleProvider } from '@/contexts/AppLocaleContext';

/**
 * AppLocaleWrapper is a layout route component that provides AppLocaleProvider
 * to all app routes (dashboard, docs, onboarding, etc.) without locale URL logic.
 * Uses Outlet pattern to render nested route content.
 * 
 * PERFORMANCE FIX: Removed redundant Suspense wrapper since parent WebsiteRouter
 * already has a Suspense boundary. This reduces the cascade of loading states.
 */
export function AppLocaleWrapper() {
  return (
    <AppLocaleProvider>
      <Outlet />
    </AppLocaleProvider>
  );
}

export default AppLocaleWrapper;
