import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch participant name from client, coach, or admin profiles.
 * Cached with React Query for efficiency.
 */
export const useParticipantName = (participantId: string | undefined) => {
  return useQuery({
    queryKey: ["participant-name", participantId],
    queryFn: async () => {
      if (!participantId) return null;

      // Try client profile first
      const { data: clientData } = await supabase
        .from("client_profiles")
        .select("first_name, last_name")
        .eq("id", participantId)
        .maybeSingle();

      if (clientData) {
        return `${clientData.first_name || ""} ${clientData.last_name || ""}`.trim() || "Client";
      }

      // Try coach profile
      const { data: coachData } = await supabase
        .from("coach_profiles")
        .select("display_name")
        .eq("id", participantId)
        .maybeSingle();

      if (coachData?.display_name) {
        return coachData.display_name;
      }

      // Try admin profile
      const { data: adminData } = await supabase
        .from("admin_profiles")
        .select("first_name, last_name, display_name")
        .eq("id", participantId)
        .maybeSingle();

      if (adminData) {
        return adminData.display_name || 
          `${adminData.first_name || ""} ${adminData.last_name || ""}`.trim() || 
          "Admin";
      }

      return "Unknown";
    },
    enabled: !!participantId,
    staleTime: 1000 * 60 * 10, // 10 minutes - names rarely change
  });
};
