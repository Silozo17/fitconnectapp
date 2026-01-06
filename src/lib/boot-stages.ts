/**
 * Boot Stage Markers for Android debugging
 * 
 * Records critical boot stages to sessionStorage for diagnostics.
 * This helps identify where the app stalls on Android devices.
 */

const STORAGE_KEY = "fc_boot_stages";

interface BootStage {
  stage: string;
  timestamp: number;
}

/**
 * Record a boot stage marker
 */
export const recordBootStage = (stage: string): void => {
  try {
    const existing = sessionStorage.getItem(STORAGE_KEY);
    const stages: BootStage[] = existing ? JSON.parse(existing) : [];
    
    // Prevent duplicate consecutive entries
    if (stages.length > 0 && stages[stages.length - 1].stage === stage) {
      return;
    }
    
    stages.push({
      stage,
      timestamp: Date.now(),
    });
    
    // Keep only last 20 stages to prevent storage bloat
    if (stages.length > 20) {
      stages.shift();
    }
    
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stages));
  } catch {
    // Ignore storage errors
  }
};

/**
 * Get all recorded boot stages
 */
export const getBootStages = (): BootStage[] => {
  try {
    const existing = sessionStorage.getItem(STORAGE_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch {
    return [];
  }
};

/**
 * Clear boot stages (call on successful app load)
 */
export const clearBootStages = (): void => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
};

// Boot stage constants for consistency
export const BOOT_STAGES = {
  APP_MOUNT: "app_mount",
  AUTH_LISTENER_ATTACHED: "auth_listener_attached",
  AUTH_STATE_RECEIVED: "auth_state_received",
  ROLE_FROM_CACHE: "role_from_cache",
  ROLE_FROM_METADATA: "role_from_metadata",
  ROLE_FROM_DB: "role_from_db",
  ROUTE_RESTORER_START: "route_restorer_start",
  ROUTE_RESTORER_COMPLETE: "route_restorer_complete",
  DASHBOARD_RENDERED: "dashboard_rendered",
  CHUNK_LOAD_ERROR: "chunk_load_error",
  RECOVERY_TRIGGERED: "recovery_triggered",
} as const;
