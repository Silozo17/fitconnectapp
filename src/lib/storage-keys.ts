/**
 * Centralized localStorage key registry
 * 
 * All localStorage keys should be defined here to:
 * 1. Prevent key collisions
 * 2. Enable easy debugging
 * 3. Ensure consistent naming
 * 4. Simplify key discovery
 */

export const STORAGE_KEYS = {
  // =====================
  // Auth & Session
  // =====================
  /** Supabase auth token */
  SUPABASE_AUTH: 'sb-ntgfihgneyoxxbwmtceq-auth-token',
  
  // =====================
  // View State & Routing
  // =====================
  /** Last visited dashboard route */
  LAST_ROUTE: 'fc_last_route',
  /** Active view mode (admin/coach/client) with profile ID */
  VIEW_STATE: 'fc_view_state',
  
  // =====================
  // Onboarding
  // =====================
  /** Client onboarding completion status */
  CLIENT_ONBOARDED: 'fc_onboarded_client',
  /** Coach onboarding completion status */
  COACH_ONBOARDED: 'fc_onboarded_coach',
  
  // =====================
  // Subscription & Tier
  // =====================
  /** Cached subscription tier */
  CACHED_TIER: 'fc_cached_tier',
  /** Timestamp of cached tier */
  TIER_TIMESTAMP: 'fc_tier_timestamp',
  
  // =====================
  // Native App Cache
  // =====================
  /** Native cache version */
  NATIVE_CACHE_VERSION: 'fc_native_cache_version',
  
  // =====================
  // User Preferences
  // =====================
  /** User's preferred language */
  LANGUAGE: 'fc_language',
  /** Theme preference */
  THEME: 'theme',
  /** Cookie consent status */
  COOKIE_CONSENT: 'fc_cookie_consent',
  
  // =====================
  // 2FA
  // =====================
  /** 2FA verification state (session storage) */
  TWO_FACTOR_VERIFIED: 'fc_2fa_verified',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

/**
 * Get a value from localStorage with type safety
 */
export function getStorage<T>(key: StorageKey): T | null {
  try {
    const value = localStorage.getItem(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Set a value in localStorage with type safety
 */
export function setStorage<T>(key: StorageKey, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage error (quota exceeded, private browsing, etc.)
  }
}

/**
 * Remove a value from localStorage
 */
export function removeStorage(key: StorageKey): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage error
  }
}

/**
 * Clear all FitConnect-specific storage keys
 */
export function clearAllFCStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      if (key.startsWith('fc_')) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // Storage error
  }
}

/**
 * Clear storage keys related to user session
 * Call this on logout
 */
export function clearSessionStorage(): void {
  try {
    removeStorage(STORAGE_KEYS.LAST_ROUTE);
    removeStorage(STORAGE_KEYS.VIEW_STATE);
    removeStorage(STORAGE_KEYS.CLIENT_ONBOARDED);
    removeStorage(STORAGE_KEYS.COACH_ONBOARDED);
    removeStorage(STORAGE_KEYS.CACHED_TIER);
    removeStorage(STORAGE_KEYS.TIER_TIMESTAMP);
    sessionStorage.removeItem(STORAGE_KEYS.TWO_FACTOR_VERIFIED);
  } catch {
    // Storage error
  }
}
