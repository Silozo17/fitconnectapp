import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AssignedNutritionPlan {
  id: string;
  plan_id: string;
  plan_name: string;
  plan_description: string | null;
  coach_name: string | null;
  assigned_at: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
}

export const useAssignedNutritionPlans = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["assigned-nutrition-plans", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get client profile
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!clientProfile) return [];

      // Get plan assignments for nutrition plans
      const { data, error } = await supabase
        .from("plan_assignments")
        .select(`
          id,
          plan_id,
          assigned_at,
          start_date,
          end_date,
          status,
          training_plans!inner (
            id,
            name,
            description,
            plan_type,
            coach_id
          ),
          coach_profiles!plan_assignments_coach_id_fkey (
            display_name
          )
        `)
        .eq("client_id", clientProfile.id)
        .eq("training_plans.plan_type", "nutrition")
        .in("status", ["active", "in_progress"]);

      if (error) throw error;

      return (data || []).map((assignment: any) => ({
        id: assignment.id,
        plan_id: assignment.plan_id,
        plan_name: assignment.training_plans?.name || "Unnamed Plan",
        plan_description: assignment.training_plans?.description,
        coach_name: assignment.coach_profiles?.display_name,
        assigned_at: assignment.assigned_at,
        start_date: assignment.start_date,
        end_date: assignment.end_date,
        status: assignment.status,
      })) as AssignedNutritionPlan[];
    },
    enabled: !!user,
  });
};
