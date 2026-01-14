import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { toast } from "sonner";

export interface GradingEvent {
  id: string;
  gym_id: string;
  location_id: string | null;
  name: string;
  description: string | null;
  grading_date: string;
  registration_deadline: string | null;
  grades_available: string[] | null;
  max_participants: number | null;
  fee_amount: number | null;
  currency: string;
  status: string;
  examiner_name: string | null;
  examiner_organization: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  location?: {
    id: string;
    name: string;
  };
  registrations?: GradingRegistration[];
}

export interface GradingRegistration {
  id: string;
  grading_event_id: string;
  member_id: string;
  current_grade: string | null;
  attempting_grade: string | null;
  status: string;
  fee_paid: boolean;
  payment_id: string | null;
  result_notes: string | null;
  graded_by: string | null;
  graded_at: string | null;
  registered_at: string;
  created_at: string;
  updated_at: string;
  member?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar_url: string | null;
    current_grade: string | null;
  };
}

// Fetch all grading events for a gym
export function useGymGradingEvents(options?: { status?: string }) {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-grading-events", gym?.id, options?.status],
    queryFn: async () => {
      if (!gym?.id) return [];

      let query = supabase
        .from("gym_grading_events")
        .select(`
          *,
          location:gym_locations(id, name)
        `)
        .eq("gym_id", gym.id)
        .order("grading_date", { ascending: true });

      if (options?.status) {
        query = query.eq("status", options.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as GradingEvent[];
    },
    enabled: !!gym?.id,
  });
}

// Fetch a single grading event with registrations
export function useGymGradingEvent(eventId: string | undefined) {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-grading-event", eventId],
    queryFn: async () => {
      if (!eventId || !gym?.id) return null;

      const { data, error } = await supabase
        .from("gym_grading_events")
        .select(`
          *,
          location:gym_locations(id, name),
          registrations:gym_grading_registrations(
            *,
            member:gym_members(id, first_name, last_name, email, avatar_url, current_grade)
          )
        `)
        .eq("id", eventId)
        .eq("gym_id", gym.id)
        .single();

      if (error) throw error;
      return data as GradingEvent;
    },
    enabled: !!eventId && !!gym?.id,
  });
}

// Create a new grading event
export function useCreateGradingEvent() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: Partial<GradingEvent>) => {
      if (!gym?.id) throw new Error("No gym selected");

      const { data, error } = await supabase
        .from("gym_grading_events")
        .insert({
          ...eventData,
          gym_id: gym.id,
        } as never)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-grading-events", gym?.id] });
      toast.success("Grading event created successfully");
    },
    onError: (error) => {
      console.error("Failed to create grading event:", error);
      toast.error("Failed to create grading event");
    },
  });
}

// Update a grading event
export function useUpdateGradingEvent() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, updates }: { eventId: string; updates: Partial<GradingEvent> }) => {
      const { data, error } = await supabase
        .from("gym_grading_events")
        .update(updates)
        .eq("id", eventId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["gym-grading-events", gym?.id] });
      queryClient.invalidateQueries({ queryKey: ["gym-grading-event", eventId] });
      toast.success("Grading event updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update grading event:", error);
      toast.error("Failed to update grading event");
    },
  });
}

// Delete a grading event
export function useDeleteGradingEvent() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from("gym_grading_events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-grading-events", gym?.id] });
      toast.success("Grading event deleted");
    },
    onError: (error) => {
      console.error("Failed to delete grading event:", error);
      toast.error("Failed to delete grading event");
    },
  });
}

// Update registration status (approve, pass, fail, absent)
export function useUpdateGradingRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      registrationId,
      updates,
    }: {
      registrationId: string;
      updates: Partial<GradingRegistration>;
    }) => {
      const { data, error } = await supabase
        .from("gym_grading_registrations")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", registrationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["gym-grading-event", data.grading_event_id] });
      toast.success("Registration updated");
    },
    onError: (error) => {
      console.error("Failed to update registration:", error);
      toast.error("Failed to update registration");
    },
  });
}

// Record grading result and update member grade
export function useRecordGradingResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      registrationId,
      memberId,
      passed,
      newGrade,
      notes,
      staffId,
    }: {
      registrationId: string;
      memberId: string;
      passed: boolean;
      newGrade?: string;
      notes?: string;
      staffId?: string;
    }) => {
      // Update registration status
      const { data: registration, error: regError } = await supabase
        .from("gym_grading_registrations")
        .update({
          status: passed ? "passed" : "failed",
          result_notes: notes,
          graded_by: staffId,
          graded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", registrationId)
        .select()
        .single();

      if (regError) throw regError;

      // If passed, update member's grade
      if (passed && newGrade) {
        // First get current member data
        const { data: member } = await supabase
          .from("gym_members")
          .select("current_grade, grading_history")
          .eq("id", memberId)
          .single();

        const currentHistory = (member?.grading_history as unknown[]) || [];
        const newHistory = [
          ...currentHistory,
          {
            grade: newGrade,
            achieved_at: new Date().toISOString(),
            registration_id: registrationId,
            previous_grade: member?.current_grade,
          },
        ];

        const { error: memberError } = await supabase
          .from("gym_members")
          .update({
            current_grade: newGrade,
            grade_achieved_at: new Date().toISOString(),
            grading_history: newHistory as never,
            eligible_for_grading: false,
          })
          .eq("id", memberId);

        if (memberError) throw memberError;
      }

      return registration;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["gym-grading-event", data.grading_event_id] });
      queryClient.invalidateQueries({ queryKey: ["gym-members"] });
      toast.success("Grading result recorded");
    },
    onError: (error) => {
      console.error("Failed to record grading result:", error);
      toast.error("Failed to record grading result");
    },
  });
}

// Get eligible members for grading
export function useEligibleMembersForGrading() {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-eligible-for-grading", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return [];

      const { data, error } = await supabase
        .from("gym_members")
        .select("id, first_name, last_name, email, avatar_url, current_grade, grade_achieved_at")
        .eq("gym_id", gym.id)
        .eq("eligible_for_grading", true)
        .eq("status", "active")
        .order("last_name", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!gym?.id,
  });
}

// Register a member for grading
export function useRegisterMemberForGrading() {
  const queryClient = useQueryClient();
  const { gym } = useGym();

  return useMutation({
    mutationFn: async ({
      eventId,
      memberId,
      currentGrade,
      attemptingGrade,
    }: {
      eventId: string;
      memberId: string;
      currentGrade?: string;
      attemptingGrade: string;
    }) => {
      const { data, error } = await supabase
        .from("gym_grading_registrations")
        .insert({
          grading_event_id: eventId,
          member_id: memberId,
          current_grade: currentGrade,
          attempting_grade: attemptingGrade,
          status: "registered",
          registered_at: new Date().toISOString(),
        } as never)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["gym-grading-event", data.grading_event_id] });
      queryClient.invalidateQueries({ queryKey: ["gym-grading-events", gym?.id] });
      toast.success("Member registered for grading");
    },
    onError: (error: Error) => {
      console.error("Failed to register member:", error);
      if (error.message.includes("duplicate")) {
        toast.error("Member is already registered for this grading");
      } else {
        toast.error("Failed to register member");
      }
    },
  });
}

// Get grading stats for dashboard
export function useGymGradingStats() {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-grading-stats", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return null;

      const [upcomingResult, totalPassedResult, eligibleResult] = await Promise.all([
        // Upcoming events
        supabase
          .from("gym_grading_events")
          .select("id", { count: "exact", head: true })
          .eq("gym_id", gym.id)
          .eq("status", "upcoming")
          .gte("grading_date", new Date().toISOString()),
        // Total passed this year
        supabase
          .from("gym_grading_registrations")
          .select("id", { count: "exact", head: true })
          .eq("status", "passed")
          .gte("graded_at", new Date(new Date().getFullYear(), 0, 1).toISOString()),
        // Eligible members
        supabase
          .from("gym_members")
          .select("id", { count: "exact", head: true })
          .eq("gym_id", gym.id)
          .eq("eligible_for_grading", true)
          .eq("status", "active"),
      ]);

      return {
        upcomingEvents: upcomingResult.count || 0,
        passedThisYear: totalPassedResult.count || 0,
        eligibleMembers: eligibleResult.count || 0,
      };
    },
    enabled: !!gym?.id,
  });
}

// Toggle member's grading eligibility
export function useToggleGradingEligibility() {
  const queryClient = useQueryClient();
  const { gym } = useGym();

  return useMutation({
    mutationFn: async ({ memberId, eligible }: { memberId: string; eligible: boolean }) => {
      const { data, error } = await supabase
        .from("gym_members")
        .update({ eligible_for_grading: eligible })
        .eq("id", memberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-eligible-for-grading", gym?.id] });
      queryClient.invalidateQueries({ queryKey: ["gym-members"] });
      toast.success("Eligibility updated");
    },
    onError: (error) => {
      console.error("Failed to update eligibility:", error);
      toast.error("Failed to update eligibility");
    },
  });
}
