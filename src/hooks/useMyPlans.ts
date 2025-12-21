import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PlanAssignment {
  id: string;
  plan_id: string;
  client_id: string;
  coach_id: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  plan: {
    id: string;
    name: string;
    description: string | null;
    plan_type: string;
    duration_weeks: number | null;
  } | null;
  coach: {
    id: string;
    display_name: string | null;
    profile_image_url: string | null;
  } | null;
}

export const useMyPlans = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-plans", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get client profile first
      const { data: profile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) return [];

      // Fetch assigned plans
      const { data, error } = await supabase
        .from("plan_assignments")
        .select(`
          id,
          plan_id,
          client_id,
          coach_id,
          status,
          start_date,
          end_date,
          created_at,
          plan:training_plans!plan_assignments_plan_id_fkey (
            id,
            name,
            description,
            plan_type,
            duration_weeks
          ),
          coach:coach_profiles!plan_assignments_coach_id_fkey (
            id,
            display_name,
            profile_image_url
          )
        `)
        .eq("client_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Defensive: filter out assignments with missing plan data and normalize
      const safeData = (data || [])
        .filter(item => item.plan) // Only include assignments with valid plan data
        .map(item => ({
          ...item,
          plan: item.plan || { id: '', name: 'Unknown Plan', description: null, plan_type: 'workout', duration_weeks: null },
          coach: item.coach || { id: '', display_name: null, profile_image_url: null }
        }));
      
      return safeData as PlanAssignment[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
