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
  /** Just completed onboarding flag (sessionStorage) */
  ONBOARDING_JUST_COMPLETED: 'fc_onboarding_just_completed',
  /** Signup in progress flag (sessionStorage) */
  SIGNUP_IN_PROGRESS: 'fc_signup_in_progress',
  
  // =====================
  // Subscription & Tier
  // =====================
  /** Cached subscription tier */
  CACHED_TIER: 'fc_cached_tier',
  /** Timestamp of cached tier */
  TIER_TIMESTAMP: 'fc_tier_timestamp',
  /** Upgrade protection (instant access after purchase) */
  UPGRADE_PROTECTION: 'fc_upgrade_protection',
  /** Billing interval preference */
  BILLING_INTERVAL: 'fc_billing_interval',
  
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
  // Location
  // =====================
  /** Manual location override */
  MANUAL_LOCATION: 'fc_manual_location',
  /** Session precise location */
  SESSION_PRECISE_LOCATION: 'fc_session_precise_location',
  /** Location prompt dismissed */
  LOCATION_PROMPT_DISMISSED: 'fc_location_prompt_dismissed',
  /** IP-based location cache */
  IP_LOCATION_CACHE: 'fc_ip_location_cache',
  /** Marketplace location filter */
  MARKETPLACE_LOCATION_FILTER: 'fc_marketplace_location_filter',
  /** User location data */
  USER_LOCATION: 'fc_user_location',
  /** Last known location (persisted across sessions for instant marketplace) */
  LAST_KNOWN_LOCATION: 'fc_last_known_location',
  /** Whether we've asked for location permission */
  LOCATION_PERMISSION_ASKED: 'fc_location_permission_asked',
  
  // =====================
  // UI State
  // =====================
  /** Page help dismissed prefix (append page id) */
  PAGE_HELP_PREFIX: 'fc_page_help_',
  /** Support chat tooltip has been seen (versioned so existing users see new tooltips) */
  SUPPORT_TOOLTIP_SEEN: 'fc_support_tooltip_seen_v1',
  /** Feedback button tooltip has been seen */
  FEEDBACK_TOOLTIP_SEEN: 'fc_feedback_tooltip_seen_v1',
  /** Profile notch tooltip has been seen */
  PROFILE_NOTCH_TOOLTIP_SEEN: 'fc_profile_notch_tooltip_seen_v1',
  /** Notifications tooltip has been seen */
  NOTIFICATIONS_TOOLTIP_SEEN: 'fc_notifications_tooltip_seen_v1',
  /** View switcher tooltip has been seen */
  VIEW_SWITCHER_TOOLTIP_SEEN: 'fc_view_switcher_tooltip_seen_v1',
  /** Dismissed goal suggestions */
  DISMISSED_GOAL_SUGGESTIONS: 'fc_dismissed_goal_suggestions',
  
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
 * Get a raw string value from localStorage (for simple string values)
 */
export function getStorageRaw(key: StorageKey): string | null {
  try {
    return localStorage.getItem(key);
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
 * Set a raw string value in localStorage
 */
export function setStorageRaw(key: StorageKey, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage error
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
    removeStorage(STORAGE_KEYS.UPGRADE_PROTECTION);
    sessionStorage.removeItem(STORAGE_KEYS.TWO_FACTOR_VERIFIED);
    sessionStorage.removeItem(STORAGE_KEYS.ONBOARDING_JUST_COMPLETED);
    sessionStorage.removeItem(STORAGE_KEYS.SIGNUP_IN_PROGRESS);
  } catch {
    // Storage error
  }
}
