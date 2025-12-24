import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  isDespia, 
  checkHealthKitConnection,
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
      const errorMsg = result.error || "Unknown error";
      toast.error("Failed to connect Apple Health: " + errorMsg);
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
          access_token: "native_healthkit", // Placeholder for native SDK auth
        });
      dbError = error;
    }

    if (dbError) {
      console.error("[useWearables] Failed to save Apple Health connection:", dbError);
      toast.error("Connected but failed to save. Please try again.");
      throw dbError;
    }

    toast.success("Apple Health connected successfully!");
    queryClient.invalidateQueries({ queryKey: ["wearable-connections"] });
    
    return { success: true };
  }, [user, queryClient]);

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
