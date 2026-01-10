/**
 * Despia Native Runtime Setup
 * 
 * This module provides environment detection and access to the Despia native runtime.
 * Only invoke native features when running inside the Despia environment.
 */

export type DespiaRuntime = (url: string, responseKeys?: string[]) => any;

const getGlobalDespiaRuntime = (): DespiaRuntime | null => {
  const fn = (globalThis as any)?.despia;
  return typeof fn === "function" ? (fn as DespiaRuntime) : null;
};

// A callable wrapper used throughout this file.
// It throws if called when the native runtime isn't available.
const despia: DespiaRuntime = (url, responseKeys) => {
  const fn = getGlobalDespiaRuntime();
  if (!fn) throw new Error("[Despia] Runtime not available");
  return fn(url, responseKeys);
};

/**
 * Check if the app is running inside the Despia native environment
 * Uses user agent string check as per official Despia documentation
 */
export const isDespia = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return navigator.userAgent.toLowerCase().includes("despia");
};

/**
 * Get the Despia runtime instance (only use when isDespia() returns true)
 */
export const getDespiaRuntime = (): DespiaRuntime | null => {
  if (!isDespia()) return null;

  const runtime = getGlobalDespiaRuntime();
  if (!runtime) {
    console.warn("[Despia] Runtime not available yet");
    return null;
  }

  return runtime;
};

/**
 * Safe wrapper to execute Despia-only code
 * @param callback Function to execute if in Despia environment
 * @param fallback Optional fallback for non-Despia environments
 */
export const withDespia = <T>(
  callback: (runtime: DespiaRuntime) => T,
  fallback?: () => T
): T | undefined => {
  const runtime = getDespiaRuntime();
  if (runtime) return callback(runtime);
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
 * 
 * CRITICAL FIX: Delayed execution to ensure Android native interceptor is ready
 * Without delay, Android WebView navigates to statusbarcolor:// as a URL
 * causing ERR_UNKNOWN_URL_SCHEME crash
 */
export const configureStatusBar = (): void => {
  // Only Android needs Despia status bar commands
  // iOS uses apple-mobile-web-app-status-bar-style meta tag in index.html
  if (!isDespia() || !isDespiaAndroid()) return;
  
  // Delay execution to ensure native interceptor is ready
  // Android WebView needs time to set up the window.despia observer
  setTimeout(() => {
    try {
      const runtime = getGlobalDespiaRuntime();
      if (!runtime) {
        console.warn('[Despia] Runtime not available, skipping status bar config');
        return;
      }

      // Set status bar background to dark (#0D0D14 = RGB 13, 13, 20)
      runtime('statusbarcolor://{13, 13, 20}');

      // Set status bar icons/text to white for visibility on dark background
      runtime('statusbartextcolor://{white}');

      console.log('[Despia] Status bar configured successfully');
    } catch (e) {
      // Non-fatal: status bar styling is cosmetic, app should continue
      console.warn('[Despia] Status bar configuration failed (non-fatal):', e);
    }
  }, 500);
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

// HealthKit integration moved to src/lib/healthkit.ts

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
// IAP CALLBACK SYSTEM - SIMPLIFIED
// Single listener pattern matching Despia documentation
// ============================================================================

// Current active callbacks - only one purchase flow at a time
let currentIAPCallbacks: IAPCallbacks | null = null;
let iapCallbacksInitialized = false;

// Track if a purchase is currently in flight to prevent accidental callback clearing
let purchaseInFlight = false;

/**
 * Set purchase in flight status - prevents callback clearing during purchase
 */
export const setPurchaseInFlight = (inFlight: boolean): void => {
  purchaseInFlight = inFlight;
  console.log('[Despia IAP] Purchase in flight:', inFlight);
};

/**
 * Check if a purchase is currently in flight
 */
export const isPurchaseInFlight = (): boolean => purchaseInFlight;

/**
 * Set the current IAP callbacks
 * Call this BEFORE triggering a purchase
 * PROTECTED: Won't clear callbacks while purchase is in flight
 */
export const setIAPCallbacks = (callbacks: IAPCallbacks | null): void => {
  if (callbacks === null && purchaseInFlight) {
    console.warn('[Despia IAP] Ignoring callback clear - purchase in flight');
    return;
  }
  currentIAPCallbacks = callbacks;
  console.log('[Despia IAP] Callbacks set:', callbacks ? 'active' : 'cleared');
};

/**
 * Initialize global IAP callbacks that Despia will call
 * These are simple window functions that dispatch to currentIAPCallbacks
 */
const initializeGlobalIAPCallbacks = (): void => {
  if (iapCallbacksInitialized || typeof window === 'undefined') return;
  
  iapCallbacksInitialized = true;
  
  // iapSuccess - called by Despia when purchase succeeds
  (window as any).iapSuccess = (rawData: IAPSuccessData | string) => {
    console.log('[Despia IAP] ▶ window.iapSuccess INVOKED');
    console.log('[Despia IAP] Current callbacks registered:', !!currentIAPCallbacks);
    console.log('[Despia IAP] Purchase in flight:', purchaseInFlight);
    console.log('[Despia IAP] Raw payload:', rawData);
    
    // Clear purchase in flight flag
    purchaseInFlight = false;
    
    if (!isDespia()) {
      console.warn('[Despia IAP] iapSuccess called outside Despia environment');
      return;
    }
    
    // Parse JSON string if needed
    let data: IAPSuccessData;
    if (typeof rawData === 'string') {
      try {
        data = JSON.parse(rawData);
      } catch {
        console.error('[Despia IAP] Failed to parse iapSuccess payload:', rawData);
        currentIAPCallbacks?.onError?.('Invalid IAP response format');
        return;
      }
    } else {
      data = rawData;
    }
    
    console.log('[Despia IAP] Purchase successful:', data);
    
    if (currentIAPCallbacks?.onSuccess) {
      try {
        currentIAPCallbacks.onSuccess(data);
      } catch (e) {
        console.error('[Despia IAP] Error in success handler:', e);
      }
    } else {
      console.warn('[Despia IAP] No success callback registered');
    }
  };
  
  // iapCancel - called by Despia when user cancels
  (window as any).iapCancel = () => {
    console.log('[Despia IAP] ▶ window.iapCancel INVOKED');
    console.log('[Despia IAP] Current callbacks registered:', !!currentIAPCallbacks);
    console.log('[Despia IAP] Purchase in flight:', purchaseInFlight);
    
    // Clear purchase in flight flag
    purchaseInFlight = false;
    
    if (!isDespia()) return;
    
    if (currentIAPCallbacks?.onCancel) {
      try {
        currentIAPCallbacks.onCancel();
      } catch (e) {
        console.error('[Despia IAP] Error in cancel handler:', e);
      }
    } else {
      console.warn('[Despia IAP] No cancel callback registered');
    }
  };
  
  // iapError - called by Despia when purchase fails OR is cancelled
  // RevenueCat often sends cancellation via iapError with specific payload
  (window as any).iapError = (rawError: string | object) => {
    console.log('[Despia IAP] ▶ window.iapError INVOKED');
    console.log('[Despia IAP] Current callbacks registered:', !!currentIAPCallbacks);
    console.log('[Despia IAP] Purchase in flight:', purchaseInFlight);
    console.log('[Despia IAP] Raw payload:', rawError);
    
    // Clear purchase in flight flag
    purchaseInFlight = false;
    
    if (!isDespia()) return;
    
    // Parse the error to detect if it's actually a cancellation
    let errorString = '';
    let isCancellation = false;
    
    try {
      // Handle string or object payload
      let errorData: any = rawError;
      
      if (typeof rawError === 'string') {
        // Try to parse as JSON if it looks like JSON
        if (rawError.trim().startsWith('{') || rawError.trim().startsWith('[')) {
          try {
            errorData = JSON.parse(rawError);
          } catch {
            errorData = rawError;
          }
        } else {
          errorData = rawError;
        }
      }
      
      // Check for cancellation indicators in the parsed data
      if (typeof errorData === 'object' && errorData !== null) {
        // RevenueCat specific cancellation detection
        isCancellation = Boolean(
          errorData.userCancelled === true ||
          errorData.readableErrorCode === 'PurchaseCancelledError' ||
          errorData.code === 'PurchaseCancelledError' ||
          errorData.code === 1 || // StoreKit cancellation code
          errorData.code === 'E_USER_CANCELLED' ||
          (errorData.message && typeof errorData.message === 'string' && 
            (errorData.message.toLowerCase().includes('cancel') || 
             errorData.message.toLowerCase().includes('user cancelled')))
        );
        
        errorString = errorData.message || errorData.readableErrorCode || JSON.stringify(errorData);
      } else {
        errorString = String(errorData);
        // Check string for cancellation keywords
        const lowerError = errorString.toLowerCase();
        isCancellation = lowerError.includes('cancel') || 
                         lowerError.includes('user cancelled') ||
                         lowerError.includes('purchasecancelled');
      }
    } catch (e) {
      console.error('[Despia IAP] Error parsing iapError payload:', e);
      errorString = String(rawError);
    }
    
    console.log('[Despia IAP] Parsed error:', { errorString, isCancellation });
    
    if (isCancellation) {
      // Treat as cancellation, not error
      console.log('[Despia IAP] Detected cancellation via iapError - calling onCancel');
      if (currentIAPCallbacks?.onCancel) {
        try {
          currentIAPCallbacks.onCancel();
        } catch (e) {
          console.error('[Despia IAP] Error in cancel handler:', e);
        }
      }
    } else {
      // Genuine error
      console.log('[Despia IAP] Genuine error - calling onError');
      if (currentIAPCallbacks?.onError) {
        try {
          currentIAPCallbacks.onError(errorString);
        } catch (e) {
          console.error('[Despia IAP] Error in error handler:', e);
        }
      }
    }
  };

  // iapPending - called by Despia for Ask to Buy
  (window as any).iapPending = () => {
    console.log('[Despia IAP] ▶ window.iapPending INVOKED');
    console.log('[Despia IAP] Current callbacks registered:', !!currentIAPCallbacks);
    console.log('[Despia IAP] Purchase in flight:', purchaseInFlight);
    
    // Clear purchase in flight flag (pending is still a resolution)
    purchaseInFlight = false;
    
    if (!isDespia()) return;
    
    if (currentIAPCallbacks?.onPending) {
      try {
        currentIAPCallbacks.onPending();
      } catch (e) {
        console.error('[Despia IAP] Error in pending handler:', e);
      }
    } else {
      console.warn('[Despia IAP] No pending callback registered');
    }
  };
  
  console.log('[Despia IAP] Global callbacks initialized');
};

// Legacy multi-listener registry (kept for boost functionality)
const iapCallbackRegistry = new Map<string, IAPCallbacks>();

/**
 * Register callbacks with unique ID (legacy multi-listener API)
 * @deprecated Use setIAPCallbacks for subscription purchases
 */
export const registerIAPCallbacksWithId = (id: string, callbacks: IAPCallbacks): void => {
  initializeGlobalIAPCallbacks();
  iapCallbackRegistry.set(id, callbacks);
  // Also set as current callbacks for immediate use
  currentIAPCallbacks = callbacks;
  console.log(`[Despia IAP] Registered listener: ${id}`);
};

/**
 * Unregister callbacks by ID (legacy multi-listener API)
 */
export const unregisterIAPCallbacksWithId = (id: string): void => {
  const removed = iapCallbackRegistry.delete(id);
  if (removed) {
    console.log(`[Despia IAP] Unregistered listener: ${id}`);
  }
  // Clear current if it was this listener
  if (iapCallbackRegistry.size === 0) {
    currentIAPCallbacks = null;
  }
};

/**
 * Register global callbacks (legacy single-listener API)
 * @deprecated Use setIAPCallbacks
 */
export const registerIAPCallbacks = (callbacks: IAPCallbacks): void => {
  registerIAPCallbacksWithId('default', callbacks);
};

/**
 * Cleanup IAP callbacks (legacy single-listener API)
 * @deprecated Use setIAPCallbacks(null)
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
  
  // Ensure callbacks are initialized
  initializeGlobalIAPCallbacks();
  
  // Mark purchase as in flight to protect callbacks from being cleared
  purchaseInFlight = true;
  console.log('[Despia IAP] Setting purchaseInFlight = true');
  
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
    console.log('[Despia IAP] Callbacks registered:', currentIAPCallbacks ? 'yes' : 'no');
    console.log('[Despia IAP] window.iapSuccess:', typeof (window as any).iapSuccess);
    
    despia(command);
    return true;
  } catch (e) {
    console.error('[Despia IAP] Failed to trigger purchase:', e);
    purchaseInFlight = false; // Reset on error
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
 * Per Despia documentation: restoreinapppurchases:// takes no parameters
 * RevenueCat handles user association server-side via the existing external_id
 * 
 * @returns true if restore was triggered, false if not in Despia environment
 */
export const triggerRestorePurchases = (): boolean => {
  if (!isDespia()) {
    console.warn('[Despia IAP] Attempted restore outside of Despia environment');
    return false;
  }
  
  try {
    // Per Despia docs: no parameters for restore command
    const command = 'restoreinapppurchases://';
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

// ============================================================================
// MODULE INITIALIZATION
// ============================================================================

// Initialize global IAP callbacks immediately on module load
// This ensures callbacks are always ready before any purchase attempt
if (typeof window !== 'undefined') {
  initializeGlobalIAPCallbacks();
  console.log('[Despia] Module initialized - IAP callbacks ready');
}

export default despia;
