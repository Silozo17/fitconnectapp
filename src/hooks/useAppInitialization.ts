import { useEffect } from 'react';
import { isDespia, configureStatusBar } from '@/lib/despia';

/**
 * Hook to initialize Despia-specific configuration on app start
 * Configures Android status bar with dark background
 * Runs once when the app mounts in Despia environment
 */
export const useAppInitialization = () => {
  useEffect(() => {
    if (!isDespia()) return;
    
    // Configure status bar for Android (dark background, white text)
    configureStatusBar();
  }, []);
};
