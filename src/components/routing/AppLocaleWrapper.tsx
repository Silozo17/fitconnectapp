import { Outlet } from 'react-router-dom';
import { AppLocaleProvider } from '@/contexts/AppLocaleContext';

/**
 * AppLocaleWrapper is a layout route component that provides AppLocaleProvider
 * to all app routes (dashboard, docs, onboarding, etc.) without locale URL logic.
 * Uses Outlet pattern to render nested route content.
 * 
 * PERFORMANCE: Suspense boundary REMOVED to eliminate spinner flash on navigation.
 * Each lazy page handles its own loading state via skeletons, not full-screen spinners.
 * This prevents the jarring "loading spinner on every navigation" pattern.
 */
export function AppLocaleWrapper() {
  return (
    <AppLocaleProvider>
      <Outlet />
    </AppLocaleProvider>
  );
}

export default AppLocaleWrapper;
