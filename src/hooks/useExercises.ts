import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Exercise {
  id: string;
  name: string;
  category_id: string | null;
  muscle_groups: string[];
  equipment: string | null;
  difficulty: string | null;
  instructions: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  is_custom: boolean;
  coach_id: string | null;
  created_at: string;
  category?: ExerciseCategory;
}

export interface ExerciseCategory {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

export interface CreateExerciseInput {
  name: string;
  category_id?: string;
  muscle_groups?: string[];
  equipment?: string;
  difficulty?: string;
  instructions?: string;
  video_url?: string;
  coach_id: string;
  is_custom: boolean;
}

export const useExerciseCategories = () => {
  return useQuery({
    queryKey: ["exercise-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercise_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as ExerciseCategory[];
    },
  });
};

export const useExercises = (categoryId?: string, searchQuery?: string) => {
  return useQuery({
    queryKey: ["exercises", categoryId, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("exercises")
        .select(`
          *,
          category:exercise_categories(*)
        `)
        .order("name");

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Exercise[];
    },
  });
};

export const useCreateExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateExerciseInput) => {
      const { data, error } = await supabase
        .from("exercises")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      toast.success("Exercise created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create exercise: " + error.message);
    },
  });
};

export const useUpdateExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Exercise> & { id: string }) => {
      const { data, error } = await supabase
        .from("exercises")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      toast.success("Exercise updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update exercise: " + error.message);
    },
  });
};

export const useDeleteExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("exercises")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      toast.success("Exercise deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete exercise: " + error.message);
    },
  });
};
