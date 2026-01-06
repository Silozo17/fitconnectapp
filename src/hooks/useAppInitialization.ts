import { useEffect } from 'react';
import { isDespia, isDespiaIOS, isDespiaAndroid, configureStatusBar } from '@/lib/despia';
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
    // Exit early if not in Despia environment
    if (!isDespia()) return;
    
    // Use requestAnimationFrame to ensure DOM is fully ready
    // This prevents race conditions with native WebView initialization
    requestAnimationFrame(() => {
      try {
        console.log('[Despia] App initialization started', {
          isIOS: isDespiaIOS(),
          isAndroid: isDespiaAndroid(),
          userAgent: navigator.userAgent
        });
        
        // Initialize native cache system first (safe, no native commands)
        initNativeCache();
        
        // Configure status bar for Android (now has internal delay + error handling)
        // This is safe to call - it handles timing internally
        configureStatusBar();
        
        // Add native-ios class for CSS safe area fallbacks
        // This triggers the 47px minimum padding for headers in Despia on iOS
        // where env(safe-area-inset-top) may return 0
        if (isDespiaIOS()) {
          document.documentElement.classList.add('native-ios');
        }
        
        // Platform-specific completion logging
        if (isDespiaAndroid()) {
          console.log('[Despia Android] Initialization complete');
        } else if (isDespiaIOS()) {
          console.log('[Despia iOS] Initialization complete');
        }
      } catch (e) {
        // Non-fatal: log error but don't crash the app
        console.error('[Despia] Initialization error (non-fatal):', e);
      }
    });
    
    return () => {
      document.documentElement.classList.remove('native-ios');
    };
  }, []);
};
