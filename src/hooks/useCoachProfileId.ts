import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { getNativeCache, setNativeCache, CACHE_KEYS, CACHE_TTL } from "@/lib/native-cache";

/**
 * Shared hook to get the coach profile ID with caching.
 * Uses React Query for efficient caching across components.
 * Native apps get instant profile ID from device cache on cold start.
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
      
      const id = data?.id || null;
      
      // Cache for native app cold start optimization
      if (id && userId) {
        setNativeCache(CACHE_KEYS.COACH_PROFILE_ID, id, CACHE_TTL.PROFILE_ID, userId);
      }
      
      return id;
    },
    enabled: !!userId || (isRoleSwitching && !!profileId),
    staleTime: 1000 * 60 * 10, // 10 minutes - profile ID rarely changes
    // Native: Use cached value as initial data for instant render
    initialData: () => {
      if (!userId) return undefined;
      return getNativeCache<string>(CACHE_KEYS.COACH_PROFILE_ID, userId) ?? undefined;
    },
  });
};
