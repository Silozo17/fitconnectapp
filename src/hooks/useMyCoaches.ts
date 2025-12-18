import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CoachConnection {
  id: string;
  status: string;
  start_date: string | null;
  coach: {
    id: string;
    display_name: string | null;
    profile_image_url: string | null;
    coach_types: string[] | null;
    bio: string | null;
  };
}

export const useMyCoaches = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-coaches", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get client profile first
      const { data: profile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) return [];

      // Fetch connected coaches
      const { data, error } = await supabase
        .from("coach_clients")
        .select(`
          id,
          status,
          start_date,
          coach:coach_profiles!coach_clients_coach_id_fkey (
            id,
            display_name,
            profile_image_url,
            coach_types,
            bio
          )
        `)
        .eq("client_id", profile.id)
        .eq("status", "active");

      if (error) throw error;
      return (data as unknown as CoachConnection[]) || [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
