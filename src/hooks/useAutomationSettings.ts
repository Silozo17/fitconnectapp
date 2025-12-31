import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type AutomationType = "dropoff_rescue" | "milestone_celebration" | "reminder";

export interface DropoffRescueConfig {
  stage1_days: number;
  stage1_action: "auto_message" | "alert_only";
  stage1_tone: "supportive" | "motivational" | "direct";
  stage1_template?: string;
  stage2_days: number;
  stage2_action: "auto_message" | "alert_only";
  stage3_days: number;
  stage3_action: "ai_assisted" | "auto_message" | "alert_only";
  signals: {
    training_logs: boolean;
    meal_logs: boolean;
    missed_sessions: boolean;
    message_replies: boolean;
    wearable_activity: boolean;
    engagement_score: boolean;
  };
}

export interface MilestoneCelebrationConfig {
  enabled_milestones: string[];
}

export interface ReminderConfig {
  max_reminders_per_day: number;
  quiet_hours_start: string;
  quiet_hours_end: string;
  respect_client_timezone: boolean;
}

export interface AutomationSetting {
  id: string;
  coach_id: string;
  automation_type: AutomationType;
  is_enabled: boolean;
  config: DropoffRescueConfig | MilestoneCelebrationConfig | ReminderConfig;
  created_at: string;
  updated_at: string;
}

const DEFAULT_DROPOFF_CONFIG: DropoffRescueConfig = {
  stage1_days: 3,
  stage1_action: "auto_message",
  stage1_tone: "supportive",
  stage2_days: 7,
  stage2_action: "alert_only",
  stage3_days: 14,
  stage3_action: "alert_only",
  signals: {
    training_logs: true,
    meal_logs: true,
    missed_sessions: true,
    message_replies: true,
    wearable_activity: false,
    engagement_score: true,
  },
};

const DEFAULT_MILESTONE_CONFIG: MilestoneCelebrationConfig = {
  enabled_milestones: ["streak", "program_complete", "challenge_complete"],
};

const DEFAULT_REMINDER_CONFIG: ReminderConfig = {
  max_reminders_per_day: 3,
  quiet_hours_start: "22:00",
  quiet_hours_end: "08:00",
  respect_client_timezone: true,
};

export function useAutomationSettings() {
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

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["automation-settings", coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile) return [];
      const { data, error } = await supabase
        .from("coach_automation_settings")
        .select("*")
        .eq("coach_id", coachProfile.id);
      if (error) throw error;
      return (data || []) as unknown as AutomationSetting[];
    },
    enabled: !!coachProfile,
  });

  const getSettingForType = (type: AutomationType): AutomationSetting | undefined => {
    return settings.find((s) => s.automation_type === type);
  };

  const getDefaultConfig = (type: AutomationType) => {
    switch (type) {
      case "dropoff_rescue":
        return DEFAULT_DROPOFF_CONFIG;
      case "milestone_celebration":
        return DEFAULT_MILESTONE_CONFIG;
      case "reminder":
        return DEFAULT_REMINDER_CONFIG;
    }
  };

  const upsertMutation = useMutation({
    mutationFn: async ({
      type,
      is_enabled,
      config,
    }: {
      type: AutomationType;
      is_enabled: boolean;
      config?: any;
    }) => {
      if (!coachProfile) throw new Error("No coach profile");

      const existingSetting = getSettingForType(type);
      const finalConfig = config || existingSetting?.config || getDefaultConfig(type);

      if (existingSetting) {
        const { error } = await supabase
          .from("coach_automation_settings")
          .update({ is_enabled, config: finalConfig, updated_at: new Date().toISOString() })
          .eq("id", existingSetting.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("coach_automation_settings").insert({
          coach_id: coachProfile.id,
          automation_type: type,
          is_enabled,
          config: finalConfig,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Automation settings saved");
      queryClient.invalidateQueries({ queryKey: ["automation-settings"] });
    },
    onError: () => toast.error("Failed to save automation settings"),
  });

  const toggleAutomation = (type: AutomationType, enabled: boolean) => {
    upsertMutation.mutate({ type, is_enabled: enabled });
  };

  const updateConfig = (type: AutomationType, config: any) => {
    const existingSetting = getSettingForType(type);
    upsertMutation.mutate({
      type,
      is_enabled: existingSetting?.is_enabled ?? false,
      config,
    });
  };

  return {
    settings,
    isLoading,
    getSettingForType,
    getDefaultConfig,
    toggleAutomation,
    updateConfig,
    isSaving: upsertMutation.isPending,
  };
}
