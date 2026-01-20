import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type TriggerType =
  | "user_signup_client"
  | "user_signup_coach"
  | "onboarding_incomplete"
  | "profile_complete"
  | "account_anniversary"
  | "inactive_days"
  | "no_bookings_days"
  | "first_booking"
  | "booking_milestone"
  | "badge_earned"
  | "streak_milestone"
  | "goal_completed"
  | "coach_verified"
  | "coach_first_client"
  | "coach_first_booking"
  | "coach_low_rating"
  | "subscription_expiring"
  | "subscription_cancelled"
  | "payment_failed"
  | "weekly_motivation"
  | "monthly_summary";

export type TargetAudience = "all" | "clients" | "coaches";
export type MessageType = "in_app" | "email" | "push" | "all";

export interface TriggerConfig {
  days?: number;
  threshold?: number;
  milestone?: number;
  day_of_week?: number;
  day_of_month?: number;
}

export interface AudienceFilters {
  disciplines?: string[];
  locations?: string[];
  subscription_status?: string[];
  has_coach?: boolean;
}

export interface AdminAutomationRule {
  id: string;
  name: string;
  description: string | null;
  trigger_type: TriggerType;
  trigger_config: TriggerConfig;
  target_audience: TargetAudience;
  audience_filters: AudienceFilters;
  message_type: MessageType;
  message_template: string;
  message_subject: string | null;
  is_enabled: boolean;
  priority: number;
  cooldown_days: number | null;
  max_sends_per_user: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminAutomationLog {
  id: string;
  rule_id: string | null;
  user_id: string;
  trigger_type: string;
  message_type: string;
  message_content: string | null;
  status: "sent" | "failed" | "skipped";
  error_message: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export const TRIGGER_CATEGORIES = {
  user_lifecycle: {
    label: "User Lifecycle",
    triggers: [
      { value: "user_signup_client", label: "Client Signup", description: "When a new client registers" },
      { value: "user_signup_coach", label: "Coach Signup", description: "When a new coach registers" },
      { value: "onboarding_incomplete", label: "Onboarding Incomplete", description: "User hasn't completed onboarding after X days" },
      { value: "profile_complete", label: "Profile Complete", description: "When user completes their profile" },
      { value: "account_anniversary", label: "Account Anniversary", description: "Annual account creation anniversary" },
    ],
  },
  engagement: {
    label: "Engagement",
    triggers: [
      { value: "inactive_days", label: "Inactive Days", description: "No activity for X days" },
      { value: "no_bookings_days", label: "No Bookings", description: "No bookings for X days" },
      { value: "first_booking", label: "First Booking", description: "When user makes first booking" },
      { value: "booking_milestone", label: "Booking Milestone", description: "Reached X total bookings" },
    ],
  },
  achievements: {
    label: "Achievements",
    triggers: [
      { value: "badge_earned", label: "Badge Earned", description: "When user earns any badge" },
      { value: "streak_milestone", label: "Streak Milestone", description: "Reached X day streak" },
      { value: "goal_completed", label: "Goal Completed", description: "When user completes a goal" },
    ],
  },
  coach_events: {
    label: "Coach Events",
    triggers: [
      { value: "coach_verified", label: "Coach Verified", description: "When coach gets verified" },
      { value: "coach_first_client", label: "First Client", description: "When coach gets first client" },
      { value: "coach_first_booking", label: "First Booking Received", description: "When coach receives first booking" },
      { value: "coach_low_rating", label: "Low Rating Alert", description: "Coach rating drops below threshold" },
    ],
  },
  subscription: {
    label: "Subscription",
    triggers: [
      { value: "subscription_expiring", label: "Subscription Expiring", description: "Subscription expires in X days" },
      { value: "subscription_cancelled", label: "Subscription Cancelled", description: "When subscription is cancelled" },
      { value: "payment_failed", label: "Payment Failed", description: "When payment fails" },
    ],
  },
  scheduled: {
    label: "Scheduled",
    triggers: [
      { value: "weekly_motivation", label: "Weekly Motivation", description: "Send motivational message weekly" },
      { value: "monthly_summary", label: "Monthly Summary", description: "Send monthly progress summary" },
    ],
  },
};

export const MESSAGE_VARIABLES = [
  { name: "first_name", description: "User's first name" },
  { name: "last_name", description: "User's last name" },
  { name: "email", description: "User's email address" },
  { name: "role", description: "'client' or 'coach'" },
  { name: "days_inactive", description: "Days since last activity" },
  { name: "days_since_booking", description: "Days since last booking" },
  { name: "total_bookings", description: "Total sessions booked" },
  { name: "streak_days", description: "Current streak days" },
  { name: "badge_name", description: "Name of earned badge" },
  { name: "goal_title", description: "Completed goal title" },
  { name: "coach_name", description: "Connected coach name" },
  { name: "subscription_end_date", description: "Subscription expiry date" },
  { name: "account_age_days", description: "Days since account creation" },
];

export function useAdminAutomations() {
  return useQuery({
    queryKey: ["admin-automations"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("admin_automation_rules")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AdminAutomationRule[];
    },
  });
}

export function useAdminAutomationLogs(options?: { ruleId?: string; limit?: number }) {
  return useQuery({
    queryKey: ["admin-automation-logs", options?.ruleId, options?.limit],
    queryFn: async () => {
      let query = (supabase as any)
        .from("admin_automation_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (options?.ruleId) {
        query = query.eq("rule_id", options.ruleId);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AdminAutomationLog[];
    },
  });
}

export function useCreateAdminAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<AdminAutomationRule, "id" | "created_at" | "updated_at">) => {
      const { error } = await (supabase as any)
        .from("admin_automation_rules")
        .insert(data);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-automations"] });
      toast.success("Automation created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create automation");
    },
  });
}

export function useUpdateAdminAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<AdminAutomationRule> & { id: string }) => {
      const { error } = await (supabase as any)
        .from("admin_automation_rules")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-automations"] });
      toast.success("Automation updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update automation");
    },
  });
}

export function useDeleteAdminAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("admin_automation_rules")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-automations"] });
      toast.success("Automation deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete automation");
    },
  });
}

export function useToggleAdminAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      const { error } = await (supabase as any)
        .from("admin_automation_rules")
        .update({ is_enabled, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-automations"] });
      toast.success(variables.is_enabled ? "Automation enabled" : "Automation disabled");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to toggle automation");
    },
  });
}

export function useAutomationStats(ruleId: string) {
  return useQuery({
    queryKey: ["admin-automation-stats", ruleId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("admin_automation_logs")
        .select("status")
        .eq("rule_id", ruleId);

      if (error) throw error;

      const logs = data as { status: string }[];
      return {
        total: logs.length,
        sent: logs.filter((l) => l.status === "sent").length,
        failed: logs.filter((l) => l.status === "failed").length,
        skipped: logs.filter((l) => l.status === "skipped").length,
      };
    },
    enabled: !!ruleId,
  });
}
