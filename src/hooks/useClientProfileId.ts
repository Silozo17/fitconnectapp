import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Shared hook to get the client profile ID with caching.
 * Uses React Query for efficient caching across components.
 * Prevents duplicate profile fetches across multiple hooks.
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
      return data?.id || null;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutes - profile ID rarely changes
  });
};
