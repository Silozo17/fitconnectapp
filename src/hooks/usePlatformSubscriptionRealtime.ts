import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCoachProfileId } from "@/hooks/useCoachProfileId";

/**
 * Hook to subscribe to real-time updates for platform_subscriptions.
 * When a subscription changes (IAP purchase, upgrade, downgrade, cancellation),
 * this will trigger a refetch of subscription-related queries.
 */
export function usePlatformSubscriptionRealtime() {
  let coachProfileId: string | null | undefined;
  
  try {
    const result = useCoachProfileId();
    coachProfileId = result.data;
  } catch (error) {
    console.warn('[usePlatformSubscriptionRealtime] Failed to get coach profile ID:', error);
    coachProfileId = null;
  }
  
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!coachProfileId) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    try {
      channel = supabase
        .channel(`platform-subscription-realtime-${coachProfileId}`)
        .on(
          "postgres_changes",
          {
            event: "*", // Listen to INSERT, UPDATE, DELETE
            schema: "public",
            table: "platform_subscriptions",
            filter: `coach_id=eq.${coachProfileId}`,
          },
          (payload) => {
            console.log("[usePlatformSubscriptionRealtime] Subscription changed:", payload.eventType);
            
            // Invalidate all subscription-related queries immediately
            queryClient.invalidateQueries({ 
              queryKey: ["subscription-status", coachProfileId],
              refetchType: "all"
            });
            queryClient.invalidateQueries({ 
              queryKey: ["platform-subscription", coachProfileId],
              refetchType: "all"
            });
            queryClient.invalidateQueries({ 
              queryKey: ["feature-access"],
              refetchType: "all"
            });
            queryClient.invalidateQueries({ 
              queryKey: ["coach-profile", coachProfileId],
              refetchType: "all"
            });
          }
        )
        .subscribe();
    } catch (error) {
      console.error('[usePlatformSubscriptionRealtime] Error setting up channel:', error);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [coachProfileId, queryClient]);
}
