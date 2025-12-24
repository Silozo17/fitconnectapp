/**
 * Despia Native Runtime Setup
 * 
 * This module provides environment detection and access to the Despia native runtime.
 * Only invoke native features when running inside the Despia environment.
 */

import despia from 'despia-native';

/**
 * Check if the app is running inside the Despia native environment
 * Uses user agent string check as per official Despia documentation
 */
export const isDespia = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return navigator.userAgent.toLowerCase().includes('despia');
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
 * HealthKit connection result
 */
export interface HealthKitConnectionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

/**
 * Check Apple Health connection by attempting to read a small sample of data.
 * This will trigger the iOS permission dialog if not yet authorized.
 * 
 * According to Despia docs, the correct pattern is:
 * await despia('healthkit://read?types=...&days=...', ['healthkitResponse'])
 * 
 * The SDK automatically handles permission requests on first read attempt.
 * 
 * @returns Object with success status, error message, and any health data
 */
export const checkHealthKitConnection = async (): Promise<HealthKitConnectionResult> => {
  if (!isDespia()) {
    console.warn('[Despia HealthKit] Attempted outside of Despia environment');
    return { success: false, error: 'Not running in native app' };
  }

  if (!isDespiaIOS()) {
    console.warn('[Despia HealthKit] HealthKit is only available on iOS');
    return { success: false, error: 'HealthKit is only available on iOS' };
  }

  try {
    console.log('[Despia HealthKit] Attempting to read data (triggers permission if needed)...');
    
    // Attempt to read step count for 1 day - this triggers the permission dialog
    // The SDK returns a promise that resolves when the user responds to permission prompt
    const response = await despia(
      'healthkit://read?types=HKQuantityTypeIdentifierStepCount&days=1',
      ['healthkitResponse']
    );
    
    console.log('[Despia HealthKit] Response received:', JSON.stringify(response, null, 2));
    
    // Strictly check if we got actual data back
    if (response && typeof response === 'object') {
      const healthData = (response as Record<string, unknown>).healthkitResponse;
      
      // Check if healthkitResponse exists and has actual data
      if (healthData !== undefined && healthData !== null) {
        // If it's an array, check it's not empty
        if (Array.isArray(healthData)) {
          if (healthData.length > 0) {
            console.log('[Despia HealthKit] Successfully read health data:', healthData);
            return { success: true, data: healthData };
          } else {
            // Empty array means permission granted but no data recorded yet
            console.log('[Despia HealthKit] Permission granted, but no step data recorded yet');
            return { success: true, data: [] };
          }
        }
        
        // If it's an object with data
        if (typeof healthData === 'object' && Object.keys(healthData as object).length > 0) {
          console.log('[Despia HealthKit] Successfully read health data object:', healthData);
          return { success: true, data: healthData };
        }
        
        // Data exists but might be empty object
        console.log('[Despia HealthKit] Permission granted (empty data)');
        return { success: true, data: healthData };
      }
    }
    
    // If response is null/undefined, the SDK timed out or permission was denied
    console.warn('[Despia HealthKit] No response received - permission may have been denied');
    return { 
      success: false, 
      error: 'No response from Apple Health. Please check Settings → Privacy & Security → Health → [App Name] and enable all permissions.' 
    };
    
  } catch (e) {
    console.error('[Despia HealthKit] Error during read attempt:', e);
    
    // Parse the error to provide a user-friendly message
    const errorMessage = e instanceof Error ? e.message : String(e);
    
    // Check for common HealthKit error patterns
    if (errorMessage.includes('denied') || errorMessage.includes('authorization')) {
      return { 
        success: false, 
        error: 'Permission denied. Please go to Settings → Privacy & Security → Health and enable access for this app.' 
      };
    }
    
    if (errorMessage.includes('unavailable') || errorMessage.includes('not available')) {
      return { success: false, error: 'HealthKit is not available on this device.' };
    }
    
    if (errorMessage.includes('timeout')) {
      return { 
        success: false, 
        error: 'Connection timed out. Please ensure HealthKit permissions are enabled in Settings.' 
      };
    }
    
    return { success: false, error: errorMessage || 'Failed to connect to Apple Health' };
  }
};

/**
 * Sync health data from Apple Health via native HealthKit
 * @param days Number of days of data to sync (default: 7)
 * @returns Object with success status and synced data
 */
export const syncHealthKitData = async (days: number = 7): Promise<HealthKitConnectionResult> => {
  if (!isDespia() || !isDespiaIOS()) {
    return { success: false, error: 'HealthKit is only available on iOS native app' };
  }

  try {
    console.log(`[Despia HealthKit] Syncing ${days} days of health data...`);
    
    /**
     * TEMPORARY FIX: Only sync step count to avoid Despia SDK crash
     * 
     * The Despia HealthKitManager.swift has a bug where it uses hardcoded
     * HealthKit type identifiers internally, regardless of what we pass in
     * the types parameter. This causes crashes when it attempts to use
     * HKStatisticsCollectionQuery with category types or certain quantity types.
     * 
     * Until Despia fixes their native SDK, we only request step count which
     * is confirmed to work reliably.
     * 
     * TODO: Re-enable full health data sync when Despia fixes HealthKitManager.swift
     * Full list that should work:
     * - HKQuantityTypeIdentifierStepCount
     * - HKQuantityTypeIdentifierActiveEnergyBurned
     * - HKQuantityTypeIdentifierDistanceWalkingRunning
     * - HKQuantityTypeIdentifierHeartRate
     * - HKQuantityTypeIdentifierAppleExerciseTime
     */
    const types = 'HKQuantityTypeIdentifierStepCount';
    
    // Add cache-busting timestamp to attempt to bypass any caching in Despia SDK
    const timestamp = Date.now();
    
    console.log(`[Despia HealthKit] Request: types=${types}, days=${days}, t=${timestamp}`);
    
    const response = await despia(
      `healthkit://read?types=${types}&days=${days}&t=${timestamp}`,
      ['healthkitResponse']
    );
    
    console.log('[Despia HealthKit] Sync response:', response);
    
    if (response && typeof response === 'object') {
      return { success: true, data: (response as Record<string, unknown>).healthkitResponse };
    }
    
    return { success: true };
  } catch (e) {
    console.error('[Despia HealthKit] Sync error:', e);
    return { success: false, error: e instanceof Error ? e.message : 'Sync failed' };
  }
};

// ============================================================================
// REVENUECAT IN-APP PURCHASES
// ============================================================================

/**
 * Check if the app is running on iOS inside Despia
 * Uses lowercase user agent check as per official Despia documentation
 */
export const isDespiaIOS = (): boolean => {
  if (!isDespia()) return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('iphone') || ua.includes('ipad');
};

/**
 * Check if the app is running on Android inside Despia
 * Uses lowercase user agent check as per official Despia documentation
 */
export const isDespiaAndroid = (): boolean => {
  if (!isDespia()) return false;
  return navigator.userAgent.toLowerCase().includes('android');
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
  onCancel?: () => void;
}

// Store callbacks globally so Despia can access them
let iapCallbacks: IAPCallbacks | null = null;

/**
 * Register global callbacks for IAP events
 * Must be called before triggering purchases
 */
export const registerIAPCallbacks = (callbacks: IAPCallbacks): void => {
  iapCallbacks = callbacks;
  
  // Expose callbacks globally for Despia runtime
  if (typeof window !== 'undefined') {
    (window as any).iapSuccess = (data: IAPSuccessData) => {
      if (isDespia() && iapCallbacks) {
        console.log('[Despia IAP] Purchase success callback received:', data);
        iapCallbacks.onSuccess(data);
      }
    };
    
    (window as any).iapCancel = () => {
      if (isDespia()) {
        console.log('[Despia IAP] Purchase cancelled by user');
        iapCallbacks?.onCancel?.();
      }
    };
    
    (window as any).iapError = (error: string) => {
      if (isDespia()) {
        console.error('[Despia IAP] Purchase error:', error);
        iapCallbacks?.onError?.(error);
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
    delete (window as any).iapCancel;
    delete (window as any).iapError;
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
