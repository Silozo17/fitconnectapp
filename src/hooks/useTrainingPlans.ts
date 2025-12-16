import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

export interface PlanExercise {
  id: string;
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
  video_url?: string;
}

export interface PlanDay {
  id: string;
  name: string;
  exercises: PlanExercise[];
}

export interface TrainingPlan {
  id: string;
  coach_id: string;
  name: string;
  description: string | null;
  plan_type: string;
  duration_weeks: number | null;
  content: PlanDay[];
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanInput {
  coach_id: string;
  name: string;
  description?: string;
  plan_type: string;
  duration_weeks?: number;
  content: PlanDay[];
  is_template?: boolean;
}

export const useTrainingPlans = (coachId?: string) => {
  return useQuery({
    queryKey: ["training-plans", coachId],
    queryFn: async () => {
      let query = supabase
        .from("training_plans")
        .select("*")
        .order("created_at", { ascending: false });

      if (coachId) {
        query = query.eq("coach_id", coachId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data.map(plan => ({
        ...plan,
        content: (plan.content as unknown as PlanDay[]) || []
      })) as TrainingPlan[];
    },
    enabled: !!coachId,
  });
};

export const useTrainingPlan = (planId?: string) => {
  return useQuery({
    queryKey: ["training-plan", planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_plans")
        .select("*")
        .eq("id", planId!)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        content: (data.content as unknown as PlanDay[]) || []
      } as TrainingPlan;
    },
    enabled: !!planId,
  });
};

export const useCreateTrainingPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePlanInput) => {
      const { data, error } = await supabase
        .from("training_plans")
        .insert({
          ...input,
          content: input.content as unknown as Json,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-plans"] });
      toast.success("Plan created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create plan: " + error.message);
    },
  });
};

export const useUpdateTrainingPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CreatePlanInput> & { id: string }) => {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.content) {
        updateData.content = updates.content as unknown as Json;
      }

      const { data, error } = await supabase
        .from("training_plans")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["training-plans"] });
      queryClient.invalidateQueries({ queryKey: ["training-plan", variables.id] });
      toast.success("Plan updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update plan: " + error.message);
    },
  });
};

export const useDeleteTrainingPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("training_plans")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-plans"] });
      toast.success("Plan deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete plan: " + error.message);
    },
  });
};
