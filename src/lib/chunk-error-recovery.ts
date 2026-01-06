/**
 * Chunk Error Recovery
 * 
 * Detects dynamic import / chunk load failures and auto-recovers
 * by clearing caches and reloading. Critical for Despia Android
 * where stale cached assets can cause black screens.
 */

import { clearAllNativeCache } from "./native-cache";
import { clearViewState } from "./view-restoration";
import { recordBootStage, BOOT_STAGES } from "./boot-stages";

const RECOVERY_MARKER = "fc_chunk_recovery_attempted";
const RECOVERY_COOLDOWN_MS = 60000; // 1 minute cooldown between auto-recoveries

/**
 * Check if an error is a chunk/dynamic import failure
 */
export const isChunkLoadError = (error: Error | string): boolean => {
  const message = typeof error === "string" ? error : error?.message || "";
  const patterns = [
    "Failed to fetch dynamically imported module",
    "ChunkLoadError",
    "Loading chunk",
    "failed to load",
    "Loading CSS chunk",
    "Unable to preload CSS",
  ];
  
  return patterns.some((pattern) => 
    message.toLowerCase().includes(pattern.toLowerCase())
  );
};

/**
 * Check if we're in a recovery cooldown period
 */
const isInRecoveryCooldown = (): boolean => {
  try {
    const lastRecovery = sessionStorage.getItem(RECOVERY_MARKER);
    if (!lastRecovery) return false;
    
    const timestamp = parseInt(lastRecovery, 10);
    return Date.now() - timestamp < RECOVERY_COOLDOWN_MS;
  } catch {
    return false;
  }
};

/**
 * Perform chunk error recovery
 * Clears all caches and reloads to get fresh assets
 */
export const performChunkRecovery = async (): Promise<void> => {
  // Prevent recovery loops
  if (isInRecoveryCooldown()) {
    console.warn("[ChunkRecovery] In cooldown period, skipping auto-recovery");
    return;
  }
  
  recordBootStage(BOOT_STAGES.RECOVERY_TRIGGERED);
  
  try {
    // Mark recovery attempt
    sessionStorage.setItem(RECOVERY_MARKER, String(Date.now()));
    
    // Clear native cache
    clearAllNativeCache();
    
    // Clear view state
    clearViewState();
    
    // Unregister all service workers
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
    }
    
    // Clear all caches
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
    
    // Hard reload with cache busting
    window.location.href = `/auth?recovered=${Date.now()}`;
  } catch (error) {
    console.error("[ChunkRecovery] Recovery failed:", error);
    // Still try to reload even if cleanup fails
    window.location.href = `/auth?recovered=${Date.now()}`;
  }
};

/**
 * Handle a potential chunk load error
 * Returns true if it was a chunk error and recovery was triggered
 */
export const handlePotentialChunkError = (error: Error | string): boolean => {
  if (!isChunkLoadError(error)) {
    return false;
  }
  
  recordBootStage(BOOT_STAGES.CHUNK_LOAD_ERROR);
  console.warn("[ChunkRecovery] Chunk load error detected, triggering recovery");
  
  // Use setTimeout to allow the error to be logged before reload
  setTimeout(() => {
    performChunkRecovery();
  }, 100);
  
  return true;
};
