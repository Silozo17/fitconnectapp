import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { isDespia, triggerHaptic } from "@/lib/despia";
import { isHealthKitAvailable, connectHealthKit, syncHealthKit } from "@/lib/healthkit";
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

  // Handle native HealthKit connection for iOS - simplified using clean module
  const handleNativeHealthKitConnect = useCallback(async (): Promise<{ success: boolean }> => {
    if (!user) {
      toast.error("Please sign in to connect Apple Health");
      throw new Error("Not signed in");
    }

    // Get client profile ID
    const { data: clientProfile, error: profileError } = await supabase
      .from("client_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !clientProfile) {
      toast.error("Client profile not found");
      throw new Error("Client profile not found");
    }

    // Connect using clean module - triggers iOS permission dialog
    const connected = await connectHealthKit();

    if (!connected) {
      triggerHaptic('error');
      toast.error("Could not access Apple Health. Please check Settings → Privacy & Security → Health.", { duration: 8000 });
      throw new Error("HealthKit permission denied");
    }

    triggerHaptic('success');

    // Save connection to database
    const { data: existing } = await supabase
      .from("wearable_connections")
      .select("id")
      .eq("client_id", clientProfile.id)
      .eq("provider", "apple_health")
      .maybeSingle();

    if (existing) {
      await supabase
        .from("wearable_connections")
        .update({ is_active: true, last_synced_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("wearable_connections")
        .insert({
          client_id: clientProfile.id,
          provider: "apple_health" as const,
          is_active: true,
          provider_user_id: user.id,
          access_token: "native_healthkit",
        });
    }

    // Sync 7 days of data using clean module
    const count = await syncHealthKit(clientProfile.id, 7);
    
    if (count > 0) {
      toast.success(`Apple Health connected! Synced ${count} data points.`);
    } else {
      toast.success("Apple Health connected!");
    }

    queryClient.invalidateQueries({ queryKey: ["wearable-connections"] });
    queryClient.invalidateQueries({ queryKey: ["health-data"] });
    queryClient.invalidateQueries({ queryKey: ["health-metrics"] });
    
    return { success: true };
  }, [user, queryClient]);

  const connectWearable = useMutation({
    mutationFn: async (provider: WearableProvider) => {
      const isDespiaEnv = isDespia();
      const isIOSNativeNow = isDespiaEnv && /iPad|iPhone|iPod/i.test(navigator.userAgent);
      const isAndroidNativeNow = isDespiaEnv && /Android/i.test(navigator.userAgent);

      // For Apple Health on iOS native, use native HealthKit flow
      if (provider === "apple_health" && isIOSNativeNow) {
        await handleNativeHealthKitConnect();
        return { native: true };
      }

      // For Health Connect on Android native - not yet supported
      if (provider === "health_connect" && isAndroidNativeNow) {
        toast.info("Health Connect integration coming soon!", { duration: 6000 });
        return { native: true };
      }

      // For other providers, use OAuth flow
      const { data, error } = await supabase.functions.invoke("wearable-oauth-start", {
        body: { provider },
      });

      if (error) throw error;
      
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
      queryClient.invalidateQueries({ queryKey: ["health-data"] });
      queryClient.invalidateQueries({ queryKey: ["health-metrics"] });
      sessionStorage.setItem('healthkit_disconnect_time', Date.now().toString());
      toast.success("Wearable disconnected");
    },
    onError: () => {
      toast.error("Failed to disconnect wearable");
    },
  });

  const syncWearable = useMutation({
    mutationFn: async (provider: WearableProvider) => {
      // For Apple Health on iOS, sync client-side using clean module
      if (provider === "apple_health" && isHealthKitAvailable()) {
        const { data: clientProfile } = await supabase
          .from("client_profiles")
          .select("id")
          .eq("user_id", user!.id)
          .single();

        if (!clientProfile) throw new Error("Client profile not found");

        const count = await syncHealthKit(clientProfile.id, 7);

        // Update last_synced_at
        const connection = connections?.find(c => c.provider === 'apple_health');
        if (connection) {
          await supabase
            .from("wearable_connections")
            .update({ last_synced_at: new Date().toISOString() })
            .eq("id", connection.id);
        }

        return { synced: true, dataPoints: count };
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

  const getConnection = (provider: WearableProvider): WearableConnection | undefined => {
    return connections?.find(c => c.provider === provider);
  };

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
