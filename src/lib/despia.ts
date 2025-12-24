/**
 * Despia Native Runtime Setup
 * 
 * This module provides environment detection and access to the Despia native runtime.
 * Only invoke native features when running inside the Despia environment.
 */

import despia from 'despia-native';

/**
 * Check if the app is running inside the Despia native environment
 * Uses multiple fallback detection methods for reliability
 */
export const isDespia = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  
  // Method 1: User agent check (primary)
  const hasUserAgent = navigator.userAgent.toLowerCase().includes('despia');
  
  // Method 2: Check for Despia runtime functions on window
  const hasRuntimeFunctions = typeof (window as any).onBioAuthSuccess === 'function' ||
                              typeof (window as any).iapSuccess === 'function' ||
                              typeof (window as any).onHealthKitSuccess === 'function';
  
  // Method 3: Check for despia-native SDK marker
  const hasSDKMarker = !!(window as any).__DESPIA__;
  
  // Method 4: Check if the despia function is callable (from imported module)
  const hasDespiaFunction = typeof despia === 'function';
  
  return hasUserAgent || hasRuntimeFunctions || hasSDKMarker || hasDespiaFunction;
};

/**
 * Get the Despia runtime instance (only use when isDespia() returns true)
 */
export const getDespiaRuntime = () => {
  if (!isDespia()) {
    console.warn('Despia runtime accessed outside of Despia environment');
    return null;
  }
  return despia;
};

/**
 * Safe wrapper to execute Despia-only code
 * @param callback Function to execute if in Despia environment
 * @param fallback Optional fallback for non-Despia environments
 */
export const withDespia = <T>(
  callback: (runtime: typeof despia) => T,
  fallback?: () => T
): T | undefined => {
  if (isDespia()) {
    return callback(despia);
  }
  return fallback?.();
};

/**
 * Haptic feedback patterns available in Despia
 */
export type HapticPattern = 'light' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Trigger haptic feedback on the device
 * @param pattern The haptic pattern to trigger
 */
export const triggerHaptic = (pattern: HapticPattern): void => {
  if (!isDespia()) return;
  
  const commands: Record<HapticPattern, string> = {
    light: 'lighthaptic://',
    heavy: 'heavyhaptic://',
    success: 'successhaptic://',
    warning: 'warninghaptic://',
    error: 'errorhaptic://',
  };
  
  try {
    despia(commands[pattern]);
  } catch (e) {
    console.warn('Haptic feedback failed:', e);
  }
};

/**
 * Native share options for Despia
 */
export interface DespiaShareOptions {
  message: string;
  url: string;
}

/**
 * Trigger native share sheet on Despia devices
 * Uses the shareapp:// protocol with properly encoded message and URL
 * @param options Share options with message and URL
 * @returns true if share was triggered, false otherwise
 */
export const nativeShare = (options: DespiaShareOptions): boolean => {
  if (!isDespia()) return false;
  
  try {
    const encodedMessage = encodeURIComponent(options.message);
    const encodedUrl = encodeURIComponent(options.url);
    despia(`shareapp://message?=${encodedMessage}&url=${encodedUrl}`);
    return true;
  } catch (e) {
    console.warn('Native share failed:', e);
  return false;
  }
};

/**
 * Open the device's native settings page for this app
 * Works on both iOS and Android when running in Despia environment
 * @returns true if settings was opened, false if not in Despia environment
 */
export const openNativeSettings = (): boolean => {
  if (!isDespia()) return false;
  
  try {
    despia('settingsapp://');
    return true;
  } catch (e) {
    console.warn('Failed to open native settings:', e);
    return false;
  }
};

/**
 * Configure the native status bar appearance (Android only)
 * Sets dark background with white text for visibility
 * iOS uses apple-mobile-web-app-status-bar-style meta tag instead
 */
export const configureStatusBar = (): void => {
  if (!isDespia()) return;
  
  try {
    // Set status bar background to dark (#0D0D14 = RGB 13, 13, 20)
    despia('statusbarcolor://{13, 13, 20}');
    
    // Set status bar icons/text to white for visibility on dark background
    despia('statusbartextcolor://{white}');
  } catch (e) {
    console.warn('Failed to configure status bar:', e);
  }
};

/**
 * Biometric authentication result handlers
 * These are called by the Despia runtime when biometric auth completes
 */
export interface BioAuthCallbacks {
  onSuccess: () => void;
  onFailure: (errorCode: string, errorMessage: string) => void;
  onUnavailable: () => void;
}

// Store callbacks globally so Despia can access them
let bioAuthCallbacks: BioAuthCallbacks | null = null;

/**
 * Register global callbacks for biometric authentication
 * Must be called before triggering bioauth
 */
export const registerBioAuthCallbacks = (callbacks: BioAuthCallbacks): void => {
  bioAuthCallbacks = callbacks;
  
  // Expose callbacks globally for Despia runtime
  if (typeof window !== 'undefined') {
    (window as any).onBioAuthSuccess = () => {
      if (isDespia() && bioAuthCallbacks) {
        bioAuthCallbacks.onSuccess();
      }
    };
    
    (window as any).onBioAuthFailure = (errorCode: string, errorMessage: string) => {
      if (isDespia() && bioAuthCallbacks) {
        bioAuthCallbacks.onFailure(errorCode, errorMessage);
      }
    };
    
    (window as any).onBioAuthUnavailable = () => {
      if (isDespia() && bioAuthCallbacks) {
        bioAuthCallbacks.onUnavailable();
      }
    };
  }
};

/**
 * Trigger biometric authentication (Face ID / Touch ID / Fingerprint)
 * Make sure to register callbacks first with registerBioAuthCallbacks
 * @returns true if bioauth was triggered, false if not in Despia environment
 */
export const triggerBioAuth = (): boolean => {
  if (!isDespia()) return false;
  
  try {
    despia('bioauth://');
    return true;
  } catch (e) {
    console.warn('Biometric authentication failed to trigger:', e);
    return false;
  }
};

/**
 * Check if biometric authentication is available on this device
 * Note: This triggers the auth flow - use with onUnavailable callback
 */
export const isBioAuthAvailable = (): boolean => {
  return isDespia();
};

// ============================================================================
// HEALTHKIT INTEGRATION (iOS)
// ============================================================================

/**
 * HealthKit permission result handlers
 */
export interface HealthKitCallbacks {
  onSuccess: () => void;
  onError: (errorMessage: string) => void;
}

let healthKitCallbacks: HealthKitCallbacks | null = null;

/**
 * Register global callbacks for HealthKit permission request
 */
export const registerHealthKitCallbacks = (callbacks: HealthKitCallbacks): void => {
  healthKitCallbacks = callbacks;
  
  // Expose callbacks globally for Despia runtime
  if (typeof window !== 'undefined') {
    (window as any).onHealthKitSuccess = () => {
      if (isDespia() && healthKitCallbacks) {
        console.log('[Despia HealthKit] Permission granted');
        healthKitCallbacks.onSuccess();
      }
    };
    
    (window as any).onHealthKitError = (error: string) => {
      if (isDespia() && healthKitCallbacks) {
        console.error('[Despia HealthKit] Permission error:', error);
        healthKitCallbacks.onError(error);
      }
    };
  }
};

/**
 * Cleanup HealthKit callbacks
 */
export const unregisterHealthKitCallbacks = (): void => {
  healthKitCallbacks = null;
  if (typeof window !== 'undefined') {
    delete (window as any).onHealthKitSuccess;
    delete (window as any).onHealthKitError;
  }
};

/**
 * Request HealthKit permissions on iOS via Despia native runtime
 * @returns true if the request was triggered, false if not in Despia environment
 */
export const requestHealthKitPermissions = (): boolean => {
  if (!isDespia()) {
    console.warn('[Despia HealthKit] Attempted outside of Despia environment');
    return false;
  }
  
  try {
    console.log('[Despia HealthKit] Requesting permissions...');
    despia('healthkit://permissions');
    return true;
  } catch (e) {
    console.error('[Despia HealthKit] Failed to request permissions:', e);
    return false;
  }
};

// ============================================================================
// REVENUECAT IN-APP PURCHASES
// ============================================================================

/**
 * Check if the app is running on iOS inside Despia
 */
export const isDespiaIOS = (): boolean => {
  if (!isDespia()) return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

/**
 * Check if the app is running on Android inside Despia
 */
export const isDespiaAndroid = (): boolean => {
  if (!isDespia()) return false;
  return /Android/i.test(navigator.userAgent);
};

/**
 * iOS App Store product IDs for subscription tiers
 * These must match the products configured in App Store Connect
 */
export const IOS_IAP_PRODUCT_IDS = {
  starter_monthly: 'fitconnect.starter.monthly',
  starter_yearly: 'fitconnect.starter.annual',
  pro_monthly: 'fitconnect.pro.monthly',
  pro_yearly: 'fitconnect.pro.annual',
  enterprise_monthly: 'fitconnect.enterprise.monthly',
  enterprise_yearly: 'fitconnect.enterprise.annual',
} as const;

/**
 * Android Google Play product IDs for subscription tiers
 * Format: product.interval.play:base-plan-id
 * These must match the products configured in Google Play Console
 */
export const ANDROID_IAP_PRODUCT_IDS = {
  starter_monthly: 'starter.monthly.play:starter-monthly-play',
  starter_yearly: 'starter.annual.play:starter-annual-play',
  pro_monthly: 'pro.monthly.play:pro-monthly-play',
  pro_yearly: 'pro.annual.play:pro-annual-play',
  enterprise_monthly: 'enterprise.monthly.play:enterprise-monthly-play',
  enterprise_yearly: 'enterprise.annual.play:enterprise-annual-play',
} as const;

// Legacy export for backwards compatibility
export const IAP_PRODUCT_IDS = IOS_IAP_PRODUCT_IDS;

export type IAPProductId = typeof IOS_IAP_PRODUCT_IDS[keyof typeof IOS_IAP_PRODUCT_IDS] | 
                           typeof ANDROID_IAP_PRODUCT_IDS[keyof typeof ANDROID_IAP_PRODUCT_IDS];

/**
 * Get the correct product ID for the current platform
 * @param tier The subscription tier (starter, pro, enterprise)
 * @param interval The billing interval (monthly, yearly)
 * @returns The platform-specific product ID or null if not in native environment
 */
export const getPlatformProductId = (
  tier: 'starter' | 'pro' | 'enterprise',
  interval: 'monthly' | 'yearly'
): string | null => {
  const key = `${tier}_${interval}` as keyof typeof IOS_IAP_PRODUCT_IDS;
  
  if (isDespiaAndroid()) {
    return ANDROID_IAP_PRODUCT_IDS[key] || null;
  }
  
  if (isDespiaIOS()) {
    return IOS_IAP_PRODUCT_IDS[key] || null;
  }
  
  return null;
};

/**
 * IAP success callback data provided by Despia native runtime
 */
export interface IAPSuccessData {
  planID: string;
  transactionID: string;
  subreceipts: string;
}

/**
 * IAP callback handlers
 */
export interface IAPCallbacks {
  onSuccess: (data: IAPSuccessData) => void;
  onError?: (error: string) => void;
}

// Store callbacks globally so Despia can access them
let iapCallbacks: IAPCallbacks | null = null;

/**
 * Register global callback for IAP success
 * Must be called before triggering purchases
 */
export const registerIAPCallbacks = (callbacks: IAPCallbacks): void => {
  iapCallbacks = callbacks;
  
  // Expose iapSuccess globally for Despia runtime
  if (typeof window !== 'undefined') {
    (window as any).iapSuccess = (data: IAPSuccessData) => {
      if (isDespia() && iapCallbacks) {
        console.log('[Despia IAP] Purchase success callback received:', data);
        iapCallbacks.onSuccess(data);
      }
    };
  }
};

/**
 * Cleanup IAP callbacks when component unmounts
 */
export const unregisterIAPCallbacks = (): void => {
  iapCallbacks = null;
  if (typeof window !== 'undefined') {
    delete (window as any).iapSuccess;
  }
};

/**
 * Trigger a RevenueCat purchase through Despia native runtime
 * @param userId The user's ID (typically the auth user ID or coach profile ID)
 * @param productId The RevenueCat product ID to purchase
 * @returns true if the purchase was triggered, false if not in Despia environment
 */
export const triggerRevenueCatPurchase = (userId: string, productId: string): boolean => {
  if (!isDespia()) {
    console.warn('[Despia IAP] Attempted purchase outside of Despia environment');
    return false;
  }
  
  try {
    const command = `revenuecat://purchase?external_id=${encodeURIComponent(userId)}&product=${encodeURIComponent(productId)}`;
    console.log('[Despia IAP] Triggering purchase:', command);
    despia(command);
    return true;
  } catch (e) {
    console.error('[Despia IAP] Failed to trigger purchase:', e);
    return false;
  }
};

/**
 * Check if native IAP is available
 */
export const isNativeIAPAvailable = (): boolean => {
  return isDespia();
};

export default despia;
