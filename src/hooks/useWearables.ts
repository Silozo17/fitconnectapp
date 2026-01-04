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

// Type guard to check if data is a valid object with health data
const isValidHealthDataObject = (data: unknown): data is Record<string, unknown[]> => {
  if (!data || typeof data !== 'object') return false;
  if (Array.isArray(data)) return false;
  return true;
};

// Safe Object.keys wrapper
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

  // Map HealthKit QUANTITY type identifiers to health_data_sync data types
  const mapHealthKitToDataType = (hkType: string): string | null => {
    // Skip unsupported category types entirely - they cause native crashes
    if (UNSUPPORTED_CATEGORY_TYPES.some(cat => hkType.includes(cat))) {
      return null;
    }
    
    const mappings: Record<string, string> = {
      'HKQuantityTypeIdentifierStepCount': 'steps',
      'HKQuantityTypeIdentifierActiveEnergyBurned': 'calories',
      'HKQuantityTypeIdentifierDistanceWalkingRunning': 'distance',
      'HKQuantityTypeIdentifierHeartRate': 'heart_rate',
      'HKQuantityTypeIdentifierAppleExerciseTime': 'active_minutes',
      'HKQuantityTypeIdentifierBodyMass': 'weight',
      // NOTE: Sleep (HKCategoryTypeIdentifierSleepAnalysis) removed - causes native crash
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
      return;
    }

    try {
      // TYPE GUARD: Validate healthData is a proper object before processing
      if (!isValidHealthDataObject(healthData)) {
        return;
      }

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

      const dataEntries = safeObjectEntries<unknown[]>(data);

      // Group data by date and type for aggregation
      const aggregatedData: Record<string, Record<string, { sum: number; count: number; maxValue?: number }>> = {};

      for (const [metricType, readings] of dataEntries) {
        if (!Array.isArray(readings)) continue;

        const dataType = mapHealthKitToDataType(metricType);
        if (!dataType) {
          continue;
        }

        // Sleep data is no longer synced from Apple Health due to Despia SDK limitation
        // (HKCategoryTypeIdentifierSleepAnalysis requires HKSampleQuery, not HKStatisticsCollectionQuery)
        // Sleep can still be synced from Fitbit/Garmin or entered manually

        // For cumulative metrics, track max value per day
        const cumulativeTypes = ['steps', 'calories', 'distance', 'active_minutes'];
        const isCumulative = cumulativeTypes.includes(dataType);

        for (const reading of readings) {
          // Handle null/undefined values gracefully
          if (reading === null || reading === undefined) {
            continue;
          }
          
          const readingObj = reading as { date?: string; startDate?: string; value?: number };
          
          if (readingObj.value === undefined || readingObj.value === null) {
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
          
          if (isCumulative && readingObj.value > (aggregatedData[dateStr][dataType].maxValue || 0)) {
            aggregatedData[dateStr][dataType].maxValue = readingObj.value;
          }
        }
      }

      // Convert aggregated data to entries
      for (const [dateStr, types] of Object.entries(aggregatedData)) {
        for (const [dataType, { sum, count }] of Object.entries(types)) {
          // For heart_rate, use average; for others, use sum
          let value = dataType === 'heart_rate' ? Math.round(sum / count) : sum;

          // Round whole-number metrics to avoid weird decimal display
          const wholeNumberTypes = ['steps', 'calories', 'active_minutes'];
          if (wholeNumberTypes.includes(dataType)) {
            value = Math.round(value);
          } else if (dataType === 'distance') {
            value = Math.round(value * 10) / 10; // 1 decimal for meters
          }

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

        // Trigger achievement checks
        supabase.functions.invoke('check-health-achievements', {
          body: { clientId }
        }).then(({ error }) => {
          if (error) console.error('[useWearables] Achievement check error:', error);
        });

        // Trigger challenge progress sync
        supabase.functions.invoke('sync-challenge-progress', {
          body: { clientId }
        }).then(({ error }) => {
          if (error) console.error('[useWearables] Challenge sync error:', error);
        });

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

    // Check for recent disconnect and enforce cooldown (prevents SDK state corruption)
    const disconnectTime = sessionStorage.getItem('healthkit_disconnect_time');
    if (disconnectTime) {
      const elapsed = Date.now() - parseInt(disconnectTime);
      if (elapsed < 1000) {
        console.log('[useWearables] Enforcing reconnect cooldown...');
        await new Promise(resolve => setTimeout(resolve, 1000 - elapsed));
      }
      sessionStorage.removeItem('healthkit_disconnect_time');
    }

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
    const result = await checkHealthKitConnection();

    if (!result.success) {
      triggerHaptic('error');
      const errorMsg = result.error || "Could not access Apple Health. Please check Settings → Privacy & Security → Health and enable permissions.";
      toast.error(errorMsg, { duration: 8000 });
      throw new Error(errorMsg);
    }

    // Success - user granted permissions
    triggerHaptic('success');

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
      await syncHealthDataToDatabase(clientProfile.id, result.data);
    }

    // Trigger a full sync of 7 days of data
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
      

      // For Apple Health on iOS native, use native HealthKit flow
      if (provider === "apple_health" && isIOSNativeNow) {
        await handleNativeHealthKitConnect();
        return { native: true };
      }

      // For Health Connect on Android native - currently not supported by Despia SDK
      // Users should connect their wearables to Health Connect directly
      if (provider === "health_connect" && isAndroidNativeNow) {
        toast.info(
          "Health Connect integration coming soon! In the meantime, make sure your wearable syncs to Health Connect on your phone.",
          { duration: 6000 }
        );
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
      // Immediately invalidate all health-related queries
      queryClient.invalidateQueries({ queryKey: ["wearable-connections"] });
      queryClient.invalidateQueries({ queryKey: ["health-data"] });
      queryClient.invalidateQueries({ queryKey: ["health-metrics"] });
      
      // Store disconnect timestamp to enforce cooldown on reconnect
      sessionStorage.setItem('healthkit_disconnect_time', Date.now().toString());
      
      toast.success("Wearable disconnected");
    },
    onError: () => {
      toast.error("Failed to disconnect wearable");
    },
  });

  const syncWearable = useMutation({
    mutationFn: async (provider: WearableProvider) => {
      // For Apple Health on iOS, sync must be done client-side
      const isDespiaEnv = isDespia();
      const isIOSNativeNow = isDespiaEnv && /iPad|iPhone|iPod/i.test(navigator.userAgent);

      if (provider === "apple_health" && isIOSNativeNow) {
        console.log('[useWearables] Syncing Apple Health client-side...');
        
        // Get client profile
        const { data: clientProfile } = await supabase
          .from("client_profiles")
          .select("id")
          .eq("user_id", user!.id)
          .single();

        if (!clientProfile) {
          throw new Error("Client profile not found");
        }

        const result = await syncHealthKitData(7);
        if (!result.success) {
          throw new Error(result.error || "Failed to sync Apple Health");
        }

        if (result.data) {
          await syncHealthDataToDatabase(clientProfile.id, result.data);
        }

        // Update last_synced_at
        const connection = connections?.find(c => c.provider === 'apple_health');
        if (connection) {
          await supabase
            .from("wearable_connections")
            .update({ last_synced_at: new Date().toISOString() })
            .eq("id", connection.id);
        }

        return { synced: true, dataPoints: result.data ? 1 : 0 };
      }

      // For other providers, use server-side sync
      const { data, error } = await supabase.functions.invoke("wearable-sync", {
        body: { provider },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wearable-connections"] });
      queryClient.invalidateQueries({ queryKey: ["health-data"] });
      toast.success("Wearable synced successfully");
    },
    onError: (error) => {
      toast.error("Failed to sync wearable: " + error.message);
    },
  });

  // Helper to get a specific connection by provider
  const getConnection = useCallback((provider: WearableProvider) => {
    return connections?.find(c => c.provider === provider) || null;
  }, [connections]);

  return {
    connections,
    isLoading,
    error,
    connectWearable,
    disconnectWearable,
    syncWearable,
    getConnection,
  };
};
