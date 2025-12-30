import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type DataType = "meal_logs" | "training_logs" | "progress" | "measurements" | "wearables" | "habits";

/**
 * Check if a coach has permission to access a specific data type for a client.
 * Defaults to allowed if no explicit preference exists (backward compatibility).
 */
export const checkCoachDataAccess = async (
  clientId: string,
  coachId: string,
  dataType: DataType
): Promise<{ allowed: boolean; error?: string }> => {
  try {
    const { data: pref, error } = await supabase
      .from("health_data_sharing_preferences")
      .select("is_allowed")
      .eq("client_id", clientId)
      .eq("coach_id", coachId)
      .eq("data_type", dataType)
      .maybeSingle();

    if (error) {
      console.error("Error checking data access:", error);
      return { allowed: true }; // Default to allowed on error (don't block coaches due to query issues)
    }

    // If no preference exists, default to allowed (backward compatibility)
    if (!pref) {
      return { allowed: true };
    }

    return { allowed: pref.is_allowed };
  } catch (err) {
    console.error("Exception checking data access:", err);
    return { allowed: true }; // Default to allowed on exception
  }
};

/**
 * Hook to check if coach has access to a specific data type for a client.
 */
export const useCoachDataAccess = (
  clientId: string | undefined,
  coachId: string | undefined,
  dataType: DataType
) => {
  return useQuery({
    queryKey: ["coach-data-access", clientId, coachId, dataType],
    queryFn: async () => {
      if (!clientId || !coachId) return { allowed: true };
      return checkCoachDataAccess(clientId, coachId, dataType);
    },
    enabled: !!clientId && !!coachId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
