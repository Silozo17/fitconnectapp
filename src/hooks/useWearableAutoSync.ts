import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSyncAllWearables } from './useSyncAllWearables';

const AUTO_SYNC_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const MIN_SYNC_INTERVAL_MS = 60 * 1000; // 1 minute minimum between syncs

export const useWearableAutoSync = () => {
  const { syncAll, isSyncing, lastSyncedAt, hasConnectedDevices } = useSyncAllWearables();
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAutoSyncRef = useRef<Date | null>(null);

  const shouldSync = useCallback(() => {
    // Don't sync if no devices connected
    if (!hasConnectedDevices) {
      console.log('[useWearableAutoSync] Skip: no devices connected');
      return false;
    }
    
    // Don't sync if already syncing
    if (isSyncing) {
      console.log('[useWearableAutoSync] Skip: sync already in progress');
      return false;
    }
    
    // Don't sync if document is hidden (tab not active)
    if (typeof document !== 'undefined' && document.hidden) {
      console.log('[useWearableAutoSync] Skip: tab not active');
      return false;
    }
    
    const now = new Date();
    
    // Check local auto-sync tracker first (prevents rapid re-syncs)
    if (lastAutoSyncRef.current) {
      const timeSinceAutoSync = now.getTime() - lastAutoSyncRef.current.getTime();
      if (timeSinceAutoSync < MIN_SYNC_INTERVAL_MS) {
        console.log(`[useWearableAutoSync] Skip: auto-synced ${Math.round(timeSinceAutoSync / 1000)}s ago (min: ${MIN_SYNC_INTERVAL_MS / 1000}s)`);
        return false;
      }
    }
    
    // Don't sync if synced within the last 15 minutes (from any source)
    if (lastSyncedAt) {
      const timeSinceLastSync = now.getTime() - lastSyncedAt.getTime();
      if (timeSinceLastSync < AUTO_SYNC_INTERVAL_MS) {
        console.log(`[useWearableAutoSync] Skip: last sync was ${Math.round(timeSinceLastSync / 60000)} min ago (interval: ${AUTO_SYNC_INTERVAL_MS / 60000} min)`);
        return false;
      }
    }
    
    console.log('[useWearableAutoSync] Sync conditions met, proceeding...');
    return true;
  }, [hasConnectedDevices, isSyncing, lastSyncedAt]);

  const performAutoSync = useCallback(async () => {
    // Refresh connection data first to get accurate lastSyncedAt
    await queryClient.refetchQueries({ queryKey: ["wearable-connections"], exact: false });
    
    if (!shouldSync()) return;
    
    console.log('[useWearableAutoSync] Performing auto-sync...');
    lastAutoSyncRef.current = new Date();
    
    try {
      await syncAll();
      console.log('[useWearableAutoSync] Auto-sync complete');
    } catch (error) {
      console.error('[useWearableAutoSync] Auto-sync failed:', error);
    }
  }, [shouldSync, syncAll, queryClient]);

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
