import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCoachProfileId } from "./useCoachProfileId";
import {
  differenceInDays,
  addDays,
  format,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { toast } from "sonner";

export type GoalType =
  | "weight_loss"
  | "muscle_gain"
  | "strength"
  | "endurance"
  | "custom";
export type GoalStatus = "active" | "completed" | "paused" | "abandoned";

export interface ClientGoal {
  id: string;
  clientId: string;
  coachId: string | null;
  goalType: GoalType;
  title: string;
  description: string | null;
  targetValue: number | null;
  targetUnit: string | null;
  startValue: number | null;
  currentValue: number | null;
  startDate: Date;
  targetDate: Date | null;
  status: GoalStatus;
  completedAt: Date | null;
  createdAt: Date;
}

export interface GoalMilestone {
  id: string;
  goalId: string;
  milestoneValue: number;
  milestoneLabel: string | null;
  reachedAt: Date | null;
  celebrated: boolean;
}

export interface GoalAdherence {
  goal: ClientGoal;
  progressPercent: number;
  projectedCompletionDate: Date | null;
  daysAhead: number; // Positive = ahead of schedule, negative = behind
  isOnTrack: boolean;
  weeklyProgressRate: number;
  milestones: GoalMilestone[];
  nextMilestone: GoalMilestone | null;
}

function calculateProgressPercent(goal: ClientGoal): number {
  if (
    goal.startValue === null ||
    goal.targetValue === null ||
    goal.currentValue === null
  ) {
    return 0;
  }

  const totalChange = Math.abs(goal.targetValue - goal.startValue);
  if (totalChange === 0) return 100;

  const currentChange = Math.abs(goal.currentValue - goal.startValue);
  return Math.min(100, Math.max(0, (currentChange / totalChange) * 100));
}

function calculateWeeklyRate(goal: ClientGoal): number {
  if (goal.startValue === null || goal.currentValue === null) return 0;

  const weeksElapsed = differenceInDays(new Date(), goal.startDate) / 7;
  if (weeksElapsed <= 0) return 0;

  const totalChange = goal.currentValue - goal.startValue;
  return totalChange / weeksElapsed;
}

function projectCompletionDate(goal: ClientGoal): Date | null {
  if (
    goal.startValue === null ||
    goal.targetValue === null ||
    goal.currentValue === null
  ) {
    return null;
  }

  const weeklyRate = calculateWeeklyRate(goal);
  if (Math.abs(weeklyRate) < 0.001) return null; // No progress

  const remainingChange = goal.targetValue - goal.currentValue;
  const weeksRemaining = remainingChange / weeklyRate;

  if (weeksRemaining < 0) return null; // Moving away from goal

  return addDays(new Date(), Math.ceil(weeksRemaining * 7));
}

export function useClientGoals(clientId?: string) {
  const { data: coachId } = useCoachProfileId();

  return useQuery({
    queryKey: ["client-goals", coachId, clientId],
    queryFn: async (): Promise<ClientGoal[]> => {
      if (!coachId) throw new Error("No coach ID");

      let query = supabase
        .from("client_goals")
        .select("*")
        .eq("coach_id", coachId)
        .order("created_at", { ascending: false });

      if (clientId) {
        query = query.eq("client_id", clientId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((g) => ({
        id: g.id,
        clientId: g.client_id,
        coachId: g.coach_id,
        goalType: g.goal_type as GoalType,
        title: g.title,
        description: g.description,
        targetValue: g.target_value,
        targetUnit: g.target_unit,
        startValue: g.start_value,
        currentValue: g.current_value,
        startDate: new Date(g.start_date),
        targetDate: g.target_date ? new Date(g.target_date) : null,
        status: g.status as GoalStatus,
        completedAt: g.completed_at ? new Date(g.completed_at) : null,
        createdAt: new Date(g.created_at),
      }));
    },
    enabled: !!coachId,
  });
}

export function useGoalMilestones(goalId: string) {
  return useQuery({
    queryKey: ["goal-milestones", goalId],
    queryFn: async (): Promise<GoalMilestone[]> => {
      const { data, error } = await supabase
        .from("goal_milestones")
        .select("*")
        .eq("goal_id", goalId)
        .order("milestone_value", { ascending: true });

      if (error) throw error;

      return (data || []).map((m) => ({
        id: m.id,
        goalId: m.goal_id,
        milestoneValue: m.milestone_value,
        milestoneLabel: m.milestone_label,
        reachedAt: m.reached_at ? new Date(m.reached_at) : null,
        celebrated: m.celebrated || false,
      }));
    },
    enabled: !!goalId,
  });
}

export function useGoalAdherence(clientId?: string) {
  const { data: goals = [], isLoading: goalsLoading } =
    useClientGoals(clientId);
  const { data: coachId } = useCoachProfileId();

  return useQuery({
    queryKey: ["goal-adherence", coachId, clientId, goals.map((g) => g.id)],
    queryFn: async (): Promise<GoalAdherence[]> => {
      const adherenceList: GoalAdherence[] = [];

      for (const goal of goals.filter((g) => g.status === "active")) {
        // Fetch milestones
        const { data: milestonesData } = await supabase
          .from("goal_milestones")
          .select("*")
          .eq("goal_id", goal.id)
          .order("milestone_value", { ascending: true });

        const milestones: GoalMilestone[] = (milestonesData || []).map((m) => ({
          id: m.id,
          goalId: m.goal_id,
          milestoneValue: m.milestone_value,
          milestoneLabel: m.milestone_label,
          reachedAt: m.reached_at ? new Date(m.reached_at) : null,
          celebrated: m.celebrated || false,
        }));

        const progressPercent = calculateProgressPercent(goal);
        const projectedCompletionDate = projectCompletionDate(goal);
        const weeklyProgressRate = calculateWeeklyRate(goal);

        // Calculate days ahead/behind
        let daysAhead = 0;
        if (goal.targetDate && projectedCompletionDate) {
          daysAhead = differenceInDays(goal.targetDate, projectedCompletionDate);
        }

        // On track if projected to complete before or at target date
        const isOnTrack = daysAhead >= -7; // Allow 1 week buffer

        // Find next unreached milestone
        const nextMilestone =
          milestones.find((m) => m.reachedAt === null) || null;

        adherenceList.push({
          goal,
          progressPercent,
          projectedCompletionDate,
          daysAhead,
          isOnTrack,
          weeklyProgressRate,
          milestones,
          nextMilestone,
        });
      }

      return adherenceList;
    },
    enabled: !!coachId && goals.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useOffTrackGoals() {
  const { data: coachId } = useCoachProfileId();

  return useQuery({
    queryKey: ["off-track-goals", coachId],
    queryFn: async () => {
      if (!coachId) throw new Error("No coach ID");

      // Get all active goals
      const { data: goals } = await supabase
        .from("client_goals")
        .select(
          `
          *,
          client_profile:client_profiles!client_goals_client_id_fkey(
            first_name, last_name
          )
        `
        )
        .eq("coach_id", coachId)
        .eq("status", "active")
        .not("target_date", "is", null);

      const offTrackGoals: Array<{
        goal: ClientGoal;
        clientName: string;
        daysBehand: number;
      }> = [];

      for (const g of goals || []) {
        const goal: ClientGoal = {
          id: g.id,
          clientId: g.client_id,
          coachId: g.coach_id,
          goalType: g.goal_type as GoalType,
          title: g.title,
          description: g.description,
          targetValue: g.target_value,
          targetUnit: g.target_unit,
          startValue: g.start_value,
          currentValue: g.current_value,
          startDate: new Date(g.start_date),
          targetDate: g.target_date ? new Date(g.target_date) : null,
          status: g.status as GoalStatus,
          completedAt: g.completed_at ? new Date(g.completed_at) : null,
          createdAt: new Date(g.created_at),
        };

        const projected = projectCompletionDate(goal);
        if (projected && goal.targetDate) {
          const daysBehind = differenceInDays(projected, goal.targetDate);
          if (daysBehind > 7) {
            const profile = g.client_profile as any;
            offTrackGoals.push({
              goal,
              clientName: `${profile?.first_name || ""} ${
                profile?.last_name || ""
              }`.trim(),
              daysBehand: daysBehind,
            });
          }
        }
      }

      return offTrackGoals.sort((a, b) => b.daysBehand - a.daysBehand);
    },
    enabled: !!coachId,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  const { data: coachId } = useCoachProfileId();

  return useMutation({
    mutationFn: async (data: {
      clientId: string;
      goalType: GoalType;
      title: string;
      description?: string;
      targetValue?: number;
      targetUnit?: string;
      startValue?: number;
      targetDate?: Date;
    }) => {
      if (!coachId) throw new Error("No coach ID");

      const { data: goal, error } = await supabase
        .from("client_goals")
        .insert({
          client_id: data.clientId,
          coach_id: coachId,
          goal_type: data.goalType,
          title: data.title,
          description: data.description,
          target_value: data.targetValue,
          target_unit: data.targetUnit,
          start_value: data.startValue,
          current_value: data.startValue,
          target_date: data.targetDate?.toISOString().split("T")[0],
        })
        .select()
        .single();

      if (error) throw error;

      // Create default milestones (25%, 50%, 75%, 100%)
      if (data.startValue !== undefined && data.targetValue !== undefined) {
        const range = data.targetValue - data.startValue;
        const milestones = [0.25, 0.5, 0.75, 1].map((pct) => ({
          goal_id: goal.id,
          milestone_value: data.startValue! + range * pct,
          milestone_label: `${pct * 100}% Complete`,
        }));

        await supabase.from("goal_milestones").insert(milestones);
      }

      return goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-adherence"] });
      toast.success("Goal created successfully");
    },
    onError: () => {
      toast.error("Failed to create goal");
    },
  });
}

export function useUpdateGoalProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { goalId: string; currentValue: number }) => {
      // Update goal
      const { error: goalError } = await supabase
        .from("client_goals")
        .update({
          current_value: data.currentValue,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.goalId);

      if (goalError) throw goalError;

      // Check and update milestones
      const { data: milestones } = await supabase
        .from("goal_milestones")
        .select("*")
        .eq("goal_id", data.goalId)
        .is("reached_at", null);

      for (const milestone of milestones || []) {
        if (data.currentValue >= milestone.milestone_value) {
          await supabase
            .from("goal_milestones")
            .update({ reached_at: new Date().toISOString() })
            .eq("id", milestone.id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-adherence"] });
      queryClient.invalidateQueries({ queryKey: ["goal-milestones"] });
    },
    onError: () => {
      toast.error("Failed to update goal progress");
    },
  });
}

export function useCelebrateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (milestoneId: string) => {
      const { error } = await supabase
        .from("goal_milestones")
        .update({ celebrated: true })
        .eq("id", milestoneId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal-milestones"] });
      toast.success("Milestone celebrated! 🎉");
    },
  });
}
