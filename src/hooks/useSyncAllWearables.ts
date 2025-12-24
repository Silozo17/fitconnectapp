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

      // Aggregate data by date and type
      const aggregatedData: Record<string, Record<string, { sum: number; count: number }>> = {};

      for (const [metricType, readings] of Object.entries(healthData)) {
        if (!Array.isArray(readings)) continue;

        const dataType = mapHealthKitToDataType(metricType);
        if (!dataType) continue;

        for (const reading of readings) {
          if (reading.value === undefined || reading.value === null) continue;

          const dateStr = (reading.date || reading.startDate || new Date().toISOString()).split('T')[0];

          if (!aggregatedData[dateStr]) {
            aggregatedData[dateStr] = {};
          }
          if (!aggregatedData[dateStr][dataType]) {
            aggregatedData[dateStr][dataType] = { sum: 0, count: 0 };
          }

          aggregatedData[dateStr][dataType].sum += reading.value;
          aggregatedData[dateStr][dataType].count += 1;
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
