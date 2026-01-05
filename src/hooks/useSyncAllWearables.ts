import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWearables, WearableProvider } from "./useWearables";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { isHealthKitAvailable, syncHealthKit } from "@/lib/healthkit";

/**
 * Apple Health sync status - explicit states for honest UX
 */
export type AppleHealthSyncStatus = 
  | 'idle'
  | 'syncing'
  | 'success'
  | 'no-data'
  | 'failed';

export const useSyncAllWearables = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [appleHealthStatus, setAppleHealthStatus] = useState<AppleHealthSyncStatus>('idle');
  const queryClient = useQueryClient();
  const { connections } = useWearables();
  const { user } = useAuth();

  // Get the most recent sync time from all connections
  const lastSyncedAt = connections?.reduce((latest, conn) => {
    if (!conn.last_synced_at) return latest;
    const connDate = new Date(conn.last_synced_at);
    return !latest || connDate > latest ? connDate : latest;
  }, null as Date | null);

  /**
   * Sync Apple Health client-side using clean module
   */
  const syncAppleHealthClientSide = useCallback(async (clientId: string): Promise<{
    success: boolean;
    error?: string;
    dataPoints?: number;
  }> => {
    setAppleHealthStatus('syncing');
    
    try {
      const count = await syncHealthKit(clientId, 7);
      
      if (count > 0) {
        // Update last_synced_at
        const appleHealthConnection = connections?.find(c => c.provider === 'apple_health');
        if (appleHealthConnection) {
          await supabase
            .from('wearable_connections')
            .update({ last_synced_at: new Date().toISOString() })
            .eq('id', appleHealthConnection.id);
        }
        
        setAppleHealthStatus('success');
        setTimeout(() => setAppleHealthStatus('idle'), 2000);
        return { success: true, dataPoints: count };
      }
      
      setAppleHealthStatus('no-data');
      setTimeout(() => setAppleHealthStatus('idle'), 2000);
      return { success: true, dataPoints: 0 };
    } catch (error) {
      console.error('[useSyncAllWearables] Apple Health sync error:', error);
      setAppleHealthStatus('failed');
      setTimeout(() => setAppleHealthStatus('idle'), 2000);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [connections]);

  /**
   * Sync all connected wearables
   */
  const syncAll = async (options: { includeAppleHealth?: boolean } = {}) => {
    const { includeAppleHealth = true } = options;
    
    if (!connections || connections.length === 0) {
      toast.info("No wearable devices connected");
      return;
    }

    setIsSyncing(true);
    
    try {
      // Get client profile ID
      let clientId: string | null = null;
      if (user) {
        const { data: clientProfile } = await supabase
          .from("client_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();
        clientId = clientProfile?.id || null;
      }

      const results: { provider: WearableProvider; success: boolean; dataPoints?: number }[] = [];

      for (const connection of connections) {
        // Apple Health - client-side sync
        if (connection.provider === 'apple_health' && isHealthKitAvailable() && clientId && includeAppleHealth) {
          const result = await syncAppleHealthClientSide(clientId);
          results.push({
            provider: 'apple_health',
            success: result.success,
            dataPoints: result.dataPoints,
          });
          continue;
        }

        // Other providers - server-side sync
        if (connection.provider !== 'apple_health') {
          try {
            const { error } = await supabase.functions.invoke("wearable-sync", {
              body: { provider: connection.provider },
            });

            results.push({
              provider: connection.provider,
              success: !error,
            });
          } catch {
            results.push({
              provider: connection.provider,
              success: false,
            });
          }
        }
      }

      // Show results
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (successful.length > 0) {
        const totalPoints = successful.reduce((sum, r) => sum + (r.dataPoints || 0), 0);
        if (totalPoints > 0) {
          toast.success(`Synced ${totalPoints} data points from ${successful.length} device(s)`);
        } else {
          toast.success(`Synced ${successful.length} device(s) — no new data`);
        }
      }

      if (failed.length > 0) {
        toast.error(`Failed to sync ${failed.length} device(s)`);
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["wearable-connections"] });
      queryClient.invalidateQueries({ queryKey: ["health-data"] });
      queryClient.invalidateQueries({ queryKey: ["health-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["health-aggregation"] });

    } catch (error) {
      console.error('[useSyncAllWearables] Sync error:', error);
      toast.error("Failed to sync wearables");
    } finally {
      setIsSyncing(false);
    }
  };

  const hasConnectedDevices = (connections?.length || 0) > 0;

  return {
    syncAll,
    isSyncing,
    lastSyncedAt,
    appleHealthStatus,
    hasConnectedDevices,
  };
};
