import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEnvironment } from "@/hooks/useEnvironment";
import { 
  isDespia, 
  registerHealthKitCallbacks, 
  unregisterHealthKitCallbacks, 
  requestHealthKitPermissions,
  triggerHaptic
} from "@/lib/despia";
import { useEffect, useCallback } from "react";

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
  const { isIOS, isAndroid } = useEnvironment();
  const isIOSNative = isDespia() && isIOS;
  const isAndroidNative = isDespia() && isAndroid;

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

  // Handle native HealthKit connection for iOS
  const handleNativeHealthKitConnect = useCallback(async () => {
    if (!user) {
      toast.error("Please sign in to connect Apple Health");
      return;
    }

    // Get client profile ID
    const { data: clientProfile } = await supabase
      .from("client_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!clientProfile) {
      toast.error("Client profile not found");
      return;
    }

    // Register callbacks for HealthKit permission result
    registerHealthKitCallbacks({
      onSuccess: async () => {
        triggerHaptic('success');
        
        // Check if connection already exists
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
          // For native HealthKit, we use a placeholder access_token since 
          // the native SDK handles authentication, not OAuth tokens
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
          console.error("Failed to save Apple Health connection:", dbError);
          toast.error("Connected but failed to save. Please try again.");
        } else {
          toast.success("Apple Health connected successfully!");
          queryClient.invalidateQueries({ queryKey: ["wearable-connections"] });
        }
        
        unregisterHealthKitCallbacks();
      },
      onError: (errorMessage) => {
        triggerHaptic('error');
        toast.error("Failed to connect Apple Health: " + errorMessage);
        unregisterHealthKitCallbacks();
      },
    });

    // Trigger native HealthKit permission request
    const triggered = requestHealthKitPermissions();
    if (!triggered) {
      toast.error("Failed to request Apple Health permissions");
      unregisterHealthKitCallbacks();
    }
  }, [user, queryClient]);

  const connectWearable = useMutation({
    mutationFn: async (provider: WearableProvider) => {
      // For Apple Health on iOS native, use native HealthKit flow
      if (provider === "apple_health" && isIOSNative) {
        await handleNativeHealthKitConnect();
        return { native: true };
      }

      // For Health Connect on Android native, use native Health Connect flow
      if (provider === "health_connect" && isAndroidNative) {
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
