import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to get the client profile ID for a given user ID.
 * Used when coaches send session offers to clients via messaging.
 * 
 * @param userId - The auth user ID of the participant
 * @returns clientProfileId, hasClientProfile status, loading state, and error
 */
export const useParticipantClientProfileId = (userId: string | null | undefined) => {
  const query = useQuery({
    queryKey: ["participant-client-profile-id", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error) throw error;
      return data?.id || null;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  return {
    clientProfileId: query.data ?? null,
    hasClientProfile: !!query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};
