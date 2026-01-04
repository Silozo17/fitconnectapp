import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSyncAllWearables } from './useSyncAllWearables';
import { useRegisterResumeHandler } from '@/contexts/ResumeManagerContext';
import { BACKGROUND_DELAYS } from '@/hooks/useAppResumeManager';

const AUTO_SYNC_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const MIN_SYNC_INTERVAL_MS = 60 * 1000; // 1 minute minimum between syncs
const RETRY_DELAY_MS = 5000; // 5 seconds delay before retry

export const useWearableAutoSync = () => {
  const { syncAll, isSyncing, lastSyncedAt, hasConnectedDevices } = useSyncAllWearables();
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAutoSyncRef = useRef<Date | null>(null);
  const retryCountRef = useRef<number>(0);

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

  const performAutoSync = useCallback(async (isRetry = false) => {
    // Refresh connection data first to get accurate lastSyncedAt
    await queryClient.refetchQueries({ queryKey: ["wearable-connections"], exact: false });
    
    if (!shouldSync()) return;
    
    /**
     * MULTI-METRIC APPLE HEALTH SYNC ENABLED
     * 
     * Now syncing all supported QUANTITY types every 15 minutes:
     * - Steps (HKQuantityTypeIdentifierStepCount)
     * - Calories (HKQuantityTypeIdentifierActiveEnergyBurned)
     * - Distance (HKQuantityTypeIdentifierDistanceWalkingRunning)
     * 
     * NOTE: HeartRate, Sleep, and ActiveMinutes are NOT synced due to Despia SDK crashes.
     * Users can enter these manually or sync from Fitbit/Garmin.
     */
    console.log(`[useWearableAutoSync] Performing auto-sync (all wearables INCLUDING Apple Health)... ${isRetry ? '[RETRY]' : ''}`);
    lastAutoSyncRef.current = new Date();
    
    try {
      // Include Apple Health in auto-sync on foreground/interval
      await syncAll({ includeAppleHealth: true });
      console.log('[useWearableAutoSync] Auto-sync complete (Apple Health included)');
      retryCountRef.current = 0; // Reset retry count on success
    } catch (error) {
      console.error('[useWearableAutoSync] Auto-sync failed:', error);
      
      // Simple retry mechanism: retry once after 5 seconds if first attempt fails
      if (!isRetry && retryCountRef.current < 1) {
        retryCountRef.current += 1;
        console.log(`[useWearableAutoSync] Scheduling retry in ${RETRY_DELAY_MS / 1000}s...`);
        setTimeout(() => {
          performAutoSync(true);
        }, RETRY_DELAY_MS);
      } else {
        retryCountRef.current = 0; // Reset after failed retry
      }
    }
  }, [shouldSync, syncAll, queryClient]);

  // Register with unified ResumeManager for visibility-triggered sync
  useRegisterResumeHandler(
    useMemo(() => ({
      id: 'wearable',
      priority: 'background' as const,
      delay: BACKGROUND_DELAYS.wearable,
      handler: () => {
        if (shouldSync()) {
          performAutoSync();
        }
      },
    }), [shouldSync, performAutoSync])
  );

  useEffect(() => {
    // Set up interval for auto-sync
    intervalRef.current = setInterval(() => {
      performAutoSync();
    }, AUTO_SYNC_INTERVAL_MS);

    // Initial sync if needed (on mount)
    if (shouldSync()) {
      // Delay initial sync slightly to allow app to fully load
      const initialSyncTimeout = setTimeout(() => {
        performAutoSync();
      }, 5000);
      
      return () => {
        clearTimeout(initialSyncTimeout);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [performAutoSync, shouldSync]);

  return {
    lastSyncedAt,
    isSyncing,
    hasConnectedDevices,
  };
};
