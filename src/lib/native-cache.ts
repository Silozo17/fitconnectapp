/**
 * Native Cache for Despia Mobile App
 * 
 * Provides device-local caching for frequently accessed, non-sensitive data
 * to dramatically improve cold start and navigation performance.
 * 
 * All operations are guarded by isDespia() check - web users are unaffected.
 * 
 * SECURITY NOTES:
 * - NEVER cache auth tokens, session data, or passwords
 * - NEVER cache payment/financial data
 * - ONLY cache data that can be safely shown stale
 */

import { isDespia } from './despia';
import { perfLogger } from './performance-logger';

// Cache version - increment when schema changes require cache invalidation
const CACHE_VERSION = 1;
const CACHE_PREFIX = 'fc_native_';
const VERSION_KEY = `${CACHE_PREFIX}version`;

/**
 * Cache entry with TTL and metadata
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

/**
 * Cache key definitions with their TTL in milliseconds
 */
export const CACHE_KEYS = {
  // Profile IDs - rarely change, long TTL
  COACH_PROFILE_ID: 'coach_profile_id',
  CLIENT_PROFILE_ID: 'client_profile_id',
  
  // User profile data - moderate TTL
  USER_PROFILE: 'user_profile',
  USER_ROLE: 'user_role',
  ALL_USER_ROLES: 'all_user_roles',
  
  // Dashboard stats - shorter TTL, use as placeholder
  CLIENT_DASHBOARD_STATS: 'client_dashboard_stats',
  COACH_DASHBOARD_STATS: 'coach_dashboard_stats',
  
  // Marketplace data - moderate TTL
  MARKETPLACE_COACHES: 'marketplace_coaches',
} as const;

export type CacheKey = typeof CACHE_KEYS[keyof typeof CACHE_KEYS];

/**
 * Default TTL values in milliseconds
 */
export const CACHE_TTL = {
  PROFILE_ID: 1000 * 60 * 60 * 24, // 24 hours - rarely changes
  USER_PROFILE: 1000 * 60 * 30, // 30 minutes
  USER_ROLE: 1000 * 60 * 60, // 1 hour
  DASHBOARD_STATS: 1000 * 60 * 10, // 10 minutes
  MARKETPLACE: 1000 * 60 * 15, // 15 minutes
} as const;

/**
 * Initialize the native cache system
 * Checks version and invalidates if needed
 * Call once on app start
 */
export const initNativeCache = (): void => {
  if (!isDespia()) return;
  
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    const currentVersion = storedVersion ? parseInt(storedVersion, 10) : 0;
    
    if (currentVersion !== CACHE_VERSION) {
      // Version mismatch - clear all cached data
      clearAllNativeCache();
      localStorage.setItem(VERSION_KEY, String(CACHE_VERSION));
      console.log('[NativeCache] Cache invalidated due to version change');
    }
  } catch (e) {
    console.warn('[NativeCache] Failed to initialize:', e);
  }
};

/**
 * Get a value from the native cache
 * Returns null if not in Despia, cache miss, or expired
 */
export const getNativeCache = <T>(key: CacheKey, userId?: string): T | null => {
  if (!isDespia()) return null;
  
  const fullKey = userId ? `${CACHE_PREFIX}${key}_${userId}` : `${CACHE_PREFIX}${key}`;
  
  try {
    const raw = localStorage.getItem(fullKey);
    if (!raw) {
      perfLogger.logCacheResult(key, false);
      return null;
    }
    
    const entry: CacheEntry<T> = JSON.parse(raw);
    const now = Date.now();
    
    // Check if expired
    if (now - entry.timestamp > entry.ttlMs) {
      // Expired - remove and return null
      localStorage.removeItem(fullKey);
      perfLogger.logCacheResult(key, false, 'expired');
      return null;
    }
    
    perfLogger.logCacheResult(key, true);
    return entry.data;
  } catch (e) {
    // Corrupted cache - remove it
    try {
      localStorage.removeItem(fullKey);
    } catch {}
    console.warn('[NativeCache] Failed to read cache:', key, e);
    return null;
  }
};

/**
 * Set a value in the native cache
 * No-op if not in Despia
 */
export const setNativeCache = <T>(
  key: CacheKey,
  data: T,
  ttlMs: number,
  userId?: string
): void => {
  if (!isDespia()) return;
  
  const fullKey = userId ? `${CACHE_PREFIX}${key}_${userId}` : `${CACHE_PREFIX}${key}`;
  
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttlMs,
    };
    localStorage.setItem(fullKey, JSON.stringify(entry));
  } catch (e) {
    // Storage might be full or quota exceeded - fail silently
    console.warn('[NativeCache] Failed to write cache:', key, e);
  }
};

/**
 * Remove a specific cache entry
 */
export const removeNativeCache = (key: CacheKey, userId?: string): void => {
  if (!isDespia()) return;
  
  const fullKey = userId ? `${CACHE_PREFIX}${key}_${userId}` : `${CACHE_PREFIX}${key}`;
  
  try {
    localStorage.removeItem(fullKey);
  } catch (e) {
    console.warn('[NativeCache] Failed to remove cache:', key, e);
  }
};

/**
 * Clear all native cache entries
 * Call on logout or when cache needs full reset
 */
export const clearAllNativeCache = (): void => {
  if (!isDespia()) return;
  
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('[NativeCache] Cleared all cache entries:', keysToRemove.length);
  } catch (e) {
    console.warn('[NativeCache] Failed to clear cache:', e);
  }
};

/**
 * Clear all user-specific cache entries
 * Call when user logs out to clean up their cached data
 */
export const clearUserNativeCache = (userId: string): void => {
  if (!isDespia() || !userId) return;
  
  try {
    const keysToRemove: string[] = [];
    const userSuffix = `_${userId}`;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX) && key.endsWith(userSuffix)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('[NativeCache] Cleared user cache entries:', keysToRemove.length);
  } catch (e) {
    console.warn('[NativeCache] Failed to clear user cache:', e);
  }
};
