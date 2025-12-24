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

  // Helper function to sync HealthKit data to database using client_progress table
  const syncHealthDataToDatabase = useCallback(async (clientId: string, healthData: unknown, connectionId?: string) => {
    if (!healthData) {
      console.log('[useWearables] No health data to sync');
      return;
    }

    console.log('[useWearables] Syncing health data to database:', healthData);

    try {
      // Parse the health data based on its structure
      // HealthKit returns data in format: { HKQuantityTypeIdentifier...: [{ date, value, unit }] }
      const data = healthData as Record<string, Array<{ date?: string; value?: number; unit?: string; startDate?: string; endDate?: string }>>;
      
      // Group data by date for client_progress entries
      const dataByDate: Record<string, Record<string, number>> = {};
      
      for (const [metricType, readings] of Object.entries(data)) {
        if (!Array.isArray(readings)) continue;

        const mappedType = mapHealthKitToMetricType(metricType);
        
        for (const reading of readings) {
          if (reading.value === undefined || reading.value === null) continue;
          
          const dateStr = (reading.date || reading.startDate || new Date().toISOString()).split('T')[0];
          
          if (!dataByDate[dateStr]) {
            dataByDate[dateStr] = {};
          }
          
          // Aggregate values for the same day (sum for steps/calories, avg for heart rate)
          if (mappedType === 'heart_rate') {
            // Average for heart rate
            const existing = dataByDate[dateStr][mappedType];
            dataByDate[dateStr][mappedType] = existing 
              ? (existing + reading.value) / 2 
              : reading.value;
          } else {
            // Sum for steps, calories, distance
            dataByDate[dateStr][mappedType] = (dataByDate[dateStr][mappedType] || 0) + reading.value;
          }
        }
      }

      // Insert progress entries for each date
      const progressEntries = Object.entries(dataByDate).map(([date, measurements]) => ({
        client_id: clientId,
        recorded_at: date,
        data_source: 'apple_health',
        wearable_connection_id: connectionId || null,
        measurements: measurements,
        is_verified: true, // Data from wearable is verified
      }));

      if (progressEntries.length > 0) {
        console.log(`[useWearables] Inserting ${progressEntries.length} progress entries...`);
        
        // Insert entries - use individual inserts to handle duplicates gracefully
        for (const entry of progressEntries) {
          // Check if entry exists for this date
          const { data: existing } = await supabase
            .from('client_progress')
            .select('id, measurements')
            .eq('client_id', clientId)
            .eq('recorded_at', entry.recorded_at)
            .eq('data_source', 'apple_health')
            .maybeSingle();

          if (existing) {
            // Merge measurements with existing data
            const existingMeasurements = (existing.measurements as Record<string, unknown>) || {};
            const mergedMeasurements = {
              ...existingMeasurements,
              ...entry.measurements
            };
            
            await supabase
              .from('client_progress')
              .update({ measurements: mergedMeasurements as unknown as Json })
              .eq('id', existing.id);
          } else {
            await supabase
              .from('client_progress')
              .insert({
                ...entry,
                measurements: entry.measurements as unknown as Json
              });
          }
        }
        
        console.log(`[useWearables] Successfully synced ${progressEntries.length} days of health data`);
      } else {
        console.log('[useWearables] No health data to insert');
      }
    } catch (e) {
      console.error('[useWearables] Error syncing health data:', e);
    }
  }, []);

  // Map HealthKit type identifiers to our metric types
  const mapHealthKitToMetricType = (hkType: string): string => {
    const mappings: Record<string, string> = {
      'HKQuantityTypeIdentifierStepCount': 'steps',
      'HKQuantityTypeIdentifierActiveEnergyBurned': 'calories_burned',
      'HKQuantityTypeIdentifierDistanceWalkingRunning': 'distance',
      'HKQuantityTypeIdentifierHeartRate': 'heart_rate',
      'HKCategoryTypeIdentifierSleepAnalysis': 'sleep',
      'HKQuantityTypeIdentifierBodyMass': 'weight',
      'HKQuantityTypeIdentifierHeight': 'height',
      'HKQuantityTypeIdentifierFlightsClimbed': 'floors_climbed',
    };
    return mappings[hkType] || hkType.replace('HKQuantityTypeIdentifier', '').replace('HKCategoryTypeIdentifier', '').toLowerCase();
  };

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
