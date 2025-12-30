import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface AIPlanRecommendation {
  id: string;
  coach_id: string;
  client_id: string;
  recommendation_type: "workout" | "nutrition" | "recovery" | "general";
  title: string;
  description: string;
  suggested_changes: Record<string, any> | null;
  rationale: string | null;
  priority: "low" | "medium" | "high";
  status: "pending" | "applied" | "dismissed" | "expired";
  applied_at: string | null;
  expires_at: string | null;
  created_at: string;
  client?: { first_name: string | null; last_name: string | null };
}

export function useAIPlanRecommendations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: coachProfile } = useQuery({
    queryKey: ["coach-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ["ai-plan-recommendations", coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile) return [];
      const { data, error } = await supabase
        .from("ai_plan_recommendations")
        .select(`*, client:client_profiles!ai_plan_recommendations_client_id_fkey(first_name, last_name)`)
        .eq("coach_id", coachProfile.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as AIPlanRecommendation[];
    },
    enabled: !!coachProfile,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("generate-plan-recommendations", {
        body: { coachId: coachProfile?.id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Recommendations generated");
      queryClient.invalidateQueries({ queryKey: ["ai-plan-recommendations"] });
    },
    onError: () => toast.error("Failed to generate recommendations"),
  });

  const applyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ai_plan_recommendations")
        .update({ status: "applied", applied_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Recommendation applied");
      queryClient.invalidateQueries({ queryKey: ["ai-plan-recommendations"] });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ai_plan_recommendations")
        .update({ status: "dismissed" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-plan-recommendations"] });
    },
  });

  return {
    recommendations,
    isLoading,
    generateRecommendations: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    applyRecommendation: applyMutation.mutate,
    dismissRecommendation: dismissMutation.mutate,
  };
}
