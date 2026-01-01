import { useEffect } from 'react';
import { isDespia, isDespiaIOS, configureStatusBar } from '@/lib/despia';
import { initNativeCache } from '@/lib/native-cache';

/**
 * Hook to initialize Despia-specific configuration on app start
 * Configures Android status bar with dark background
 * Initializes native cache system for cold start optimization
 * Adds native-ios class for CSS safe area fallbacks
 * Runs once when the app mounts in Despia environment
 */
export const useAppInitialization = () => {
  useEffect(() => {
    if (!isDespia()) return;
    
    // Initialize native cache system (checks version, clears if stale)
    initNativeCache();
    
    // Configure status bar for Android (dark background, white text)
    configureStatusBar();
    
    // Add native-ios class for CSS safe area fallbacks
    // This triggers the 47px minimum padding for headers in Despia on iOS
    // where env(safe-area-inset-top) may return 0
    if (isDespiaIOS()) {
      document.documentElement.classList.add('native-ios');
    }
    
    return () => {
      document.documentElement.classList.remove('native-ios');
    };
  }, []);
};
