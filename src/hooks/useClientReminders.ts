import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ReminderTemplate {
  id: string;
  coach_id: string | null;
  name: string;
  category: string;
  message_template: string;
  default_time: string;
  default_frequency: string;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
}

export interface ClientReminder {
  id: string;
  coach_id: string;
  client_id: string;
  template_id: string | null;
  custom_message: string | null;
  frequency: string;
  custom_interval_days: number | null;
  time_of_day: string;
  day_of_week: number | null;
  start_date: string;
  end_date: string | null;
  timezone: string;
  is_active: boolean;
  is_paused: boolean;
  last_sent_at: string | null;
  next_run_at: string | null;
  max_sends: number | null;
  sends_count: number;
  created_at: string;
  updated_at: string;
  client?: {
    first_name: string | null;
    last_name: string | null;
  };
  template?: ReminderTemplate;
}

function calculateNextRunAt(
  frequency: string,
  timeOfDay: string,
  startDate: string,
  dayOfWeek?: number | null,
  customIntervalDays?: number | null
): string {
  const now = new Date();
  const [hours, minutes] = timeOfDay.split(":").map(Number);
  const start = new Date(startDate);
  
  let nextRun = new Date(Math.max(now.getTime(), start.getTime()));
  nextRun.setHours(hours, minutes, 0, 0);

  if (nextRun <= now) {
    if (frequency === "daily") {
      nextRun.setDate(nextRun.getDate() + 1);
    } else if (frequency === "weekly") {
      nextRun.setDate(nextRun.getDate() + 7);
    } else if (frequency === "monthly") {
      nextRun.setMonth(nextRun.getMonth() + 1);
    } else if (frequency === "custom" && customIntervalDays) {
      nextRun.setDate(nextRun.getDate() + customIntervalDays);
    }
  }

  return nextRun.toISOString();
}

export function useClientReminders() {
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

  // Fetch reminder templates (system + coach custom)
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["reminder-templates", coachProfile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminder_templates")
        .select("*")
        .or(`is_system.eq.true,coach_id.eq.${coachProfile?.id}`)
        .eq("is_active", true)
        .order("category", { ascending: true });
      if (error) throw error;
      return data as ReminderTemplate[];
    },
    enabled: !!coachProfile,
  });

  // Fetch active reminders for coach's clients
  const { data: reminders = [], isLoading: remindersLoading } = useQuery({
    queryKey: ["client-reminders", coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile) return [];
      const { data, error } = await supabase
        .from("client_reminders")
        .select(`
          *,
          client:client_profiles!client_reminders_client_id_fkey(first_name, last_name),
          template:reminder_templates(*)
        `)
        .eq("coach_id", coachProfile.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ClientReminder[];
    },
    enabled: !!coachProfile,
  });

  const createReminderMutation = useMutation({
    mutationFn: async (data: {
      client_id: string;
      template_id?: string;
      custom_message?: string;
      frequency: string;
      time_of_day: string;
      day_of_week?: number;
      start_date: string;
      end_date?: string;
      custom_interval_days?: number;
      max_sends?: number;
    }) => {
      if (!coachProfile) throw new Error("No coach profile");

      const nextRunAt = calculateNextRunAt(
        data.frequency,
        data.time_of_day,
        data.start_date,
        data.day_of_week,
        data.custom_interval_days
      );

      const { error } = await supabase.from("client_reminders").insert({
        coach_id: coachProfile.id,
        client_id: data.client_id,
        template_id: data.template_id || null,
        custom_message: data.custom_message || null,
        frequency: data.frequency,
        time_of_day: data.time_of_day,
        day_of_week: data.day_of_week ?? null,
        start_date: data.start_date,
        end_date: data.end_date || null,
        custom_interval_days: data.custom_interval_days || null,
        max_sends: data.max_sends || null,
        next_run_at: nextRunAt,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reminder created");
      queryClient.invalidateQueries({ queryKey: ["client-reminders"] });
    },
    onError: () => toast.error("Failed to create reminder"),
  });

  const updateReminderMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ClientReminder> & { id: string }) => {
      const { error } = await supabase
        .from("client_reminders")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reminder updated");
      queryClient.invalidateQueries({ queryKey: ["client-reminders"] });
    },
    onError: () => toast.error("Failed to update reminder"),
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("client_reminders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reminder deleted");
      queryClient.invalidateQueries({ queryKey: ["client-reminders"] });
    },
    onError: () => toast.error("Failed to delete reminder"),
  });

  const togglePauseMutation = useMutation({
    mutationFn: async ({ id, is_paused }: { id: string; is_paused: boolean }) => {
      const { error } = await supabase
        .from("client_reminders")
        .update({ is_paused, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-reminders"] });
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      category: string;
      message_template: string;
      default_time: string;
      default_frequency: string;
    }) => {
      if (!coachProfile) throw new Error("No coach profile");
      const { error } = await supabase.from("reminder_templates").insert({
        coach_id: coachProfile.id,
        ...data,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Template created");
      queryClient.invalidateQueries({ queryKey: ["reminder-templates"] });
    },
    onError: () => toast.error("Failed to create template"),
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      // Only delete non-system templates
      const { error } = await supabase
        .from("reminder_templates")
        .update({ is_active: false })
        .eq("id", id)
        .eq("is_system", false);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Template deleted");
      queryClient.invalidateQueries({ queryKey: ["reminder-templates"] });
    },
    onError: () => toast.error("Failed to delete template"),
  });

  return {
    templates,
    reminders,
    isLoading: templatesLoading || remindersLoading,
    createReminder: createReminderMutation.mutate,
    updateReminder: updateReminderMutation.mutate,
    deleteReminder: deleteReminderMutation.mutate,
    togglePause: (id: string, is_paused: boolean) => togglePauseMutation.mutate({ id, is_paused }),
    createTemplate: createTemplateMutation.mutate,
    deleteTemplate: deleteTemplateMutation.mutate,
    isCreating: createReminderMutation.isPending,
    isUpdating: updateReminderMutation.isPending,
    isDeleting: deleteTemplateMutation.isPending,
  };
}
