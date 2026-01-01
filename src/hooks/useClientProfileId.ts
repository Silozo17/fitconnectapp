import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getNativeCache, setNativeCache, CACHE_KEYS, CACHE_TTL } from "@/lib/native-cache";

/**
 * Shared hook to get the client profile ID with caching.
 * Uses React Query for efficient caching across components.
 * Prevents duplicate profile fetches across multiple hooks.
 * Native apps get instant profile ID from device cache on cold start.
 */
export const useClientProfileId = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["client-profile-id", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      const id = data?.id || null;
      
      // Cache for native app cold start optimization
      if (id && user.id) {
        setNativeCache(CACHE_KEYS.CLIENT_PROFILE_ID, id, CACHE_TTL.PROFILE_ID, user.id);
      }
      
      return id;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutes - profile ID rarely changes
    // Native: Use cached value as initial data for instant render
    initialData: () => {
      if (!user?.id) return undefined;
      return getNativeCache<string>(CACHE_KEYS.CLIENT_PROFILE_ID, user.id) ?? undefined;
    },
  });
};
