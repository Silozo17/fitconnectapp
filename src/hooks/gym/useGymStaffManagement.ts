import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { toast } from "sonner";

interface StaffShift {
  id: string;
  gym_id: string;
  staff_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  location_id: string | null;
  notes: string | null;
  status: string;
  actual_start_time: string | null;
  actual_end_time: string | null;
  created_at: string;
  staff?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    role: string;
  };
  location?: {
    id: string;
    name: string;
  };
}

interface TimeEntry {
  id: string;
  gym_id: string;
  staff_id: string;
  shift_id: string | null;
  clock_in: string;
  clock_out: string | null;
  break_minutes: number;
  notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  status: string;
  staff?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface PayrollEntry {
  id: string;
  gym_id: string;
  staff_id: string;
  period_start: string;
  period_end: string;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  hourly_rate: number | null;
  gross_pay: number | null;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  paid_at: string | null;
  notes: string | null;
  staff?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface PayRate {
  id: string;
  gym_id: string;
  staff_id: string;
  hourly_rate: number;
  overtime_rate: number | null;
  effective_from: string;
  effective_to: string | null;
  is_current: boolean;
}

// Shifts
export function useGymStaffShifts(dateRange?: { start: string; end: string }) {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-staff-shifts", gym?.id, dateRange],
    queryFn: async () => {
      if (!gym?.id) return [];

      let query = (supabase as any)
        .from("gym_staff_shifts")
        .select(`
          *,
          staff:gym_staff(id, display_name, avatar_url, role),
          location:gym_locations(id, name)
        `)
        .eq("gym_id", gym.id)
        .order("shift_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (dateRange) {
        query = query
          .gte("shift_date", dateRange.start)
          .lte("shift_date", dateRange.end);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as StaffShift[];
    },
    enabled: !!gym?.id,
  });
}

export function useCreateStaffShift() {
  const queryClient = useQueryClient();
  const { gym } = useGym();

  return useMutation({
    mutationFn: async (shift: Omit<StaffShift, "id" | "created_at" | "staff" | "location">) => {
      const { data, error } = await (supabase as any)
        .from("gym_staff_shifts")
        .insert([{ ...shift, gym_id: gym?.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-staff-shifts"] });
      toast.success("Shift created");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create shift: ${error.message}`);
    },
  });
}

export function useUpdateStaffShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<StaffShift> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from("gym_staff_shifts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-staff-shifts"] });
      toast.success("Shift updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update shift: ${error.message}`);
    },
  });
}

export function useDeleteStaffShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("gym_staff_shifts")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-staff-shifts"] });
      toast.success("Shift deleted");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete shift: ${error.message}`);
    },
  });
}

// Time Entries
export function useGymTimeEntries(dateRange?: { start: string; end: string }) {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-time-entries", gym?.id, dateRange],
    queryFn: async () => {
      if (!gym?.id) return [];

      let query = (supabase as any)
        .from("gym_staff_time_entries")
        .select(`
          *,
          staff:gym_staff(id, display_name, avatar_url)
        `)
        .eq("gym_id", gym.id)
        .order("clock_in", { ascending: false });

      if (dateRange) {
        query = query
          .gte("clock_in", dateRange.start)
          .lte("clock_in", dateRange.end);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TimeEntry[];
    },
    enabled: !!gym?.id,
  });
}

export function useClockIn() {
  const queryClient = useQueryClient();
  const { gym } = useGym();

  return useMutation({
    mutationFn: async (staffId: string) => {
      const { data, error } = await (supabase as any)
        .from("gym_staff_time_entries")
        .insert([{
          gym_id: gym?.id,
          staff_id: staffId,
          clock_in: new Date().toISOString(),
          status: "pending",
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-time-entries"] });
      toast.success("Clocked in");
    },
    onError: (error: Error) => {
      toast.error(`Failed to clock in: ${error.message}`);
    },
  });
}

export function useClockOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      const { data, error } = await (supabase as any)
        .from("gym_staff_time_entries")
        .update({
          clock_out: new Date().toISOString(),
        })
        .eq("id", entryId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-time-entries"] });
      toast.success("Clocked out");
    },
    onError: (error: Error) => {
      toast.error(`Failed to clock out: ${error.message}`);
    },
  });
}

export function useApproveTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entryId, approvedBy }: { entryId: string; approvedBy: string }) => {
      const { data, error } = await (supabase as any)
        .from("gym_staff_time_entries")
        .update({
          status: "approved",
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
        })
        .eq("id", entryId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-time-entries"] });
      toast.success("Time entry approved");
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve: ${error.message}`);
    },
  });
}

// Payroll
export function useGymPayroll() {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-payroll", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return [];

      const { data, error } = await (supabase as any)
        .from("gym_staff_payroll")
        .select(`
          *,
          staff:gym_staff(id, display_name, avatar_url)
        `)
        .eq("gym_id", gym.id)
        .order("period_start", { ascending: false });

      if (error) throw error;
      return data as PayrollEntry[];
    },
    enabled: !!gym?.id,
  });
}

export function useCreatePayrollEntry() {
  const queryClient = useQueryClient();
  const { gym } = useGym();

  return useMutation({
    mutationFn: async (entry: Omit<PayrollEntry, "id" | "staff">) => {
      const { data, error } = await (supabase as any)
        .from("gym_staff_payroll")
        .insert([{ ...entry, gym_id: gym?.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-payroll"] });
      toast.success("Payroll entry created");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create payroll entry: ${error.message}`);
    },
  });
}

// Pay Rates
export function useStaffPayRates(staffId?: string) {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-pay-rates", gym?.id, staffId],
    queryFn: async () => {
      if (!gym?.id) return [];

      let query = (supabase as any)
        .from("gym_staff_pay_rates")
        .select("*")
        .eq("gym_id", gym.id)
        .order("effective_from", { ascending: false });

      if (staffId) {
        query = query.eq("staff_id", staffId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PayRate[];
    },
    enabled: !!gym?.id,
  });
}

export function useSetPayRate() {
  const queryClient = useQueryClient();
  const { gym } = useGym();

  return useMutation({
    mutationFn: async (rate: Omit<PayRate, "id">) => {
      // First, mark existing rates as not current
      await (supabase as any)
        .from("gym_staff_pay_rates")
        .update({ is_current: false, effective_to: new Date().toISOString().split("T")[0] })
        .eq("staff_id", rate.staff_id)
        .eq("is_current", true);

      // Insert new rate
      const { data, error } = await (supabase as any)
        .from("gym_staff_pay_rates")
        .insert([{ ...rate, gym_id: gym?.id, is_current: true }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-pay-rates"] });
      toast.success("Pay rate updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to set pay rate: ${error.message}`);
    },
  });
}

export function useUpdateGymStaff() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ staffId, updates }: { staffId: string; updates: Record<string, unknown> }) => {
      const { data, error } = await (supabase as any)
        .from("gym_staff")
        .update(updates)
        .eq("id", staffId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-staff", gym?.id] });
      queryClient.invalidateQueries({ queryKey: ["gym-instructors", gym?.id] });
      toast.success("Staff member updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update staff: ${error.message}`);
    },
  });
}

export function useDeactivateGymStaff() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ staffId, hardDelete = false }: { staffId: string; hardDelete?: boolean }) => {
      if (hardDelete) {
        const { error } = await (supabase as any)
          .from("gym_staff")
          .delete()
          .eq("id", staffId);
        if (error) throw error;
      } else {
        // Soft delete - set status to 'inactive'
        const { error } = await (supabase as any)
          .from("gym_staff")
          .update({ status: "inactive" })
          .eq("id", staffId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-staff", gym?.id] });
      queryClient.invalidateQueries({ queryKey: ["gym-instructors", gym?.id] });
      toast.success("Staff member removed");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove staff: ${error.message}`);
    },
  });
}
