import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWearables, WearableProvider } from "./useWearables";
import { toast } from "sonner";
import { isDespia, syncHealthKitData } from "@/lib/despia";
import { useAuth } from "@/contexts/AuthContext";

// Type guard to check if data is a valid object with health data
const isValidHealthDataObject = (data: unknown): data is Record<string, unknown[]> => {
  if (!data || typeof data !== 'object') return false;
  if (Array.isArray(data)) return false;
  return true;
};

// Safe Object.keys wrapper that handles all edge cases
const safeObjectKeys = (obj: unknown): string[] => {
  try {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return [];
    return Object.keys(obj);
  } catch {
    return [];
  }
};

// Safe Object.entries wrapper
const safeObjectEntries = <T>(obj: unknown): [string, T][] => {
  try {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return [];
    return Object.entries(obj) as [string, T][];
  } catch {
    return [];
  }
};

export const useSyncAllWearables = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();
  const { connections } = useWearables();
  const { user } = useAuth();

  // Get the most recent sync time from all connections
  const lastSyncedAt = connections?.reduce((latest, conn) => {
    if (!conn.last_synced_at) return latest;
    const connDate = new Date(conn.last_synced_at);
    return !latest || connDate > latest ? connDate : latest;
  }, null as Date | null);

  // Helper to sync Apple Health data client-side
  const syncAppleHealthClientSide = useCallback(async (clientId: string) => {
    console.log('[useSyncAllWearables] Starting client-side Apple Health sync...');
    
    try {
      const result = await syncHealthKitData(7); // Sync 7 days
      
      // Validate result object exists
      if (!result) {
        console.log('[useSyncAllWearables] syncHealthKitData returned null/undefined');
        return { success: false, error: 'No response from HealthKit' };
      }

      if (!result.success) {
        console.error('[useSyncAllWearables] HealthKit sync failed:', result.error);
        return { success: false, error: result.error };
      }

      // TYPE GUARD: Validate result.data is a proper object before processing
      if (!result.data) {
        console.log('[useSyncAllWearables] No HealthKit data returned');
        return { success: true, dataPoints: 0 };
      }

      // Check if result.data is a valid object (not null, not array, not primitive)
      if (!isValidHealthDataObject(result.data)) {
        console.log('[useSyncAllWearables] Invalid HealthKit data format:', typeof result.data, Array.isArray(result.data) ? '(array)' : '');
        return { success: true, dataPoints: 0 };
      }

      console.log('[useSyncAllWearables] HealthKit data received:', result.data);
      
      // DEEP DEBUG: Log full raw response structure (safe now)
      console.log('[useSyncAllWearables] ==== DEEP DEBUG: RAW HEALTHKIT RESPONSE ====');
      console.log('[useSyncAllWearables] Response type:', typeof result.data);
      
      // Safe Object.keys call with fallback
      const responseKeys = safeObjectKeys(result.data);
      console.log('[useSyncAllWearables] Response keys:', responseKeys);
      console.log('[useSyncAllWearables] Full response JSON:', JSON.stringify(result.data, null, 2));

      // Process and sync the data - use type guard validated data
      const healthData = result.data as Record<string, Array<{ date?: string; value?: number; unit?: string; startDate?: string; endDate?: string }>>;
      
      /**
       * UNSUPPORTED CATEGORY TYPES - These cause native crashes with HKStatisticsCollectionQuery
       * Despia SDK uses HKStatisticsCollectionQuery which only works with QUANTITY types.
       * Category types require HKSampleQuery which is not currently supported.
       */
      const UNSUPPORTED_CATEGORY_TYPES = [
        'HKCategoryTypeIdentifierSleepAnalysis',
        'HKCategoryTypeIdentifierMindfulSession',
        'HKCategoryTypeIdentifierAppleStandHour',
      ];

      /**
       * TEMPORARY FIX: Only map step count to avoid Despia SDK crash
       * 
       * Despia's HealthKitManager.swift has hardcoded type identifiers that
       * cause crashes with HKStatisticsCollectionQuery. Until they fix it,
       * we only process step count data which is confirmed to work.
       * 
       * TODO: Re-enable when Despia fixes their SDK:
       * - 'HKQuantityTypeIdentifierActiveEnergyBurned': 'calories',
       * - 'HKQuantityTypeIdentifierDistanceWalkingRunning': 'distance',
       * - 'HKQuantityTypeIdentifierHeartRate': 'heart_rate',
       * - 'HKQuantityTypeIdentifierAppleExerciseTime': 'active_minutes',
       */
      const mapHealthKitToDataType = (hkType: string): string | null => {
        // Skip unsupported category types entirely
        if (UNSUPPORTED_CATEGORY_TYPES.some(cat => hkType.includes(cat))) {
          console.log(`[useSyncAllWearables] Skipping unsupported category type: ${hkType}`);
          return null;
        }
        
        // TEMPORARY: Only steps work reliably due to Despia SDK bug
        if (hkType === 'HKQuantityTypeIdentifierStepCount') {
          return 'steps';
        }
        
        console.log(`[useSyncAllWearables] Skipping ${hkType} - temporarily disabled due to Despia SDK bug`);
        return null;
      };

      const getUnitForDataType = (dataType: string): string => {
        const units: Record<string, string> = {
          'steps': 'count',
          'calories': 'kcal',
          'distance': 'meters',
          'heart_rate': 'bpm',
          'sleep': 'minutes',
          'active_minutes': 'minutes',
        };
        return units[dataType] || 'count';
      };

      // DEEP DEBUG: Log each type's structure (safe iteration)
      console.log('[useSyncAllWearables] ==== RAW DATA BY TYPE ====');
      const healthDataEntries = safeObjectEntries<unknown[]>(healthData);
      
      for (const [metricType, readings] of healthDataEntries) {
        console.log(`[useSyncAllWearables] Type "${metricType}":`);
        console.log(`  - Is Array: ${Array.isArray(readings)}`);
        console.log(`  - Length: ${Array.isArray(readings) ? readings.length : 'N/A'}`);
        if (Array.isArray(readings) && readings.length > 0 && readings[0]) {
          console.log(`  - First sample FULL:`, JSON.stringify(readings[0], null, 2));
          console.log(`  - All keys in first sample:`, safeObjectKeys(readings[0]));
          if (readings.length > 1 && readings[readings.length - 1]) {
            console.log(`  - Last sample FULL:`, JSON.stringify(readings[readings.length - 1], null, 2));
          }
        }
      }

      // Aggregate data by date and type
      const aggregatedData: Record<string, Record<string, { sum: number; count: number; maxValue?: number }>> = {};

      for (const [metricType, readings] of healthDataEntries) {
        if (!Array.isArray(readings)) {
          console.log(`[useSyncAllWearables] Skipping ${metricType} - not an array`);
          continue;
        }

        const dataType = mapHealthKitToDataType(metricType);
        if (!dataType) {
          console.log(`[useSyncAllWearables] Skipping unmapped type: ${metricType}`);
          continue;
        }

        // Sleep data is no longer synced from Apple Health due to Despia SDK limitation
        // (HKCategoryTypeIdentifierSleepAnalysis requires HKSampleQuery, not HKStatisticsCollectionQuery)
        // Sleep can still be synced from Fitbit/Garmin or entered manually

        // For cumulative metrics (steps, calories, distance), track the max value per day
        // HealthKit may return cumulative totals, so we want the highest value
        const cumulativeTypes = ['steps', 'calories', 'distance', 'active_minutes'];
        const isCumulative = cumulativeTypes.includes(dataType);

        for (const reading of readings) {
          // Handle null/undefined values gracefully
          if (reading === null || reading === undefined) {
            console.log(`[useSyncAllWearables] ${dataType}: Sample is null/undefined`);
            continue;
          }
          
          const readingObj = reading as { date?: string; startDate?: string; value?: number };
          
          if (readingObj.value === undefined || readingObj.value === null) {
            console.log(`[useSyncAllWearables] ${dataType}: Sample missing value field:`, JSON.stringify(reading));
            continue;
          }

          const dateStr = (readingObj.date || readingObj.startDate || new Date().toISOString()).split('T')[0];

          if (!aggregatedData[dateStr]) {
            aggregatedData[dateStr] = {};
          }
          if (!aggregatedData[dateStr][dataType]) {
            aggregatedData[dateStr][dataType] = { sum: 0, count: 0, maxValue: 0 };
          }

          aggregatedData[dateStr][dataType].sum += readingObj.value;
          aggregatedData[dateStr][dataType].count += 1;
          
          // Track max for cumulative types
          if (isCumulative && readingObj.value > (aggregatedData[dateStr][dataType].maxValue || 0)) {
            aggregatedData[dateStr][dataType].maxValue = readingObj.value;
          }
        }
      }
      
      // Log synced types summary
      const syncedTypes = new Set<string>();
      for (const types of Object.values(aggregatedData)) {
        for (const dataType of Object.keys(types)) {
          syncedTypes.add(dataType);
        }
      }
      console.log('[useSyncAllWearables] Successfully aggregated types:', [...syncedTypes]);
      
      console.log('[useSyncAllWearables] Aggregated data summary:');
      for (const [dateStr, types] of Object.entries(aggregatedData)) {
        for (const [dataType, data] of Object.entries(types)) {
          console.log(`  ${dateStr} ${dataType}: sum=${data.sum.toFixed(1)}, count=${data.count}, max=${data.maxValue || 'N/A'}`);
        }
      }

      // Build entries for health_data_sync table
      const healthDataSyncEntries: Array<{
        client_id: string;
        data_type: string;
        recorded_at: string;
        value: number;
        unit: string;
        source: 'apple_health';
        wearable_connection_id: null;
      }> = [];

      for (const [dateStr, types] of Object.entries(aggregatedData)) {
        for (const [dataType, { sum, count }] of Object.entries(types)) {
          const value = dataType === 'heart_rate' ? Math.round(sum / count) : sum;

          healthDataSyncEntries.push({
            client_id: clientId,
            data_type: dataType,
            recorded_at: dateStr,
            value: value,
            unit: getUnitForDataType(dataType),
            source: 'apple_health',
            wearable_connection_id: null,
          });
        }
      }

      if (healthDataSyncEntries.length > 0) {
        console.log(`[useSyncAllWearables] Upserting ${healthDataSyncEntries.length} Apple Health entries...`);

        const { error: upsertError } = await supabase
          .from('health_data_sync')
          .upsert(healthDataSyncEntries, {
            onConflict: 'client_id,data_type,recorded_at,source',
            ignoreDuplicates: false,
          });

        if (upsertError) {
          console.error('[useSyncAllWearables] Error upserting health data:', upsertError);
          return { success: false, error: upsertError.message };
        }

        // Update the Apple Health connection's last_synced_at
        const appleHealthConnection = connections?.find(c => c.provider === 'apple_health');
        if (appleHealthConnection) {
          await supabase
            .from('wearable_connections')
            .update({ last_synced_at: new Date().toISOString() })
            .eq('id', appleHealthConnection.id);
        }

        console.log(`[useSyncAllWearables] Successfully synced ${healthDataSyncEntries.length} Apple Health entries`);
        return { success: true, dataPoints: healthDataSyncEntries.length };
      }

      return { success: true, dataPoints: 0 };
    } catch (error) {
      console.error('[useSyncAllWearables] Apple Health sync error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [connections]);

  const syncAll = async () => {
    if (!connections || connections.length === 0) {
      toast.info("No wearable devices connected");
      return;
    }

    setIsSyncing(true);
    
    try {
      console.log('[useSyncAllWearables] Starting sync for all wearables...');
      
      // Get client profile ID for client-side syncs
      let clientId: string | null = null;
      if (user) {
        const { data: clientProfile } = await supabase
          .from("client_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();
        clientId = clientProfile?.id || null;
      }

      // Call the sync-all edge function for server-side providers (Fitbit, Garmin)
      const { data, error } = await supabase.functions.invoke("wearable-sync-all");

      if (error) throw error;

      console.log('[useSyncAllWearables] Edge function response:', data);

      // Immediately refetch connections to get updated last_synced_at
      await queryClient.refetchQueries({ queryKey: ["wearable-connections"], exact: false });

      let totalSynced = data?.synced || 0;
      let clientSideDataPoints = 0;

      // Check if we need to do client-side sync for Apple Health
      const hasAppleHealth = connections.some(c => c.provider === 'apple_health');
      const isDespiaEnv = isDespia();
      const isIOSNative = isDespiaEnv && /iPad|iPhone|iPod/i.test(navigator.userAgent);

      if (hasAppleHealth && isIOSNative && clientId) {
        console.log('[useSyncAllWearables] Triggering client-side Apple Health sync...');
        const appleResult = await syncAppleHealthClientSide(clientId);
        if (appleResult.success && appleResult.dataPoints) {
          clientSideDataPoints += appleResult.dataPoints;
        }
      }

      // Check if we need to do client-side sync for Health Connect
      const hasHealthConnect = connections.some(c => c.provider === 'health_connect');
      const isAndroidNative = isDespiaEnv && /Android/i.test(navigator.userAgent);

      if (hasHealthConnect && isAndroidNative && clientId) {
        console.log('[useSyncAllWearables] Health Connect sync would be triggered here...');
        // TODO: Implement Health Connect sync when available
      }

      // Refetch all relevant queries to refresh data immediately
      console.log('[useSyncAllWearables] Refetching all health-related queries...');
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["health-data"], exact: false }),
        queryClient.refetchQueries({ queryKey: ["wearable-connections"], exact: false }),
        queryClient.invalidateQueries({ queryKey: ["habits"] }),
        queryClient.invalidateQueries({ queryKey: ["habit-logs"] }),
        queryClient.invalidateQueries({ queryKey: ["challenges"] }),
        queryClient.invalidateQueries({ queryKey: ["challenge-participants"] }),
        queryClient.invalidateQueries({ queryKey: ["client-progress"] }),
        queryClient.invalidateQueries({ queryKey: ["client-badges"] }),
      ]);
      console.log('[useSyncAllWearables] Query refetch complete');

      const totalDataPoints = totalSynced + clientSideDataPoints;

      // Show appropriate toast based on what happened
      if (clientSideDataPoints > 0) {
        toast.success(`Synced ${clientSideDataPoints} data points from Apple Health`);
      } else if (hasAppleHealth && !isIOSNative) {
        // User has Apple Health connected but isn't on iOS native - let them know
        toast.info("Apple Health syncs from your iOS device. Open the app on your iPhone to sync latest data.", {
          duration: 5000,
        });
      } else if (totalSynced > 0) {
        toast.success(`Synced ${totalSynced} device${totalSynced > 1 ? "s" : ""}`);
      } else {
        toast.info("Sync complete - no new data available");
      }

      return { ...data, clientSideDataPoints };
    } catch (error) {
      console.error("Sync all wearables error:", error);
      toast.error("Failed to sync wearable data");
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    syncAll,
    isSyncing,
    lastSyncedAt,
    hasConnectedDevices: (connections?.length ?? 0) > 0,
  };
};
