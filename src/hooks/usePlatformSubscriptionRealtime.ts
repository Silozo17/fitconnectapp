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
  const { data: coachProfileId } = useCoachProfileId();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!coachProfileId) return;

    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coachProfileId, queryClient]);
}
