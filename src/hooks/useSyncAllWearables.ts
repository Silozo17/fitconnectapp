import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWearables, WearableProvider } from "./useWearables";
import { toast } from "sonner";
import { isDespia, syncHealthKitData } from "@/lib/despia";
import { useAuth } from "@/contexts/AuthContext";

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
      
      if (!result.success) {
        console.error('[useSyncAllWearables] HealthKit sync failed:', result.error);
        return { success: false, error: result.error };
      }

      if (!result.data) {
        console.log('[useSyncAllWearables] No HealthKit data returned');
        return { success: true, dataPoints: 0 };
      }

      console.log('[useSyncAllWearables] HealthKit data received:', result.data);
      
      // DEEP DEBUG: Log full raw response structure
      console.log('[useSyncAllWearables] ==== DEEP DEBUG: RAW HEALTHKIT RESPONSE ====');
      console.log('[useSyncAllWearables] Response type:', typeof result.data);
      console.log('[useSyncAllWearables] Response keys:', Object.keys(result.data as object));
      console.log('[useSyncAllWearables] Full response JSON:', JSON.stringify(result.data, null, 2));

      // Process and sync the data
      const healthData = result.data as Record<string, Array<{ date?: string; value?: number; unit?: string; startDate?: string; endDate?: string }>>;
      
      // Map HealthKit types to our data types
      const mapHealthKitToDataType = (hkType: string): string | null => {
        const mappings: Record<string, string> = {
          'HKQuantityTypeIdentifierStepCount': 'steps',
          'HKQuantityTypeIdentifierActiveEnergyBurned': 'calories',
          'HKQuantityTypeIdentifierDistanceWalkingRunning': 'distance',
          'HKQuantityTypeIdentifierHeartRate': 'heart_rate',
          'HKCategoryTypeIdentifierSleepAnalysis': 'sleep',
          'HKQuantityTypeIdentifierAppleExerciseTime': 'active_minutes',
        };
        return mappings[hkType] || null;
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

      // SLEEP_VALUES: Actual sleep stages to include (exclude 0=inBed, 2=awake)
      const SLEEP_VALUES = [1, 3, 4, 5]; // 1=asleepUnspecified, 3=asleepCore, 4=asleepDeep, 5=asleepREM

      // DEEP DEBUG: Log each type's structure
      console.log('[useSyncAllWearables] ==== RAW DATA BY TYPE ====');
      for (const [metricType, readings] of Object.entries(healthData)) {
        console.log(`[useSyncAllWearables] Type "${metricType}":`);
        console.log(`  - Is Array: ${Array.isArray(readings)}`);
        console.log(`  - Length: ${Array.isArray(readings) ? readings.length : 'N/A'}`);
        if (Array.isArray(readings) && readings.length > 0) {
          console.log(`  - First sample FULL:`, JSON.stringify(readings[0], null, 2));
          console.log(`  - All keys in first sample:`, Object.keys(readings[0]));
          if (readings.length > 1) {
            console.log(`  - Last sample FULL:`, JSON.stringify(readings[readings.length - 1], null, 2));
          }
        }
      }

      // Aggregate data by date and type
      const aggregatedData: Record<string, Record<string, { sum: number; count: number; maxValue?: number }>> = {};

      for (const [metricType, readings] of Object.entries(healthData)) {
        if (!Array.isArray(readings)) continue;

        const dataType = mapHealthKitToDataType(metricType);
        if (!dataType) {
          console.log(`[useSyncAllWearables] Skipping unmapped type: ${metricType}`);
          continue;
        }

        // Special handling for sleep data - calculate duration from startDate/endDate
        if (dataType === 'sleep') {
          console.log(`[useSyncAllWearables] Processing ${readings.length} sleep samples...`);
          let processedCount = 0;
          let skippedMissingDates = 0;
          let skippedNonSleep = 0;
          let skippedInvalidDuration = 0;
          
          for (const reading of readings) {
            // Handle null/undefined values
            if (reading === null || reading === undefined) {
              console.log('[useSyncAllWearables] Sleep sample is null/undefined');
              continue;
            }
            
            const startDate = reading.startDate ? new Date(reading.startDate) : null;
            const endDate = reading.endDate ? new Date(reading.endDate) : null;
            
            // Skip if missing dates
            if (!startDate || !endDate) {
              skippedMissingDates++;
              console.log('[useSyncAllWearables] Skipping sleep sample - missing dates:', JSON.stringify(reading));
              continue;
            }
            
            // Explicitly include only actual sleep values using SLEEP_VALUES array
            const sleepValue = reading.value;
            if (!SLEEP_VALUES.includes(sleepValue as number)) {
              skippedNonSleep++;
              console.log(`[useSyncAllWearables] Skipping non-sleep sample (value=${sleepValue})`);
              continue;
            }
            
            const durationMinutes = (endDate.getTime() - startDate.getTime()) / 60000;
            if (durationMinutes <= 0) {
              skippedInvalidDuration++;
              console.log('[useSyncAllWearables] Skipping sleep sample - invalid duration');
              continue;
            }
            
            // Use end date as recorded date (when you wake up determines the "day")
            const dateStr = endDate.toISOString().split('T')[0];
            
            if (!aggregatedData[dateStr]) aggregatedData[dateStr] = {};
            if (!aggregatedData[dateStr]['sleep']) {
              aggregatedData[dateStr]['sleep'] = { sum: 0, count: 0 };
            }
            
            aggregatedData[dateStr]['sleep'].sum += durationMinutes;
            aggregatedData[dateStr]['sleep'].count += 1;
            processedCount++;
            console.log(`[useSyncAllWearables] Sleep: ${durationMinutes.toFixed(1)} min on ${dateStr} (total: ${aggregatedData[dateStr]['sleep'].sum.toFixed(1)} min)`);
          }
          
          console.log(`[useSyncAllWearables] Sleep summary: ${processedCount} processed, ${skippedMissingDates} missing dates, ${skippedNonSleep} non-sleep, ${skippedInvalidDuration} invalid duration`);
          continue; // Skip normal processing for sleep
        }

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
          
          if (reading.value === undefined || reading.value === null) {
            console.log(`[useSyncAllWearables] ${dataType}: Sample missing value field:`, JSON.stringify(reading));
            continue;
          }

          const dateStr = (reading.date || reading.startDate || new Date().toISOString()).split('T')[0];

          if (!aggregatedData[dateStr]) {
            aggregatedData[dateStr] = {};
          }
          if (!aggregatedData[dateStr][dataType]) {
            aggregatedData[dateStr][dataType] = { sum: 0, count: 0, maxValue: 0 };
          }

          aggregatedData[dateStr][dataType].sum += reading.value;
          aggregatedData[dateStr][dataType].count += 1;
          
          // Track max for cumulative types
          if (isCumulative && reading.value > (aggregatedData[dateStr][dataType].maxValue || 0)) {
            aggregatedData[dateStr][dataType].maxValue = reading.value;
          }
        }
      }
      
      // Log synced types summary
      const syncedTypes = new Set<string>();
      for (const [dateStr, types] of Object.entries(aggregatedData)) {
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
      const healthDataEntries: Array<{
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

          healthDataEntries.push({
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

      if (healthDataEntries.length > 0) {
        console.log(`[useSyncAllWearables] Upserting ${healthDataEntries.length} Apple Health entries...`);

        const { error: upsertError } = await supabase
          .from('health_data_sync')
          .upsert(healthDataEntries, {
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

        console.log(`[useSyncAllWearables] Successfully synced ${healthDataEntries.length} Apple Health entries`);
        return { success: true, dataPoints: healthDataEntries.length };
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
