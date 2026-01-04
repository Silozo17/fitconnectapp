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
 * Timeout for HealthKit operations in milliseconds
 * Despia native bridge may fail silently - this ensures we don't wait forever
 */
const HEALTHKIT_TIMEOUT_MS = 3000;

/**
 * HealthKit connection result
 */
export interface HealthKitConnectionResult {
  success: boolean;
  error?: string;
  data?: unknown;
  timedOut?: boolean; // Indicates sync timed out (Despia limitation)
  dataPoints?: number; // Number of data points received
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

  // Pre-connection delay to let native state settle (helps after permission changes)
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const checkType = 'HKQuantityTypeIdentifierStepCount';
  const CONNECTION_TIMEOUT_MS = 2000;
  const MAX_RETRIES = 1;
  let retryCount = 0;
  
  while (retryCount <= MAX_RETRIES) {
    try {
      /**
       * REQUEST ONLY STEPS FOR INITIAL PERMISSION CHECK
       * This triggers the iOS permission dialog. We use only Steps to avoid
       * the Despia SDK bug with multi-type HKStatisticsCollectionQuery.
       * The full sync will fetch other types individually.
       */
      console.log(`[Despia HealthKit] Checking connection with ${checkType} (attempt ${retryCount + 1})...`);
      
      // Create a timeout promise (shorter timeout for connection check)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('HEALTHKIT_TIMEOUT')), CONNECTION_TIMEOUT_MS);
      });
      
      // Race between actual call and timeout
      const response = await Promise.race([
        despia(
          `healthkit://read?types=${checkType}&days=1`,
          ['healthkitResponse']
        ),
        timeoutPromise
      ]);
    
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
    
    // If response is null/undefined, the SDK returned nothing
    console.warn('[Despia HealthKit] No response received');
    return { 
      success: false, 
      error: 'NO_RESPONSE',
      timedOut: false
    };
    
    } catch (e) {
      // Handle timeout - retry if we have retries left
      if (e instanceof Error && e.message === 'HEALTHKIT_TIMEOUT') {
        if (retryCount < MAX_RETRIES) {
          console.log(`[Despia HealthKit] Attempt ${retryCount + 1} timed out, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 500));
          retryCount++;
          continue;
        }
        console.log('[Despia HealthKit] Connection check timed out after all retries');
        return { 
          success: false, 
          error: 'NO_RESPONSE',
          timedOut: true
        };
      }
      
      // Other errors - retry once
      if (retryCount < MAX_RETRIES) {
        console.log(`[Despia HealthKit] Attempt ${retryCount + 1} failed, retrying...`, e);
        await new Promise(resolve => setTimeout(resolve, 500));
        retryCount++;
        continue;
      }
      throw e;
    }
  }
  
  // If we exhausted retries without success
  console.error('[Despia HealthKit] All connection attempts failed');
  return { success: false, error: 'Failed to connect to Apple Health after retries' };
};

/**
 * Supported HealthKit QUANTITY type identifiers for multi-metric sync.
 * 
 * IMPORTANT: Only CUMULATIVE types are supported because Despia's 
 * HKStatisticsCollectionQuery uses .cumulativeSum internally.
 * 
 * EXCLUDED TYPES:
 * - HKQuantityTypeIdentifierHeartRate: DISCRETE type requiring .discreteAverage,
 *   causes iOS crash when mixed with cumulative types in the same query.
 * - HKCategoryTypeIdentifierSleepAnalysis: CATEGORY type requiring HKSampleQuery,
 *   not supported by Despia's HKStatisticsCollectionQuery.
 * 
 * Heart Rate and Sleep must be entered manually via ManualHealthDataModal.
 * Contact Despia support to request support for discrete/category types.
 */
export const SUPPORTED_HEALTHKIT_TYPES = [
  'HKQuantityTypeIdentifierStepCount',              // steps (cumulative)
  'HKQuantityTypeIdentifierActiveEnergyBurned',     // calories (cumulative)
  'HKQuantityTypeIdentifierDistanceWalkingRunning', // distance (cumulative)
  // EXCLUDED: AppleExerciseTime (active_minutes) - Despia SDK crashes even with single-type query
  // EXCLUDED: HeartRate - discrete type, causes crash with HKStatisticsCollectionQuery
] as const;

/**
 * Sync health data from Apple Health via native HealthKit
 * 
 * SEQUENTIAL SINGLE-TYPE QUERIES: Due to a bug in Despia's SDK where
 * multi-type HKStatisticsCollectionQuery causes native crashes, we now
 * sync each type individually in sequence. This is slower but crash-proof.
 * 
 * @param days Number of days of data to sync (default: 7)
 * @returns Object with success status and synced data
 */
export const syncHealthKitData = async (days: number = 7): Promise<HealthKitConnectionResult> => {
  if (!isDespia() || !isDespiaIOS()) {
    return { success: false, error: 'HealthKit is only available on iOS native app' };
  }

  console.log(`[Despia HealthKit] Starting sequential sync of ${days} days for ${SUPPORTED_HEALTHKIT_TYPES.length} types...`);
  
  // Aggregate all data from individual type syncs
  const allData: Record<string, unknown> = {};
  const failedTypes: string[] = [];
  let totalDataPoints = 0;
  
  // Sync each type individually to avoid Despia SDK multi-type crash
  for (const type of SUPPORTED_HEALTHKIT_TYPES) {
    try {
      console.log(`[Despia HealthKit] Syncing ${type}...`);
      
      // Create a timeout promise for this individual call
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('HEALTHKIT_TIMEOUT')), HEALTHKIT_TIMEOUT_MS);
      });
      
      // Add cache-busting timestamp
      const timestamp = Date.now();
      
      // Race between actual call and timeout
      const response = await Promise.race([
        despia(
          `healthkit://read?types=${type}&days=${days}&t=${timestamp}`,
          ['healthkitResponse']
        ),
        timeoutPromise
      ]);
      
      // DEEP DEBUG: Log raw response structure
      console.log(`[Despia HealthKit] ${type} RAW response:`, JSON.stringify(response, null, 2));
      
      if (response && typeof response === 'object') {
        let healthkitData = (response as Record<string, unknown>).healthkitResponse;
        
        console.log(`[Despia HealthKit] ${type} healthkitResponse type:`, typeof healthkitData);
        console.log(`[Despia HealthKit] ${type} healthkitResponse:`, JSON.stringify(healthkitData, null, 2));
        
        // FIX: Handle double-nested healthkitResponse (Despia SDK quirk)
        if (healthkitData && typeof healthkitData === 'object' && 'healthkitResponse' in (healthkitData as object)) {
          console.log(`[Despia HealthKit] ${type} Unwrapping double-nested healthkitResponse`);
          healthkitData = (healthkitData as Record<string, unknown>).healthkitResponse;
        }
        
        // FIX: If healthkitData is directly an array, it's the type data
        if (Array.isArray(healthkitData) && healthkitData.length > 0) {
          console.log(`[Despia HealthKit] ${type} Response is array with ${healthkitData.length} items`);
          allData[type] = healthkitData;
          totalDataPoints += healthkitData.length;
          console.log(`[Despia HealthKit] ✓ ${type}: ${healthkitData.length} data points (array format)`);
        } else if (healthkitData && typeof healthkitData === 'object' && !Array.isArray(healthkitData)) {
          // Standard object format: { "HKQuantityTypeIdentifier...": [...] }
          const hkObj = healthkitData as Record<string, unknown>;
          const typeData = hkObj[type];
          
          // Also try without the full type identifier (some SDKs shorten it)
          const shortType = type.replace('HKQuantityTypeIdentifier', '');
          const shortTypeData = hkObj[shortType];
          
          // Log all keys in the response object
          console.log(`[Despia HealthKit] ${type} Response keys:`, Object.keys(hkObj));
          
          if (typeData && Array.isArray(typeData) && typeData.length > 0) {
            allData[type] = typeData;
            totalDataPoints += typeData.length;
            console.log(`[Despia HealthKit] ✓ ${type}: ${typeData.length} data points`);
          } else if (shortTypeData && Array.isArray(shortTypeData) && shortTypeData.length > 0) {
            allData[type] = shortTypeData;
            totalDataPoints += shortTypeData.length;
            console.log(`[Despia HealthKit] ✓ ${type}: ${shortTypeData.length} data points (short key)`);
          } else {
            // Try first key in the object as fallback
            const firstKey = Object.keys(hkObj)[0];
            const firstData = firstKey ? hkObj[firstKey] : null;
            if (firstData && Array.isArray(firstData) && firstData.length > 0) {
              allData[type] = firstData;
              totalDataPoints += firstData.length;
              console.log(`[Despia HealthKit] ✓ ${type}: ${firstData.length} data points (first key: ${firstKey})`);
            } else {
              console.log(`[Despia HealthKit] ✓ ${type}: no data (empty or no matching key)`);
            }
          }
        } else {
          console.log(`[Despia HealthKit] ✓ ${type}: no data (null/empty response)`);
        }
      } else {
        console.log(`[Despia HealthKit] ${type}: Invalid response format`);
      }
      
      // 200ms delay between calls to prevent native bridge flooding
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.warn(`[Despia HealthKit] ✗ ${type} failed:`, errorMsg);
      failedTypes.push(type);
      // Continue with other types even if one fails
    }
  }
  
  console.log(`[Despia HealthKit] Sequential sync complete. ${Object.keys(allData).length}/${SUPPORTED_HEALTHKIT_TYPES.length} types, ${totalDataPoints} total data points`);
  
  if (failedTypes.length > 0) {
    console.warn(`[Despia HealthKit] Failed types: ${failedTypes.join(', ')}`);
  }
  
  // Return success if we got at least some data
  if (Object.keys(allData).length > 0 || failedTypes.length < SUPPORTED_HEALTHKIT_TYPES.length) {
    return { 
      success: true, 
      data: Object.keys(allData).length > 0 ? allData : null, 
      timedOut: false,
      dataPoints: totalDataPoints
    };
  }
  
  // All types failed
  return { 
    success: false, 
    error: 'All HealthKit types failed to sync',
    timedOut: false,
    dataPoints: 0
  };
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

/**
 * iOS App Store Boost product ID
 * Non-renewing subscription configured in App Store Connect
 */
export const IOS_BOOST_PRODUCT_ID = 'boost.fitconnect.apple';

/**
 * Android Google Play Boost product ID
 * Consumable product configured in Google Play Console
 */
export const ANDROID_BOOST_PRODUCT_ID = 'fitconnect.boost.play';

/**
 * Get the platform-specific boost product ID
 * @returns The boost product ID for the current platform, or null if not in native environment
 */
export const getBoostProductId = (): string | null => {
  if (isDespiaAndroid()) return ANDROID_BOOST_PRODUCT_ID;
  if (isDespiaIOS()) return IOS_BOOST_PRODUCT_ID;
  return null;
};

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
  onPending?: () => void; // For Ask to Buy / deferred transactions
}

// ============================================================================
// PHASE 1 FIX: Multi-listener IAP event bus
// Store multiple callbacks with unique IDs to prevent collision between
// subscription and boost IAP flows
// ============================================================================

// Map of listener ID -> callbacks
const iapCallbackRegistry = new Map<string, IAPCallbacks>();
let iapCallbacksInitialized = false;

/**
 * Initialize global IAP callbacks that dispatch to all registered listeners
 * Only runs once when first listener registers
 * PHASE 4 FIX: Handles async callbacks safely with Promise.resolve().catch()
 */
const initializeGlobalIAPCallbacks = (): void => {
  if (iapCallbacksInitialized || typeof window === 'undefined') return;
  
  iapCallbacksInitialized = true;
  
  // Global success handler - dispatches to ALL registered listeners
  // Handles both sync and async callbacks safely
  (window as any).iapSuccess = (rawData: IAPSuccessData | string) => {
    if (!isDespia()) return;
    
    // PHASE 4 FIX: Normalize payload - Despia may send JSON string in some cases
    let data: IAPSuccessData;
    if (typeof rawData === 'string') {
      try {
        data = JSON.parse(rawData);
        console.log('[Despia IAP] Parsed JSON string payload');
      } catch {
        console.error('[Despia IAP] Failed to parse string payload:', rawData);
        // Trigger error handlers instead
        iapCallbackRegistry.forEach((callbacks, id) => {
          Promise.resolve(callbacks.onError?.('Invalid IAP response format')).catch(e => 
            console.error(`[Despia IAP] Error in error handler for ${id}:`, e)
          );
        });
        return;
      }
    } else {
      data = rawData;
    }
    
    const listenerCount = iapCallbackRegistry.size;
    console.log(`[Despia IAP] Purchase success - dispatching to ${listenerCount} listeners:`, data);
    
    iapCallbackRegistry.forEach((callbacks, id) => {
      console.log(`[Despia IAP] Dispatching success to listener: ${id}`);
      // PHASE 4 FIX: Use Promise.resolve to safely handle async callbacks
      Promise.resolve(callbacks.onSuccess(data)).catch(e => {
        console.error(`[Despia IAP] Error in success handler for ${id}:`, e);
        // Optionally route to error UI
        callbacks.onError?.(`Activation failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
      });
    });
  };
  
  // Global cancel handler - dispatches to ALL registered listeners
  (window as any).iapCancel = () => {
    if (!isDespia()) return;
    
    console.log(`[Despia IAP] Purchase cancelled - dispatching to ${iapCallbackRegistry.size} listeners`);
    
    iapCallbackRegistry.forEach((callbacks, id) => {
      console.log(`[Despia IAP] Dispatching cancel to listener: ${id}`);
      try {
        callbacks.onCancel?.();
      } catch (e) {
        console.error(`[Despia IAP] Error in cancel handler for ${id}:`, e);
      }
    });
  };
  
  // Global error handler - dispatches to ALL registered listeners
  (window as any).iapError = (error: string) => {
    if (!isDespia()) return;
    
    console.error(`[Despia IAP] Purchase error - dispatching to ${iapCallbackRegistry.size} listeners:`, error);
    
    iapCallbackRegistry.forEach((callbacks, id) => {
      console.log(`[Despia IAP] Dispatching error to listener: ${id}`);
      try {
        callbacks.onError?.(error);
      } catch (e) {
        console.error(`[Despia IAP] Error in error handler for ${id}:`, e);
      }
    });
  };

  // Global pending handler - dispatches to ALL registered listeners
  (window as any).iapPending = () => {
    if (!isDespia()) return;
    
    console.log(`[Despia IAP] Purchase pending - dispatching to ${iapCallbackRegistry.size} listeners`);
    
    iapCallbackRegistry.forEach((callbacks, id) => {
      console.log(`[Despia IAP] Dispatching pending to listener: ${id}`);
      try {
        callbacks.onPending?.();
      } catch (e) {
        console.error(`[Despia IAP] Error in pending handler for ${id}:`, e);
      }
    });
  };
  
  console.log('[Despia IAP] Global callback handlers initialized');
};

/**
 * Register callbacks for IAP events with a unique listener ID
 * Multiple listeners can coexist - all receive callbacks
 * 
 * @param id Unique identifier for this listener (e.g., 'subscription', 'boost')
 * @param callbacks The callback handlers
 */
export const registerIAPCallbacksWithId = (id: string, callbacks: IAPCallbacks): void => {
  initializeGlobalIAPCallbacks();
  
  iapCallbackRegistry.set(id, callbacks);
  console.log(`[Despia IAP] Registered listener: ${id} (total: ${iapCallbackRegistry.size})`);
};

/**
 * Unregister callbacks for a specific listener ID
 * 
 * @param id The listener ID to unregister
 */
export const unregisterIAPCallbacksWithId = (id: string): void => {
  const removed = iapCallbackRegistry.delete(id);
  if (removed) {
    console.log(`[Despia IAP] Unregistered listener: ${id} (remaining: ${iapCallbackRegistry.size})`);
  }
};

/**
 * Register global callbacks for IAP events (legacy single-listener API)
 * @deprecated Use registerIAPCallbacksWithId for multi-listener support
 * Kept for backward compatibility - uses 'default' as listener ID
 */
export const registerIAPCallbacks = (callbacks: IAPCallbacks): void => {
  registerIAPCallbacksWithId('default', callbacks);
};

/**
 * Cleanup IAP callbacks (legacy single-listener API)
 * @deprecated Use unregisterIAPCallbacksWithId for multi-listener support
 */
export const unregisterIAPCallbacks = (): void => {
  unregisterIAPCallbacksWithId('default');
};

/**
 * Android replacement mode for subscription upgrades/downgrades
 * Maps to Google Play's ReplacementMode enum
 */
export type AndroidReplacementMode = 
  | 'IMMEDIATE_WITH_TIME_PRORATION'    // Prorated refund with immediate upgrade
  | 'IMMEDIATE_AND_CHARGE_PRORATED_PRICE' // Charge difference immediately
  | 'IMMEDIATE_WITHOUT_PRORATION'       // No proration, just switch
  | 'DEFERRED';                          // Change takes effect at next renewal

/**
 * Upgrade info for Android subscription changes
 */
export interface AndroidUpgradeInfo {
  oldProductId: string;
  replacementMode?: AndroidReplacementMode;
}

/**
 * Trigger a RevenueCat purchase through Despia native runtime
 * @param userId The user's ID (typically the auth user ID or coach profile ID)
 * @param productId The RevenueCat product ID to purchase
 * @param upgradeInfo Optional upgrade info for Android subscription changes
 * @returns true if the purchase was triggered, false if not in Despia environment
 */
export const triggerRevenueCatPurchase = (
  userId: string, 
  productId: string,
  upgradeInfo?: AndroidUpgradeInfo
): boolean => {
  if (!isDespia()) {
    console.warn('[Despia IAP] Attempted purchase outside of Despia environment');
    return false;
  }
  
  try {
    let command = `revenuecat://purchase?external_id=${encodeURIComponent(userId)}&product=${encodeURIComponent(productId)}`;
    
    // For Android upgrades, include old product and replacement mode
    if (isDespiaAndroid() && upgradeInfo?.oldProductId) {
      command += `&oldProduct=${encodeURIComponent(upgradeInfo.oldProductId)}`;
      command += `&replacementMode=${upgradeInfo.replacementMode || 'IMMEDIATE_AND_CHARGE_PRORATED_PRICE'}`;
      console.log('[Despia IAP] Android upgrade with replacement mode:', {
        oldProduct: upgradeInfo.oldProductId,
        newProduct: productId,
        mode: upgradeInfo.replacementMode || 'IMMEDIATE_AND_CHARGE_PRORATED_PRICE',
      });
    }
    
    console.log('[Despia IAP] Triggering purchase:', command);
    console.log(`[Despia IAP] Active listeners: ${Array.from(iapCallbackRegistry.keys()).join(', ')}`);
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

/**
 * Trigger RevenueCat restore purchases
 * This restores any previously purchased subscriptions on the current device.
 * Useful for:
 * - Users switching devices
 * - Users reinstalling the app
 * - Users who purchased but didn't get entitlement activated
 * 
 * @param userId The user's ID (typically the auth user ID)
 * @returns true if restore was triggered, false if not in Despia environment
 */
export const triggerRestorePurchases = (userId: string): boolean => {
  if (!isDespia()) {
    console.warn('[Despia IAP] Attempted restore outside of Despia environment');
    return false;
  }
  
  try {
    // Use the standard RestoreInAppPurchases protocol
    // The external_id ensures RevenueCat associates restored purchases with the right user
    const command = `restoreinapppurchases://external_id=${encodeURIComponent(userId)}`;
    console.log('[Despia IAP] Triggering restore purchases:', command);
    despia(command);
    return true;
  } catch (e) {
    console.error('[Despia IAP] Failed to trigger restore:', e);
    return false;
  }
};

// ============================================================================
// SCANNING MODE CONTROL SYSTEM
// ============================================================================

/**
 * Scanning mode options for device scanning behavior
 * - "auto": Automatically adjust scanning and brightness based on conditions
 * - "on": Enable scanning mode with optimal brightness
 * - "off": Disable scanning mode and restore normal brightness
 */
export type ScanningMode = 'auto' | 'on' | 'off';

/**
 * Scanning mode result
 */
export interface ScanningModeResult {
  success: boolean;
  mode: ScanningMode;
  error?: string;
}

// Store current scanning mode state
let currentScanningMode: ScanningMode = 'off';

/**
 * Set the device scanning mode
 * Controls device scanning behavior and automatically adjusts screen brightness
 * for optimal scanning conditions.
 * 
 * @param mode The scanning mode to set: "auto", "on", or "off"
 * @returns Object with success status and current mode
 */
export const setScanningMode = (mode: ScanningMode): ScanningModeResult => {
  if (!isDespia()) {
    console.warn('[Despia Scanning] Attempted outside of Despia environment');
    return { success: false, mode: currentScanningMode, error: 'Not running in native app' };
  }

  try {
    console.log(`[Despia Scanning] Setting scanning mode to: ${mode}`);
    despia(`scanningmode://${mode}`);
    currentScanningMode = mode;
    return { success: true, mode };
  } catch (e) {
    console.error('[Despia Scanning] Failed to set scanning mode:', e);
    return { 
      success: false, 
      mode: currentScanningMode, 
      error: e instanceof Error ? e.message : 'Failed to set scanning mode' 
    };
  }
};

/**
 * Enable scanning mode with optimal brightness
 * Shorthand for setScanningMode('on')
 */
export const enableScanningMode = (): ScanningModeResult => {
  return setScanningMode('on');
};

/**
 * Disable scanning mode and restore normal brightness
 * Shorthand for setScanningMode('off')
 */
export const disableScanningMode = (): ScanningModeResult => {
  return setScanningMode('off');
};

/**
 * Set scanning mode to auto (system determines optimal settings)
 * Shorthand for setScanningMode('auto')
 */
export const autoScanningMode = (): ScanningModeResult => {
  return setScanningMode('auto');
};

/**
 * Get the current scanning mode
 * @returns The current scanning mode
 */
export const getCurrentScanningMode = (): ScanningMode => {
  return currentScanningMode;
};

/**
 * Check if scanning mode is currently active
 * @returns true if scanning mode is 'on' or 'auto'
 */
export const isScanningModeActive = (): boolean => {
  return currentScanningMode === 'on' || currentScanningMode === 'auto';
};

export default despia;
