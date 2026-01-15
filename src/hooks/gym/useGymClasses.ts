import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { toast } from "sonner";
import { startOfWeek, endOfWeek, startOfDay, endOfDay, addDays } from "date-fns";

export interface GymClassType {
  id: string;
  gym_id: string;
  name: string;
  description: string | null;
  short_description: string | null;
  color: string;
  icon: string | null;
  image_url: string | null;
  default_duration_minutes: number;
  default_capacity: number;
  requires_booking: boolean;
  allow_drop_in: boolean;
  cancellation_deadline_hours: number;
  credits_required: number;
  difficulty_level: string | null;
  equipment_needed: string[] | null;
  is_active: boolean;
  sort_order: number;
}

export interface GymClass {
  id: string;
  gym_id: string;
  class_type_id: string;
  location_id: string | null;
  instructor_id: string | null;
  name: string;
  description: string | null;
  start_time: string;
  end_time: string;
  duration_minutes: number | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  capacity: number;
  waitlist_capacity: number;
  booked_count: number;
  waitlist_count: number;
  attended_count: number;
  booking_opens_hours_before: number;
  booking_closes_hours_before: number;
  cancellation_deadline_hours: number;
  credits_required: number;
  room: string | null;
  status: string;
  // Joined data
  class_type?: GymClassType;
  instructor?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  location?: {
    id: string;
    name: string;
  };
}

export interface ClassBooking {
  id: string;
  class_id: string;
  member_id: string;
  membership_id: string | null;
  status: string;
  waitlist_position: number | null;
  checked_in_at: string | null;
  credits_used: number;
  booked_at: string;
  member?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

// Fetch class types for a gym
export function useGymClassTypes() {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-class-types", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return [];

      const { data, error } = await supabase
        .from("gym_class_types")
        .select("*")
        .eq("gym_id", gym.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as GymClassType[];
    },
    enabled: !!gym?.id,
  });
}

// Fetch classes for a date range
interface UseGymClassesOptions {
  startDate?: Date;
  endDate?: Date;
  classTypeId?: string;
  instructorId?: string;
  locationId?: string;
}

export function useGymClasses(options: UseGymClassesOptions = {}) {
  const { gym } = useGym();
  const {
    startDate = startOfWeek(new Date(), { weekStartsOn: 1 }),
    endDate = endOfWeek(new Date(), { weekStartsOn: 1 }),
    classTypeId,
    instructorId,
    locationId,
  } = options;

  return useQuery({
    queryKey: ["gym-classes", gym?.id, startDate.toISOString(), endDate.toISOString(), classTypeId, instructorId, locationId],
    queryFn: async () => {
      if (!gym?.id) return [];

      let query = supabase
        .from("gym_classes")
        .select(`
          *,
          class_type:gym_class_types(*),
          instructor:gym_staff(id, display_name, avatar_url),
          location:gym_locations(id, name)
        `)
        .eq("gym_id", gym.id)
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString())
        .neq("status", "cancelled")
        .eq("is_recurring_template", false)
        .order("start_time", { ascending: true });

      if (classTypeId) {
        query = query.eq("class_type_id", classTypeId);
      }
      if (instructorId) {
        query = query.eq("instructor_id", instructorId);
      }
      if (locationId) {
        query = query.eq("location_id", locationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as GymClass[];
    },
    enabled: !!gym?.id,
  });
}

// Fetch today's classes
export function useTodaysClasses() {
  const today = new Date();
  return useGymClasses({
    startDate: startOfDay(today),
    endDate: endOfDay(today),
  });
}

// Fetch a single class with bookings
export function useGymClass(classId: string | undefined) {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-class", classId],
    queryFn: async () => {
      if (!classId || !gym?.id) return null;

      const { data, error } = await supabase
        .from("gym_classes")
        .select(`
          *,
          class_type:gym_class_types(*),
          instructor:gym_staff(id, display_name, avatar_url, email),
          location:gym_locations(id, name),
          bookings:gym_class_bookings(
            *,
            member:gym_members(id, first_name, last_name, email, avatar_url, current_grade)
          )
        `)
        .eq("id", classId)
        .eq("gym_id", gym.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!classId && !!gym?.id,
  });
}

// Create a new class
export function useCreateGymClass() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (classData: Partial<GymClass>) => {
      if (!gym?.id) throw new Error("No gym selected");

      const { data, error } = await supabase
        .from("gym_classes")
        .insert({
          ...classData,
          gym_id: gym.id,
        } as never)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-classes", gym?.id] });
      toast.success("Class created successfully");
    },
    onError: (error) => {
      console.error("Failed to create class:", error);
      toast.error("Failed to create class");
    },
  });
}

// Update a class
export function useUpdateGymClass() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classId, updates }: { classId: string; updates: Partial<GymClass> }) => {
      const { data, error } = await supabase
        .from("gym_classes")
        .update(updates)
        .eq("id", classId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: ["gym-classes", gym?.id] });
      queryClient.invalidateQueries({ queryKey: ["gym-class", classId] });
      toast.success("Class updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update class:", error);
      toast.error("Failed to update class");
    },
  });
}

// Cancel a class
export function useCancelGymClass() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classId, reason }: { classId: string; reason?: string }) => {
      const { data, error } = await supabase
        .from("gym_classes")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
        })
        .eq("id", classId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: ["gym-classes", gym?.id] });
      queryClient.invalidateQueries({ queryKey: ["gym-class", classId] });
      toast.success("Class cancelled");
    },
    onError: (error) => {
      console.error("Failed to cancel class:", error);
      toast.error("Failed to cancel class");
    },
  });
}

// Check in a member to a class
export function useCheckInMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, staffId }: { bookingId: string; staffId?: string }) => {
      const { data, error } = await supabase
        .from("gym_class_bookings")
        .update({
          status: "attended",
          checked_in_at: new Date().toISOString(),
          checked_in_by: staffId,
          check_in_method: "manual",
        })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["gym-class", data.class_id] });
      toast.success("Member checked in");
    },
    onError: (error) => {
      console.error("Failed to check in member:", error);
      toast.error("Failed to check in member");
    },
  });
}

// Get class stats for dashboard
export function useGymClassStats() {
  const { gym } = useGym();
  const today = new Date();

  return useQuery({
    queryKey: ["gym-class-stats", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return null;

      const [todayResult, thisWeekResult, attendanceResult] = await Promise.all([
        // Today's classes
        supabase
          .from("gym_classes")
          .select("id", { count: "exact", head: true })
          .eq("gym_id", gym.id)
          .eq("status", "scheduled")
          .gte("start_time", startOfDay(today).toISOString())
          .lte("start_time", endOfDay(today).toISOString()),
        // This week's classes
        supabase
          .from("gym_classes")
          .select("id", { count: "exact", head: true })
          .eq("gym_id", gym.id)
          .eq("status", "scheduled")
          .gte("start_time", startOfWeek(today, { weekStartsOn: 1 }).toISOString())
          .lte("start_time", endOfWeek(today, { weekStartsOn: 1 }).toISOString()),
        // Average attendance this week
        supabase
          .from("gym_classes")
          .select("attended_count, capacity")
          .eq("gym_id", gym.id)
          .eq("status", "completed")
          .gte("start_time", startOfWeek(today, { weekStartsOn: 1 }).toISOString()),
      ]);

      const attendanceData = attendanceResult.data || [];
      const avgAttendance = attendanceData.length > 0
        ? Math.round(
            attendanceData.reduce((sum, c) => sum + (c.attended_count / c.capacity) * 100, 0) /
              attendanceData.length
          )
        : 0;

      return {
        todayCount: todayResult.count || 0,
        thisWeekCount: thisWeekResult.count || 0,
        avgAttendancePercent: avgAttendance,
      };
    },
    enabled: !!gym?.id,
  });
}
