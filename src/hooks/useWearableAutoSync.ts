import { useEffect, useRef, useCallback } from 'react';
import { useSyncAllWearables } from './useSyncAllWearables';

const AUTO_SYNC_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

export const useWearableAutoSync = () => {
  const { syncAll, isSyncing, lastSyncedAt, hasConnectedDevices } = useSyncAllWearables();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAutoSyncRef = useRef<Date | null>(null);

  const shouldSync = useCallback(() => {
    // Don't sync if no devices connected
    if (!hasConnectedDevices) return false;
    
    // Don't sync if already syncing
    if (isSyncing) return false;
    
    // Don't sync if document is hidden (tab not active)
    if (typeof document !== 'undefined' && document.hidden) return false;
    
    // Don't sync if synced within the last 15 minutes
    const now = new Date();
    if (lastSyncedAt) {
      const timeSinceLastSync = now.getTime() - lastSyncedAt.getTime();
      if (timeSinceLastSync < AUTO_SYNC_INTERVAL_MS) return false;
    }
    
    // Also check our local auto-sync tracker to prevent rapid re-syncs
    if (lastAutoSyncRef.current) {
      const timeSinceAutoSync = now.getTime() - lastAutoSyncRef.current.getTime();
      if (timeSinceAutoSync < AUTO_SYNC_INTERVAL_MS) return false;
    }
    
    return true;
  }, [hasConnectedDevices, isSyncing, lastSyncedAt]);

  const performAutoSync = useCallback(async () => {
    if (!shouldSync()) return;
    
    console.log('[useWearableAutoSync] Performing auto-sync...');
    lastAutoSyncRef.current = new Date();
    
    try {
      await syncAll();
      console.log('[useWearableAutoSync] Auto-sync complete');
    } catch (error) {
      console.error('[useWearableAutoSync] Auto-sync failed:', error);
    }
  }, [shouldSync, syncAll]);

  useEffect(() => {
    // Set up interval for auto-sync
    intervalRef.current = setInterval(() => {
      performAutoSync();
    }, AUTO_SYNC_INTERVAL_MS);

    // Also sync on visibility change (when tab becomes active)
    const handleVisibilityChange = () => {
      if (!document.hidden && shouldSync()) {
        // Small delay to ensure everything is ready
        setTimeout(() => {
          performAutoSync();
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial sync if needed (on mount)
    if (shouldSync()) {
      // Delay initial sync slightly to allow app to fully load
      const initialSyncTimeout = setTimeout(() => {
        performAutoSync();
      }, 5000);
      
      return () => {
        clearTimeout(initialSyncTimeout);
        if (intervalRef.current) clearInterval(intervalRef.current);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [performAutoSync, shouldSync]);

  return {
    lastSyncedAt,
    isSyncing,
    hasConnectedDevices,
  };
};
