import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { checkCoachDataAccess } from "./useCoachDataAccess";

export interface TrainingLogSet {
  id?: string;
  exercise_id?: string;
  set_number: number;
  reps: number | null;
  weight_kg: number | null;
  duration_seconds: number | null;
  distance_meters: number | null;
  rpe: number | null;
  is_warmup: boolean;
  is_drop_set: boolean;
  notes: string | null;
}

export interface TrainingLogExercise {
  id?: string;
  training_log_id?: string;
  exercise_name: string;
  order_index: number;
  notes: string | null;
  sets: TrainingLogSet[];
}

export interface TrainingLog {
  id: string;
  client_id: string;
  logged_at: string;
  workout_name: string;
  duration_minutes: number | null;
  notes: string | null;
  rpe: number | null;
  fatigue_level: "low" | "moderate" | "high" | null;
  created_at: string;
  updated_at: string;
  exercises?: TrainingLogExercise[];
}

export interface CreateTrainingLogInput {
  workout_name: string;
  logged_at?: string;
  duration_minutes?: number | null;
  notes?: string | null;
  rpe?: number | null;
  fatigue_level?: "low" | "moderate" | "high" | null;
  exercises: TrainingLogExercise[];
}

// Fetch client's training logs
export const useTrainingLogs = (clientId?: string, coachId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["training-logs", clientId || user?.id, coachId],
    queryFn: async () => {
      // If no clientId provided, get current user's client profile
      let targetClientId = clientId;
      
      if (!targetClientId && user) {
        const { data: profile } = await supabase
          .from("client_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();
        targetClientId = profile?.id;
      }

      if (!targetClientId) return [];

      // If coach is viewing, check permission first
      if (coachId && clientId) {
        const { allowed } = await checkCoachDataAccess(clientId, coachId, "training_logs");
        if (!allowed) {
          throw new Error("Access denied: Client has restricted training logs access");
        }
      }

      const { data, error } = await supabase
        .from("training_logs")
        .select(`
          *,
          exercises:training_log_exercises(
            *,
            sets:training_log_sets(*)
          )
        `)
        .eq("client_id", targetClientId)
        .order("logged_at", { ascending: false });

      if (error) throw error;
      
      // Sort exercises by order_index and sets by set_number
      return (data || []).map((log: any) => ({
        ...log,
        exercises: (log.exercises || [])
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((ex: any) => ({
            ...ex,
            sets: (ex.sets || []).sort((a: any, b: any) => a.set_number - b.set_number),
          })),
      })) as TrainingLog[];
    },
    enabled: !!(clientId || user?.id),
  });
};

// Fetch a single training log with full details
export const useTrainingLog = (logId: string | undefined) => {
  return useQuery({
    queryKey: ["training-log", logId],
    queryFn: async () => {
      if (!logId) return null;

      const { data, error } = await supabase
        .from("training_logs")
        .select(`
          *,
          exercises:training_log_exercises(
            *,
            sets:training_log_sets(*)
          )
        `)
        .eq("id", logId)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        exercises: (data.exercises || [])
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((ex: any) => ({
            ...ex,
            sets: (ex.sets || []).sort((a: any, b: any) => a.set_number - b.set_number),
          })),
      } as TrainingLog;
    },
    enabled: !!logId,
  });
};

// Create a new training log
export const useCreateTrainingLog = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTrainingLogInput) => {
      if (!user) throw new Error("Not authenticated");

      // Get client profile
      const { data: profile, error: profileError } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profileError) throw profileError;

      // Create the training log
      const { data: trainingLog, error: logError } = await supabase
        .from("training_logs")
        .insert({
          client_id: profile.id,
          workout_name: input.workout_name,
          logged_at: input.logged_at || new Date().toISOString(),
          duration_minutes: input.duration_minutes,
          notes: input.notes,
          rpe: input.rpe,
          fatigue_level: input.fatigue_level,
        })
        .select()
        .single();

      if (logError) throw logError;

      // Create exercises with sets
      for (const exercise of input.exercises) {
        const { data: exerciseData, error: exerciseError } = await supabase
          .from("training_log_exercises")
          .insert({
            training_log_id: trainingLog.id,
            exercise_name: exercise.exercise_name,
            order_index: exercise.order_index,
            notes: exercise.notes,
          })
          .select()
          .single();

        if (exerciseError) throw exerciseError;

        // Create sets for this exercise
        if (exercise.sets && exercise.sets.length > 0) {
          const setsToInsert = exercise.sets.map((set) => ({
            exercise_id: exerciseData.id,
            set_number: set.set_number,
            reps: set.reps,
            weight_kg: set.weight_kg,
            duration_seconds: set.duration_seconds,
            distance_meters: set.distance_meters,
            rpe: set.rpe,
            is_warmup: set.is_warmup,
            is_drop_set: set.is_drop_set,
            notes: set.notes,
          }));

          const { error: setsError } = await supabase
            .from("training_log_sets")
            .insert(setsToInsert);

          if (setsError) throw setsError;
        }
      }

      return trainingLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-logs"] });
      toast.success("Workout logged successfully!");
    },
    onError: (error) => {
      toast.error("Failed to log workout: " + error.message);
    },
  });
};

// Update an existing training log
export const useUpdateTrainingLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      logId,
      input,
    }: {
      logId: string;
      input: Partial<CreateTrainingLogInput>;
    }) => {
      // Update the main training log
      const { error: logError } = await supabase
        .from("training_logs")
        .update({
          workout_name: input.workout_name,
          logged_at: input.logged_at,
          duration_minutes: input.duration_minutes,
          notes: input.notes,
          rpe: input.rpe,
          fatigue_level: input.fatigue_level,
        })
        .eq("id", logId);

      if (logError) throw logError;

      // If exercises are provided, delete old ones and create new ones
      if (input.exercises) {
        // Delete existing exercises (cascade will delete sets)
        await supabase
          .from("training_log_exercises")
          .delete()
          .eq("training_log_id", logId);

        // Create new exercises with sets
        for (const exercise of input.exercises) {
          const { data: exerciseData, error: exerciseError } = await supabase
            .from("training_log_exercises")
            .insert({
              training_log_id: logId,
              exercise_name: exercise.exercise_name,
              order_index: exercise.order_index,
              notes: exercise.notes,
            })
            .select()
            .single();

          if (exerciseError) throw exerciseError;

          if (exercise.sets && exercise.sets.length > 0) {
            const setsToInsert = exercise.sets.map((set) => ({
              exercise_id: exerciseData.id,
              set_number: set.set_number,
              reps: set.reps,
              weight_kg: set.weight_kg,
              duration_seconds: set.duration_seconds,
              distance_meters: set.distance_meters,
              rpe: set.rpe,
              is_warmup: set.is_warmup,
              is_drop_set: set.is_drop_set,
              notes: set.notes,
            }));

            const { error: setsError } = await supabase
              .from("training_log_sets")
              .insert(setsToInsert);

            if (setsError) throw setsError;
          }
        }
      }

      return { logId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["training-logs"] });
      queryClient.invalidateQueries({ queryKey: ["training-log", data.logId] });
      toast.success("Workout updated!");
    },
    onError: (error) => {
      toast.error("Failed to update workout: " + error.message);
    },
  });
};

// Delete a training log
export const useDeleteTrainingLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logId: string) => {
      const { error } = await supabase
        .from("training_logs")
        .delete()
        .eq("id", logId);

      if (error) throw error;
      return logId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-logs"] });
      toast.success("Workout deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete workout: " + error.message);
    },
  });
};
