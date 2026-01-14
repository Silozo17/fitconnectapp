import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { toast } from "sonner";

export interface ClassSchedule {
  id: string;
  gym_id: string;
  class_type_id: string;
  instructor_id: string | null;
  start_time: string;
  end_time: string;
  capacity: number;
  current_bookings: number;
  status: string;
  room: string | null;
  notes: string | null;
  is_recurring: boolean;
  recurring_pattern: string | null;
  class_type?: {
    id: string;
    name: string;
    description: string | null;
    default_duration_minutes: number;
    color: string | null;
  };
  instructor?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface WaitlistEntry {
  id: string;
  class_schedule_id: string;
  member_id: string;
  position: number;
  status: string;
  offered_at: string | null;
  offer_expires_at: string | null;
  responded_at: string | null;
  created_at: string;
}

export interface RecurringBooking {
  id: string;
  gym_id: string;
  member_id: string;
  class_type_id: string;
  day_of_week: number;
  preferred_time: string;
  is_active: boolean;
  auto_book: boolean;
  start_date: string;
  end_date: string | null;
}

export interface CreditPackage {
  id: string;
  gym_id: string;
  name: string;
  description: string | null;
  credit_type: string;
  credits_amount: number;
  price: number;
  currency: string;
  validity_days: number | null;
  is_active: boolean;
  display_order: number;
}

// Hook for class schedules
export function useClassSchedules(dateRange?: { start: Date; end: Date }) {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["class-schedules", gym?.id, dateRange?.start, dateRange?.end],
    queryFn: async () => {
      if (!gym?.id) return [];

      let query = (supabase as any)
        .from("gym_class_schedules")
        .select(`
          *,
          class_type:gym_class_types(*),
          instructor:gym_staff(id, display_name, avatar_url)
        `)
        .eq("gym_id", gym.id)
        .order("start_time", { ascending: true });

      if (dateRange) {
        query = query
          .gte("start_time", dateRange.start.toISOString())
          .lte("start_time", dateRange.end.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ClassSchedule[];
    },
    enabled: !!gym?.id,
  });
}

// Hook for creating/managing schedules
export function useScheduleMutations() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  const createSchedule = useMutation({
    mutationFn: async (schedule: Partial<ClassSchedule>) => {
      const { data, error } = await (supabase as any)
        .from("gym_class_schedules")
        .insert({ ...schedule, gym_id: gym?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-schedules"] });
      toast.success("Class scheduled successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to schedule class: " + error.message);
    },
  });

  const updateSchedule = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ClassSchedule> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from("gym_class_schedules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-schedules"] });
      toast.success("Schedule updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update schedule: " + error.message);
    },
  });

  const cancelSchedule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("gym_class_schedules")
        .update({ status: "cancelled" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-schedules"] });
      toast.success("Class cancelled");
    },
    onError: (error: Error) => {
      toast.error("Failed to cancel class: " + error.message);
    },
  });

  return { createSchedule, updateSchedule, cancelSchedule };
}

// Hook for waitlist
export function useWaitlist(classScheduleId?: string) {
  return useQuery({
    queryKey: ["waitlist", classScheduleId],
    queryFn: async () => {
      if (!classScheduleId) return [];

      const { data, error } = await (supabase as any)
        .from("gym_class_waitlists")
        .select(`
          *,
          member:gym_members(id, display_name, user_id)
        `)
        .eq("class_schedule_id", classScheduleId)
        .order("position", { ascending: true });

      if (error) throw error;
      return data as WaitlistEntry[];
    },
    enabled: !!classScheduleId,
  });
}

export function useWaitlistMutations() {
  const queryClient = useQueryClient();

  const joinWaitlist = useMutation({
    mutationFn: async ({ classScheduleId, memberId }: { classScheduleId: string; memberId: string }) => {
      // Get current max position
      const { data: existing } = await (supabase as any)
        .from("gym_class_waitlists")
        .select("position")
        .eq("class_schedule_id", classScheduleId)
        .order("position", { ascending: false })
        .limit(1);

      const nextPosition = (existing?.[0]?.position || 0) + 1;

      const { data, error } = await (supabase as any)
        .from("gym_class_waitlists")
        .insert({
          class_schedule_id: classScheduleId,
          member_id: memberId,
          position: nextPosition,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["waitlist", variables.classScheduleId] });
      toast.success("Added to waitlist");
    },
    onError: (error: Error) => {
      toast.error("Failed to join waitlist: " + error.message);
    },
  });

  const leaveWaitlist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("gym_class_waitlists")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
      toast.success("Removed from waitlist");
    },
    onError: (error: Error) => {
      toast.error("Failed to leave waitlist: " + error.message);
    },
  });

  return { joinWaitlist, leaveWaitlist };
}

// Hook for credit packages
export function useCreditPackages() {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["credit-packages", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return [];

      const { data, error } = await (supabase as any)
        .from("gym_credit_packages")
        .select("*")
        .eq("gym_id", gym.id)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as CreditPackage[];
    },
    enabled: !!gym?.id,
  });
}

export function useCreditPackageMutations() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  const createPackage = useMutation({
    mutationFn: async (pkg: Partial<CreditPackage>) => {
      const { data, error } = await (supabase as any)
        .from("gym_credit_packages")
        .insert({ ...pkg, gym_id: gym?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-packages"] });
      toast.success("Credit package created");
    },
    onError: (error: Error) => {
      toast.error("Failed to create package: " + error.message);
    },
  });

  const updatePackage = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CreditPackage> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from("gym_credit_packages")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-packages"] });
      toast.success("Package updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update package: " + error.message);
    },
  });

  const deletePackage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("gym_credit_packages")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-packages"] });
      toast.success("Package deactivated");
    },
    onError: (error: Error) => {
      toast.error("Failed to deactivate package: " + error.message);
    },
  });

  return { createPackage, updatePackage, deletePackage };
}

// Hook for recurring bookings
export function useRecurringBookings(memberId?: string) {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["recurring-bookings", gym?.id, memberId],
    queryFn: async () => {
      if (!gym?.id) return [];

      let query = (supabase as any)
        .from("gym_recurring_bookings")
        .select(`
          *,
          class_type:gym_class_types(id, name)
        `)
        .eq("gym_id", gym.id);

      if (memberId) {
        query = query.eq("member_id", memberId);
      }

      const { data, error } = await query.order("day_of_week", { ascending: true });
      if (error) throw error;
      return data as RecurringBooking[];
    },
    enabled: !!gym?.id,
  });
}

export function useRecurringBookingMutations() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  const createRecurring = useMutation({
    mutationFn: async (booking: Partial<RecurringBooking>) => {
      const { data, error } = await (supabase as any)
        .from("gym_recurring_bookings")
        .insert({ ...booking, gym_id: gym?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-bookings"] });
      toast.success("Recurring booking created");
    },
    onError: (error: Error) => {
      toast.error("Failed to create recurring booking: " + error.message);
    },
  });

  const updateRecurring = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RecurringBooking> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from("gym_recurring_bookings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-bookings"] });
      toast.success("Recurring booking updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update recurring booking: " + error.message);
    },
  });

  const cancelRecurring = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("gym_recurring_bookings")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-bookings"] });
      toast.success("Recurring booking cancelled");
    },
    onError: (error: Error) => {
      toast.error("Failed to cancel recurring booking: " + error.message);
    },
  });

  return { createRecurring, updateRecurring, cancelRecurring };
}
