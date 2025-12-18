import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWearables } from "./useWearables";
import { toast } from "sonner";

export const useSyncAllWearables = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();
  const { connections } = useWearables();

  // Get the most recent sync time from all connections
  const lastSyncedAt = connections?.reduce((latest, conn) => {
    if (!conn.last_synced_at) return latest;
    const connDate = new Date(conn.last_synced_at);
    return !latest || connDate > latest ? connDate : latest;
  }, null as Date | null);

  const syncAll = async () => {
    if (!connections || connections.length === 0) {
      toast.info("No wearable devices connected");
      return;
    }

    setIsSyncing(true);
    
    try {
      // Call the sync-all edge function which handles all connections
      const { data, error } = await supabase.functions.invoke("wearable-sync-all");

      if (error) throw error;

      // Invalidate all relevant queries to refresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["health-data"] }),
        queryClient.invalidateQueries({ queryKey: ["wearable-connections"] }),
        queryClient.invalidateQueries({ queryKey: ["habits"] }),
        queryClient.invalidateQueries({ queryKey: ["habit-logs"] }),
        queryClient.invalidateQueries({ queryKey: ["challenges"] }),
        queryClient.invalidateQueries({ queryKey: ["challenge-participants"] }),
        queryClient.invalidateQueries({ queryKey: ["client-progress"] }),
      ]);

      if (data?.synced > 0) {
        toast.success(`Synced ${data.synced} device${data.synced > 1 ? "s" : ""}`);
      } else {
        toast.info("No new data to sync");
      }

      return data;
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
