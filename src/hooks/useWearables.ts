import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  isDespia, 
  checkHealthKitConnection,
  syncHealthKitData,
  triggerHaptic
} from "@/lib/despia";
import { useCallback } from "react";
import type { Json } from "@/integrations/supabase/types";

export type WearableProvider = "health_connect" | "fitbit" | "garmin" | "apple_health";

interface WearableConnection {
  id: string;
  client_id: string;
  provider: WearableProvider;
  provider_user_id: string | null;
  last_synced_at: string | null;
  is_active: boolean;
  created_at: string;
}

export const useWearables = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: connections, isLoading, error } = useQuery({
    queryKey: ["wearable-connections", user?.id],
    queryFn: async () => {
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user!.id)
        .single();

      if (!clientProfile) return [];

      const { data, error } = await supabase
        .from("wearable_connections")
        .select("id, client_id, provider, provider_user_id, last_synced_at, is_active, created_at")
        .eq("client_id", clientProfile.id)
        .eq("is_active", true);

      if (error) throw error;
      return data as WearableConnection[];
    },
    enabled: !!user,
  });

  // Map HealthKit type identifiers to health_data_sync data types
  const mapHealthKitToDataType = (hkType: string): string | null => {
    const mappings: Record<string, string> = {
      'HKQuantityTypeIdentifierStepCount': 'steps',
      'HKQuantityTypeIdentifierActiveEnergyBurned': 'calories',
      'HKQuantityTypeIdentifierDistanceWalkingRunning': 'distance',
      'HKQuantityTypeIdentifierHeartRate': 'heart_rate',
      'HKCategoryTypeIdentifierSleepAnalysis': 'sleep',
      'HKQuantityTypeIdentifierAppleExerciseTime': 'active_minutes',
      'HKQuantityTypeIdentifierBodyMass': 'weight',
    };
    return mappings[hkType] || null;
  };

  // Get the appropriate unit for each data type
  const getUnitForDataType = (dataType: string): string => {
    const units: Record<string, string> = {
      'steps': 'count',
      'calories': 'kcal',
      'distance': 'meters',
      'heart_rate': 'bpm',
      'sleep': 'minutes',
      'active_minutes': 'minutes',
      'weight': 'kg',
    };
    return units[dataType] || 'count';
  };

  // Helper function to sync HealthKit data to health_data_sync table
  const syncHealthDataToDatabase = useCallback(async (clientId: string, healthData: unknown, connectionId?: string) => {
    if (!healthData) {
      console.log('[useWearables] No health data to sync');
      return;
    }

    console.log('[useWearables] Syncing health data to health_data_sync:', healthData);

    try {
      // Parse the health data based on its structure
      // HealthKit returns data in format: { HKQuantityTypeIdentifier...: [{ date, value, unit }] }
      const data = healthData as Record<string, Array<{ date?: string; value?: number; unit?: string; startDate?: string; endDate?: string }>>;
      
      // Build entries for health_data_sync table
      const healthDataEntries: Array<{
        client_id: string;
        data_type: string;
        recorded_at: string;
        value: number;
        unit: string;
        source: 'apple_health' | 'fitbit' | 'garmin' | 'health_connect' | 'manual';
        wearable_connection_id: string | null;
      }> = [];

      // Log raw data for debugging
      console.log('[useWearables] Raw HealthKit data by type:');
      for (const [metricType, readings] of Object.entries(data)) {
        console.log(`  ${metricType}: ${Array.isArray(readings) ? readings.length : 0} readings`);
        if (Array.isArray(readings) && readings.length > 0) {
          console.log('    First sample:', JSON.stringify(readings[0]));
        }
      }

      // Group data by date and type for aggregation
      const aggregatedData: Record<string, Record<string, { sum: number; count: number; maxValue?: number }>> = {};

      for (const [metricType, readings] of Object.entries(data)) {
        if (!Array.isArray(readings)) continue;

        const dataType = mapHealthKitToDataType(metricType);
        if (!dataType) {
          console.log(`[useWearables] Skipping unmapped metric type: ${metricType}`);
          continue;
        }

        // Special handling for sleep data - calculate duration from startDate/endDate
        if (dataType === 'sleep') {
          console.log(`[useWearables] Processing ${readings.length} sleep samples...`);
          for (const reading of readings) {
            const startDate = reading.startDate ? new Date(reading.startDate) : null;
            const endDate = reading.endDate ? new Date(reading.endDate) : null;
            
            // Skip if missing dates
            if (!startDate || !endDate) continue;
            
            // Skip "awake" samples (value=2) and "inBed" only (value=0)
            // Value 1 = asleepUnspecified, 3 = asleepCore, 4 = asleepDeep, 5 = asleepREM
            const sleepValue = reading.value;
            if (sleepValue === 0 || sleepValue === 2) continue;
            
            const durationMinutes = (endDate.getTime() - startDate.getTime()) / 60000;
            if (durationMinutes <= 0) continue;
            
            // Use end date as recorded date (when you wake up)
            const dateStr = endDate.toISOString().split('T')[0];
            
            if (!aggregatedData[dateStr]) aggregatedData[dateStr] = {};
            if (!aggregatedData[dateStr]['sleep']) {
              aggregatedData[dateStr]['sleep'] = { sum: 0, count: 0 };
            }
            
            aggregatedData[dateStr]['sleep'].sum += durationMinutes;
            aggregatedData[dateStr]['sleep'].count += 1;
            console.log(`[useWearables] Sleep: ${durationMinutes.toFixed(1)} min on ${dateStr}`);
          }
          continue; // Skip normal processing for sleep
        }

        // For cumulative metrics, track max value per day
        const cumulativeTypes = ['steps', 'calories', 'distance', 'active_minutes'];
        const isCumulative = cumulativeTypes.includes(dataType);

        for (const reading of readings) {
          if (reading.value === undefined || reading.value === null) continue;

          const dateStr = (reading.date || reading.startDate || new Date().toISOString()).split('T')[0];

          if (!aggregatedData[dateStr]) {
            aggregatedData[dateStr] = {};
          }
          if (!aggregatedData[dateStr][dataType]) {
            aggregatedData[dateStr][dataType] = { sum: 0, count: 0, maxValue: 0 };
          }

          aggregatedData[dateStr][dataType].sum += reading.value;
          aggregatedData[dateStr][dataType].count += 1;
          
          if (isCumulative && reading.value > (aggregatedData[dateStr][dataType].maxValue || 0)) {
            aggregatedData[dateStr][dataType].maxValue = reading.value;
          }
        }
      }
      
      console.log('[useWearables] Aggregated data:', aggregatedData);

      // Convert aggregated data to entries
      for (const [dateStr, types] of Object.entries(aggregatedData)) {
        for (const [dataType, { sum, count }] of Object.entries(types)) {
          // For heart_rate, use average; for others, use sum
          const value = dataType === 'heart_rate' ? Math.round(sum / count) : sum;

          healthDataEntries.push({
            client_id: clientId,
            data_type: dataType,
            recorded_at: dateStr,
            value: value,
            unit: getUnitForDataType(dataType),
            source: 'apple_health',
            wearable_connection_id: connectionId || null,
          });
        }
      }

      if (healthDataEntries.length > 0) {
        console.log(`[useWearables] Upserting ${healthDataEntries.length} health_data_sync entries...`);

        // Upsert entries - the table has a unique constraint on (client_id, data_type, recorded_at, source)
        const { error: upsertError } = await supabase
          .from('health_data_sync')
          .upsert(healthDataEntries, {
            onConflict: 'client_id,data_type,recorded_at,source',
            ignoreDuplicates: false,
          });

        if (upsertError) {
          console.error('[useWearables] Error upserting health data:', upsertError);
          throw upsertError;
        }

        console.log(`[useWearables] Successfully synced ${healthDataEntries.length} health data entries`);

        // Trigger achievement checks
        console.log('[useWearables] Triggering achievement check...');
        supabase.functions.invoke('check-health-achievements', {
          body: { clientId }
        }).then(({ error }) => {
          if (error) console.error('[useWearables] Achievement check error:', error);
          else console.log('[useWearables] Achievement check completed');
        });

        // Trigger challenge progress sync
        console.log('[useWearables] Triggering challenge progress sync...');
        supabase.functions.invoke('sync-challenge-progress', {
          body: { clientId }
        }).then(({ error }) => {
          if (error) console.error('[useWearables] Challenge sync error:', error);
          else console.log('[useWearables] Challenge sync completed');
        });

      } else {
        console.log('[useWearables] No health data to insert');
      }
    } catch (e) {
      console.error('[useWearables] Error syncing health data:', e);
    }
  }, []);

  // Handle native HealthKit connection for iOS using correct Despia SDK pattern
  const handleNativeHealthKitConnect = useCallback(async (): Promise<{ success: boolean }> => {
    if (!user) {
      toast.error("Please sign in to connect Apple Health");
      throw new Error("Not signed in");
    }

    console.log('[useWearables] Starting native HealthKit connection...');

    // Get client profile ID
    const { data: clientProfile, error: profileError } = await supabase
      .from("client_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !clientProfile) {
      console.error('[useWearables] Client profile not found:', profileError);
      toast.error("Client profile not found");
      throw new Error("Client profile not found");
    }

    // Attempt to connect using the correct Despia SDK pattern
    // This triggers the iOS permission dialog automatically on first read
    console.log('[useWearables] Calling checkHealthKitConnection...');
    const result = await checkHealthKitConnection();
    
    console.log('[useWearables] HealthKit connection result:', result);

    if (!result.success) {
      triggerHaptic('error');
      const errorMsg = result.error || "Could not access Apple Health. Please check Settings → Privacy & Security → Health and enable permissions.";
      toast.error(errorMsg, { duration: 8000 });
      throw new Error(errorMsg);
    }

    // Success - user granted permissions
    triggerHaptic('success');
    console.log('[useWearables] HealthKit permission granted, saving to database...');

    // Save connection to database
    const { data: existing } = await supabase
      .from("wearable_connections")
      .select("id")
      .eq("client_id", clientProfile.id)
      .eq("provider", "apple_health")
      .maybeSingle();

    let dbError = null;

    if (existing) {
      // Update existing connection
      const { error } = await supabase
        .from("wearable_connections")
        .update({ is_active: true, last_synced_at: new Date().toISOString() })
        .eq("id", existing.id);
      dbError = error;
    } else {
      // Insert new connection
      const { error } = await supabase
        .from("wearable_connections")
        .insert({
          client_id: clientProfile.id,
          provider: "apple_health" as const,
          is_active: true,
          provider_user_id: user.id,
          access_token: "native_healthkit",
        });
      dbError = error;
    }

    if (dbError) {
      console.error("[useWearables] Failed to save Apple Health connection:", dbError);
      toast.error("Connected but failed to save. Please try again.");
      throw dbError;
    }

    // If we got initial health data, sync it
    if (result.data) {
      console.log('[useWearables] Syncing initial health data...');
      await syncHealthDataToDatabase(clientProfile.id, result.data);
    }

    // Trigger a full sync of 7 days of data
    console.log('[useWearables] Fetching 7 days of health data...');
    const fullSyncResult = await syncHealthKitData(7);
    if (fullSyncResult.success && fullSyncResult.data) {
      await syncHealthDataToDatabase(clientProfile.id, fullSyncResult.data);
      toast.success("Apple Health connected and synced!");
    } else {
      toast.success("Apple Health connected!");
    }

    queryClient.invalidateQueries({ queryKey: ["wearable-connections"] });
    queryClient.invalidateQueries({ queryKey: ["health-data"] });
    queryClient.invalidateQueries({ queryKey: ["health-metrics"] });
    
    return { success: true };
  }, [user, queryClient, syncHealthDataToDatabase]);

  const connectWearable = useMutation({
    mutationFn: async (provider: WearableProvider) => {
      // Evaluate platform detection at mutation execution time, not at render time
      // This fixes the closure capture bug where isIOS/isAndroid from useEnvironment
      // may not have updated yet when the mutation is created
      const isDespiaEnv = isDespia();
      const isIOSNativeNow = isDespiaEnv && /iPad|iPhone|iPod/i.test(navigator.userAgent);
      const isAndroidNativeNow = isDespiaEnv && /Android/i.test(navigator.userAgent);
      
      console.log('[useWearables] Platform detection at mutation time:', {
        provider,
        isDespiaEnv,
        isIOSNativeNow,
        isAndroidNativeNow,
        userAgent: navigator.userAgent
      });

      // For Apple Health on iOS native, use native HealthKit flow
      if (provider === "apple_health" && isIOSNativeNow) {
        console.log('[useWearables] Using native HealthKit flow');
        await handleNativeHealthKitConnect();
        return { native: true };
      }

      // For Health Connect on Android native, use native Health Connect flow
      if (provider === "health_connect" && isAndroidNativeNow) {
        console.log('[useWearables] Using native Health Connect flow');
        // TODO: Implement native Health Connect flow when available
        toast.info("Health Connect integration coming soon");
        return { native: true };
      }

      // For other providers, use OAuth flow via edge function
      const { data, error } = await supabase.functions.invoke("wearable-oauth-start", {
        body: { provider },
      });

      if (error) throw error;
      
      // Redirect to OAuth URL
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
      
      return data;
    },
    onError: (error) => {
      toast.error("Failed to connect wearable: " + error.message);
    },
  });

  const disconnectWearable = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from("wearable_connections")
        .update({ is_active: false })
        .eq("id", connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wearable-connections"] });
      toast.success("Wearable disconnected successfully");
    },
    onError: (error) => {
      toast.error("Failed to disconnect: " + error.message);
    },
  });

  const syncWearable = useMutation({
    mutationFn: async (connectionId: string) => {
      const { data, error } = await supabase.functions.invoke("wearable-sync", {
        body: { connectionId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wearable-connections"] });
      queryClient.invalidateQueries({ queryKey: ["health-data"] });
      toast.success("Health data synced successfully");
    },
    onError: (error) => {
      toast.error("Failed to sync: " + error.message);
    },
  });

  const isConnected = (provider: WearableProvider) => {
    return connections?.some((c) => c.provider === provider && c.is_active);
  };

  const getConnection = (provider: WearableProvider) => {
    return connections?.find((c) => c.provider === provider && c.is_active);
  };

  return {
    connections,
    isLoading,
    error,
    connectWearable,
    disconnectWearable,
    syncWearable,
    isConnected,
    getConnection,
  };
};
