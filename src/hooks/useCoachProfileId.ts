import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveProfile } from "@/hooks/useActiveProfile";

/**
 * Shared hook to get the coach profile ID with caching.
 * Uses React Query for efficient caching across components.
 */
export const useCoachProfileId = () => {
  const { user } = useAuth();
  const { profileId, isRoleSwitching, userId } = useActiveProfile();

  return useQuery({
    queryKey: ["coach-profile-id", userId, isRoleSwitching ? profileId : null],
    queryFn: async () => {
      // If role switching as admin, use the active profile ID directly
      if (isRoleSwitching && profileId) {
        return profileId;
      }

      // Otherwise fetch from database
      if (!userId) return null;

      const { data, error } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data?.id || null;
    },
    enabled: !!userId || (isRoleSwitching && !!profileId),
    staleTime: 1000 * 60 * 10, // 10 minutes - profile ID rarely changes
  });
};
