import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// =====================================================
// Recurring Schedules
// =====================================================

export interface GymRecurringSchedule {
  id: string;
  gym_id: string;
  class_type_id: string;
  instructor_id: string | null;
  location_id: string | null;
  day_of_week: number;
  start_time: string;
  duration_minutes: number;
  capacity: number | null;
  auto_generate_weeks_ahead: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  // Joined data
  class_type?: {
    name: string;
    color: string | null;
  };
  instructor?: {
    display_name: string;
  };
  location?: {
    name: string;
  };
}

export function useGymRecurringSchedules(gymId: string | undefined) {
  return useQuery({
    queryKey: ["gym-recurring-schedules", gymId],
    queryFn: async () => {
      if (!gymId) return [];
      
      const { data, error } = await supabase
        .from("gym_recurring_schedules")
        .select(`
          *,
          class_type:gym_class_types(name, color),
          instructor:gym_staff!gym_recurring_schedules_instructor_id_fkey(display_name),
          location:gym_locations(name)
        `)
        .eq("gym_id", gymId)
        .order("day_of_week")
        .order("start_time");

      if (error) throw error;
      return data as GymRecurringSchedule[];
    },
    enabled: !!gymId,
  });
}

export function useCreateRecurringSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (schedule: Omit<GymRecurringSchedule, "id" | "created_at" | "updated_at" | "class_type" | "instructor" | "location">) => {
      const { data, error } = await supabase
        .from("gym_recurring_schedules")
        .insert(schedule)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gym-recurring-schedules", variables.gym_id] });
      toast({ title: "Recurring schedule created" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create schedule", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateRecurringSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, gymId, ...updates }: { id: string; gymId: string } & Partial<GymRecurringSchedule>) => {
      const { data, error } = await supabase
        .from("gym_recurring_schedules")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gym-recurring-schedules", variables.gymId] });
      toast({ title: "Schedule updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update schedule", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteRecurringSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, gymId }: { id: string; gymId: string }) => {
      const { error } = await supabase
        .from("gym_recurring_schedules")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gym-recurring-schedules", variables.gymId] });
      toast({ title: "Recurring schedule deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete schedule", description: error.message, variant: "destructive" });
    },
  });
}

// =====================================================
// Waitlist Settings
// =====================================================

export interface GymWaitlistSettings {
  id: string;
  gym_id: string;
  auto_promote_enabled: boolean;
  promotion_window_hours: number;
  max_auto_promotions: number;
  notify_on_promotion: boolean;
  notify_on_waitlist_join: boolean;
  promotion_message_template: string;
  created_at: string;
  updated_at: string;
}

export function useGymWaitlistSettings(gymId: string | undefined) {
  return useQuery({
    queryKey: ["gym-waitlist-settings", gymId],
    queryFn: async () => {
      if (!gymId) return null;
      
      const { data, error } = await supabase
        .from("gym_waitlist_settings")
        .select("*")
        .eq("gym_id", gymId)
        .maybeSingle();

      if (error) throw error;
      return data as GymWaitlistSettings | null;
    },
    enabled: !!gymId,
  });
}

export function useUpsertWaitlistSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Omit<GymWaitlistSettings, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("gym_waitlist_settings")
        .upsert(settings, { onConflict: "gym_id" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gym-waitlist-settings", variables.gym_id] });
      toast({ title: "Waitlist settings saved" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to save settings", description: error.message, variant: "destructive" });
    },
  });
}

// =====================================================
// Failed Payments
// =====================================================

export interface GymFailedPayment {
  id: string;
  gym_id: string;
  member_id: string;
  membership_id: string | null;
  amount: number;
  currency: string;
  failure_reason: string | null;
  stripe_payment_intent_id: string | null;
  retry_count: number;
  last_retry_at: string | null;
  next_retry_at: string | null;
  max_retries: number;
  status: "pending" | "retrying" | "resolved" | "failed" | "cancelled";
  resolved_at: string | null;
  resolution_notes: string | null;
  member_notified: boolean;
  member_notified_at: string | null;
  staff_notified: boolean;
  staff_notified_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  member?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
}

export function useGymFailedPayments(gymId: string | undefined) {
  return useQuery({
    queryKey: ["gym-failed-payments", gymId],
    queryFn: async () => {
      if (!gymId) return [];
      
      const { data, error } = await supabase
        .from("gym_failed_payments")
        .select(`
          *,
          member:gym_members(first_name, last_name, email)
        `)
        .eq("gym_id", gymId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as GymFailedPayment[];
    },
    enabled: !!gymId,
  });
}

export function useResolveFailedPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, gymId, notes }: { id: string; gymId: string; notes?: string }) => {
      const { data, error } = await supabase
        .from("gym_failed_payments")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          resolution_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gym-failed-payments", variables.gymId] });
      toast({ title: "Payment marked as resolved" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to resolve payment", description: error.message, variant: "destructive" });
    },
  });
}

export function useCancelFailedPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, gymId, notes }: { id: string; gymId: string; notes?: string }) => {
      const { data, error } = await supabase
        .from("gym_failed_payments")
        .update({
          status: "cancelled",
          resolution_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gym-failed-payments", variables.gymId] });
      toast({ title: "Payment cancelled" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to cancel payment", description: error.message, variant: "destructive" });
    },
  });
}

// =====================================================
// Automation Logs
// =====================================================

export interface GymAutomationLog {
  id: string;
  gym_id: string;
  automation_type: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  status: "success" | "failed" | "skipped";
  message: string | null;
  metadata: Record<string, unknown>;
  executed_at: string;
}

export function useGymAutomationLogs(gymId: string | undefined, limit = 50) {
  return useQuery({
    queryKey: ["gym-automation-logs", gymId, limit],
    queryFn: async () => {
      if (!gymId) return [];
      
      const { data, error } = await supabase
        .from("gym_automation_logs")
        .select("*")
        .eq("gym_id", gymId)
        .order("executed_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as GymAutomationLog[];
    },
    enabled: !!gymId,
  });
}

// =====================================================
// Waitlist Promotions
// =====================================================

export interface GymWaitlistPromotion {
  id: string;
  gym_id: string;
  class_schedule_id: string;
  member_id: string;
  promoted_from_position: number;
  promotion_type: "auto" | "manual";
  promoted_at: string;
  notification_sent: boolean;
  notification_sent_at: string | null;
}

export function useGymWaitlistPromotions(gymId: string | undefined) {
  return useQuery({
    queryKey: ["gym-waitlist-promotions", gymId],
    queryFn: async () => {
      if (!gymId) return [];
      
      const { data, error } = await supabase
        .from("gym_waitlist_promotions")
        .select("*")
        .eq("gym_id", gymId)
        .order("promoted_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as GymWaitlistPromotion[];
    },
    enabled: !!gymId,
  });
}
