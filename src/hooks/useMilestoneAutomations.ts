import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type MilestoneType = "streak" | "program_complete" | "challenge_complete" | "wearable_target" | "adherence" | "pr";

export interface MilestoneActions {
  send_message: boolean;
  award_xp: number;
  award_badge_id?: string;
  trigger_animation: boolean;
  notify_coach: boolean;
}

export interface MilestoneAutomation {
  id: string;
  coach_id: string;
  milestone_type: MilestoneType;
  threshold_value: number;
  is_enabled: boolean;
  actions: MilestoneActions;
  message_template: string | null;
  apply_to_all_clients: boolean;
  created_at: string;
  updated_at: string;
}

const DEFAULT_ACTIONS: MilestoneActions = {
  send_message: true,
  award_xp: 50,
  trigger_animation: true,
  notify_coach: false,
};

const DEFAULT_MESSAGES: Record<MilestoneType, string> = {
  streak: "🎉 Amazing {client_name}! You've hit a {value}-day streak! Your consistency is paying off!",
  program_complete: "🏆 Congratulations {client_name}! You've completed your training program! What an achievement!",
  challenge_complete: "🌟 {client_name}, you crushed it! Challenge complete! You should be so proud!",
  wearable_target: "💪 Great job {client_name}! You hit your daily target!",
  adherence: "✨ Incredible consistency {client_name}! {value}% adherence this week - you're unstoppable!",
  pr: "🔥 NEW PR {client_name}! You just set a personal record! Keep pushing those limits!",
};

const DEFAULT_THRESHOLDS: Record<MilestoneType, number> = {
  streak: 7,
  program_complete: 1,
  challenge_complete: 1,
  wearable_target: 1,
  adherence: 90,
  pr: 1,
};

export function useMilestoneAutomations() {
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

  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ["milestone-automations", coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile) return [];
      const { data, error } = await supabase
        .from("milestone_automations")
        .select("*")
        .eq("coach_id", coachProfile.id)
        .order("milestone_type", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as MilestoneAutomation[];
    },
    enabled: !!coachProfile,
  });

  const { data: badges = [] } = useQuery({
    queryKey: ["available-badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("id, name, icon, rarity")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const getMilestone = (type: MilestoneType): MilestoneAutomation | undefined => {
    return milestones.find((m) => m.milestone_type === type);
  };

  const upsertMutation = useMutation({
    mutationFn: async ({
      type,
      is_enabled,
      threshold_value,
      actions,
      message_template,
    }: {
      type: MilestoneType;
      is_enabled: boolean;
      threshold_value?: number;
      actions?: MilestoneActions;
      message_template?: string;
    }) => {
      if (!coachProfile) throw new Error("No coach profile");

      const existingMilestone = getMilestone(type);
      const finalActions = actions || existingMilestone?.actions || DEFAULT_ACTIONS;
      const finalThreshold = threshold_value ?? existingMilestone?.threshold_value ?? DEFAULT_THRESHOLDS[type];
      const finalMessage = message_template ?? existingMilestone?.message_template ?? DEFAULT_MESSAGES[type];

      if (existingMilestone) {
        const { error } = await supabase
          .from("milestone_automations")
          .update({
            is_enabled,
            threshold_value: finalThreshold,
            actions: JSON.parse(JSON.stringify(finalActions)),
            message_template: finalMessage,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingMilestone.id);
        if (error) throw error;
      } else {
        const insertData = {
          coach_id: coachProfile.id,
          milestone_type: type,
          is_enabled,
          threshold_value: finalThreshold,
          actions: JSON.parse(JSON.stringify(finalActions)),
          message_template: finalMessage,
        };
        const { error } = await supabase.from("milestone_automations").insert([insertData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Milestone automation saved");
      queryClient.invalidateQueries({ queryKey: ["milestone-automations"] });
    },
    onError: () => toast.error("Failed to save milestone automation"),
  });

  const toggleMilestone = (type: MilestoneType, enabled: boolean) => {
    upsertMutation.mutate({ type, is_enabled: enabled });
  };

  const updateMilestone = (
    type: MilestoneType,
    updates: {
      threshold_value?: number;
      actions?: MilestoneActions;
      message_template?: string;
    }
  ) => {
    const existing = getMilestone(type);
    upsertMutation.mutate({
      type,
      is_enabled: existing?.is_enabled ?? true,
      ...updates,
    });
  };

  return {
    milestones,
    badges,
    isLoading,
    getMilestone,
    toggleMilestone,
    updateMilestone,
    isSaving: upsertMutation.isPending,
    defaultMessages: DEFAULT_MESSAGES,
    defaultThresholds: DEFAULT_THRESHOLDS,
  };
}
