import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { toast } from "sonner";

export type AutomationType = 
  | "membership_renewal_reminder"
  | "payment_failed"
  | "birthday_greeting"
  | "class_reminder"
  | "inactive_member_outreach"
  | "welcome_email"
  | "membership_expiring"
  | "check_in_streak";

export interface GymAutomation {
  id: string;
  gym_id: string;
  name: string;
  automation_type: AutomationType;
  is_active: boolean;
  trigger_config: Record<string, any>;
  action_config: Record<string, any>;
  message_template: string | null;
  send_email: boolean;
  send_sms: boolean;
  send_push: boolean;
  created_at: string;
  updated_at: string;
}

export interface AutomationLog {
  id: string;
  gym_id: string;
  automation_id: string | null;
  member_id: string | null;
  automation_type: string;
  status: "pending" | "sent" | "failed" | "skipped";
  message_sent: string | null;
  error_message: string | null;
  metadata: Record<string, any> | null;
  triggered_at: string;
  completed_at: string | null;
  member?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export const AUTOMATION_TYPES: { value: AutomationType; label: string; description: string }[] = [
  { value: "welcome_email", label: "Welcome Email", description: "Send welcome message when a new member joins" },
  { value: "membership_renewal_reminder", label: "Renewal Reminder", description: "Remind members before their membership expires" },
  { value: "membership_expiring", label: "Expiring Soon", description: "Alert when membership is about to expire" },
  { value: "payment_failed", label: "Payment Failed", description: "Notify members of failed payment attempts" },
  { value: "birthday_greeting", label: "Birthday Greeting", description: "Send birthday wishes to members" },
  { value: "class_reminder", label: "Class Reminder", description: "Remind members of upcoming booked classes" },
  { value: "inactive_member_outreach", label: "Inactive Outreach", description: "Re-engage members who haven't visited recently" },
  { value: "check_in_streak", label: "Check-in Streak", description: "Celebrate member check-in milestones" },
];

export function useGymAutomations() {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-automations", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return [];

      const { data, error } = await (supabase as any)
        .from("gym_automations")
        .select("*")
        .eq("gym_id", gym.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as GymAutomation[];
    },
    enabled: !!gym?.id,
  });
}

export function useCreateAutomation() {
  const queryClient = useQueryClient();
  const { gym } = useGym();

  return useMutation({
    mutationFn: async (data: Omit<GymAutomation, "id" | "gym_id" | "created_at" | "updated_at">) => {
      const { error } = await (supabase as any)
        .from("gym_automations")
        .insert({
          gym_id: gym?.id,
          ...data,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-automations"] });
      toast.success("Automation created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create automation");
    },
  });
}

export function useUpdateAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<GymAutomation> & { id: string }) => {
      const { error } = await (supabase as any)
        .from("gym_automations")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-automations"] });
      toast.success("Automation updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update automation");
    },
  });
}

export function useDeleteAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("gym_automations")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-automations"] });
      toast.success("Automation deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete automation");
    },
  });
}

export function useToggleAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await (supabase as any)
        .from("gym_automations")
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gym-automations"] });
      toast.success(variables.is_active ? "Automation enabled" : "Automation disabled");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to toggle automation");
    },
  });
}

export function useAutomationLogs(options?: { limit?: number }) {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["automation-logs", gym?.id, options?.limit],
    queryFn: async () => {
      if (!gym?.id) return [];

      let query = (supabase as any)
        .from("gym_automation_logs")
        .select(`
          *,
          member:gym_members(first_name, last_name)
        `)
        .eq("gym_id", gym.id)
        .order("triggered_at", { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AutomationLog[];
    },
    enabled: !!gym?.id,
  });
}
