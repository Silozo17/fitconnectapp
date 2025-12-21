import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook to subscribe to real-time updates for the coach profile.
 * When an admin changes the coach's subscription tier, this will trigger
 * a refetch of the coach-related queries.
 */
export function useCoachProfileRealtime() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`coach-profile-realtime-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "coach_profiles",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Invalidate all coach-related queries when profile is updated
          queryClient.invalidateQueries({ queryKey: ["coach-profile", user.id] });
          queryClient.invalidateQueries({ queryKey: ["coach-onboarding-status", user.id] });
          queryClient.invalidateQueries({ queryKey: ["coach-clients"] });
          queryClient.invalidateQueries({ queryKey: ["coach-profile-completion", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);
}
