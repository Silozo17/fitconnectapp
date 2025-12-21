import { useEffect } from 'react';
import { isDespia } from '@/lib/despia';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to handle Despia-specific app lifecycle events for auth persistence.
 * Ensures auth session is revalidated when the app regains focus.
 */
export const useDespiaAuthPersistence = () => {
  useEffect(() => {
    if (!isDespia()) return;

    const handleFocus = () => {
      // App regained focus - start auto refresh and revalidate session
      supabase.auth.startAutoRefresh();
      supabase.auth.getSession();
    };

    const handleBlur = () => {
      // App lost focus - stop auto refresh to save resources
      supabase.auth.stopAutoRefresh();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);
};
