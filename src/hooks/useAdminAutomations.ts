import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Message channel types - now supports multi-select
export type MessageChannel = "in_app" | "email" | "push";
export type MessageType = MessageChannel[];

export type TargetAudience = "all" | "clients" | "coaches";

export type TriggerType =
  // User Lifecycle
  | "user_signup_client"
  | "user_signup_coach"
  | "onboarding_incomplete"
  | "profile_complete"
  | "account_anniversary"
  // Engagement
  | "inactive_days"
  | "no_bookings_days"
  | "first_booking"
  | "booking_milestone"
  // Achievements
  | "badge_earned"
  | "streak_milestone"
  | "goal_completed"
  // Coach Events
  | "coach_verified"
  | "coach_first_client"
  | "coach_first_booking"
  | "coach_low_rating"
  | "first_review_received"
  | "review_milestone"
  | "first_service_created"
  | "coach_profile_incomplete"
  | "no_availability_set"
  // Subscription Events
  | "subscription_expiring"
  | "subscription_cancelled"
  | "payment_failed"
  | "coach_subscription_upgraded"
  | "coach_subscription_downgraded"
  | "subscription_anniversary"
  // Boost Events
  | "coach_boost_activated"
  | "coach_boost_expiring"
  // Client-Coach Events
  | "session_completed"
  | "session_cancelled"
  | "client_subscribed_to_coach"
  | "client_cancelled_coach_sub"
  // Scheduled
  | "weekly_motivation"
  | "monthly_summary";

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

export const TRIGGER_CATEGORIES: Record<
  string,
  {
    label: string;
    triggers: { value: string; label: string; description: string }[];
  }
> = {
  user_lifecycle: {
    label: "User Lifecycle",
    triggers: [
      { value: "user_signup_client", label: "Client Signup", description: "When a new client creates an account" },
      { value: "user_signup_coach", label: "Coach Signup", description: "When a new coach creates an account" },
      { value: "onboarding_incomplete", label: "Onboarding Incomplete", description: "User hasn't completed onboarding after X days" },
      { value: "profile_complete", label: "Profile Complete", description: "When user completes their profile" },
      { value: "account_anniversary", label: "Account Anniversary", description: "User's account creation anniversary" },
    ],
  },
  engagement: {
    label: "Engagement",
    triggers: [
      { value: "inactive_days", label: "Inactive Days", description: "User hasn't logged in for X days" },
      { value: "no_bookings_days", label: "No Bookings", description: "Client hasn't booked a session in X days" },
      { value: "first_booking", label: "First Booking", description: "When a client makes their first booking" },
      { value: "booking_milestone", label: "Booking Milestone", description: "Client reaches X total bookings" },
    ],
  },
  achievements: {
    label: "Achievements",
    triggers: [
      { value: "badge_earned", label: "Badge Earned", description: "When a user earns a badge" },
      { value: "streak_milestone", label: "Streak Milestone", description: "User reaches a streak milestone" },
      { value: "goal_completed", label: "Goal Completed", description: "When a user completes a goal" },
    ],
  },
  coach_events: {
    label: "Coach Events",
    triggers: [
      { value: "coach_verified", label: "Coach Verified", description: "When admin verifies a coach" },
      { value: "coach_first_client", label: "First Client", description: "When coach gets their first client" },
      { value: "coach_first_booking", label: "First Booking Received", description: "When coach receives first booking" },
      { value: "coach_low_rating", label: "Low Rating", description: "Coach rating drops below threshold" },
      { value: "first_review_received", label: "First Review", description: "When coach receives their first review" },
      { value: "review_milestone", label: "Review Milestone", description: "Coach reaches X total reviews" },
      { value: "first_service_created", label: "First Service", description: "Coach creates their first service" },
      { value: "coach_profile_incomplete", label: "Profile Incomplete", description: "Coach profile missing key fields after X days" },
      { value: "no_availability_set", label: "No Availability", description: "Coach hasn't set availability after X days" },
    ],
  },
  subscription: {
    label: "Subscription",
    triggers: [
      { value: "subscription_expiring", label: "Subscription Expiring", description: "Subscription expires in X days" },
      { value: "subscription_cancelled", label: "Subscription Cancelled", description: "When a subscription is cancelled" },
      { value: "payment_failed", label: "Payment Failed", description: "When a payment fails" },
      { value: "coach_subscription_upgraded", label: "Coach Upgraded", description: "When coach upgrades to a higher tier" },
      { value: "coach_subscription_downgraded", label: "Coach Downgraded", description: "When coach downgrades their plan" },
      { value: "subscription_anniversary", label: "Subscription Anniversary", description: "1 year on a paid plan" },
    ],
  },
  boost: {
    label: "Boost",
    triggers: [
      { value: "coach_boost_activated", label: "Boost Activated", description: "When coach purchases a visibility boost" },
      { value: "coach_boost_expiring", label: "Boost Expiring", description: "Boost expires in X days" },
    ],
  },
  client_coach_events: {
    label: "Client-Coach Events",
    triggers: [
      { value: "session_completed", label: "Session Completed", description: "After a coaching session is marked complete" },
      { value: "session_cancelled", label: "Session Cancelled", description: "When a session is cancelled" },
      { value: "client_subscribed_to_coach", label: "Client Subscribed", description: "Client subscribes to a coach's plan" },
      { value: "client_cancelled_coach_sub", label: "Client Cancelled Sub", description: "Client cancels their coach subscription" },
    ],
  },
  scheduled: {
    label: "Scheduled",
    triggers: [
      { value: "weekly_motivation", label: "Weekly Motivation", description: "Send weekly motivational message" },
      { value: "monthly_summary", label: "Monthly Summary", description: "Send monthly activity summary" },
    ],
  },
};

export const MESSAGE_VARIABLES = [
  { name: "first_name", description: "User's first name" },
  { name: "last_name", description: "User's last name" },
  { name: "email", description: "User's email address" },
  { name: "role", description: "User role (client/coach)" },
  { name: "days_inactive", description: "Number of days inactive" },
  { name: "total_bookings", description: "Total number of bookings" },
  { name: "streak_days", description: "Current streak in days" },
  { name: "coach_name", description: "Coach's name" },
  { name: "account_age_days", description: "Days since account creation" },
  { name: "old_tier", description: "Previous subscription tier" },
  { name: "new_tier", description: "New subscription tier" },
  { name: "boost_end_date", description: "When boost expires" },
  { name: "review_count", description: "Total number of reviews" },
  { name: "session_date", description: "Scheduled session date" },
  { name: "client_name", description: "Client's name (for coach notifications)" },
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
