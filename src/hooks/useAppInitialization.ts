import { useEffect } from 'react';
import { isDespia, configureStatusBar } from '@/lib/despia';
import { useDespiaAuthPersistence } from './useDespiaAuthPersistence';

/**
 * Hook to initialize Despia-specific configuration on app start
 * Configures Android status bar with dark background
 * Handles auth persistence for Despia app lifecycle
 * Runs once when the app mounts in Despia environment
 */
export const useAppInitialization = () => {
  // Handle Despia-specific auth persistence
  useDespiaAuthPersistence();

  useEffect(() => {
    if (!isDespia()) return;
    
    // Configure status bar for Android (dark background, white text)
    configureStatusBar();
  }, []);
};
