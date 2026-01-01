import { useEffect } from 'react';
import { isDespia, configureStatusBar } from '@/lib/despia';
import { initNativeCache } from '@/lib/native-cache';

/**
 * Hook to initialize Despia-specific configuration on app start
 * Configures Android status bar with dark background
 * Initializes native cache system for cold start optimization
 * Runs once when the app mounts in Despia environment
 */
export const useAppInitialization = () => {
  useEffect(() => {
    if (!isDespia()) return;
    
    // Initialize native cache system (checks version, clears if stale)
    initNativeCache();
    
    // Configure status bar for Android (dark background, white text)
    configureStatusBar();
  }, []);
};
