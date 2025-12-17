import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CoachAvailability {
  id: string;
  coach_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export interface SessionType {
  id: string;
  coach_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  currency: string | null;
  is_online: boolean;
  is_in_person: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Payment configuration
  payment_required: 'none' | 'deposit' | 'full';
  deposit_type: 'percentage' | 'fixed';
  deposit_value: number;
}

export interface BookingRequest {
  id: string;
  coach_id: string;
  client_id: string;
  session_type_id: string | null;
  requested_at: string;
  duration_minutes: number;
  is_online: boolean;
  message: string | null;
  status: string;
  responded_at: string | null;
  created_at: string;
  // Payment tracking
  payment_required: string | null;
  payment_status: string | null;
  amount_due: number | null;
  amount_paid: number | null;
  currency: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  client?: {
    first_name: string | null;
    last_name: string | null;
    fitness_goals: string[] | null;
  };
  session_type?: SessionType;
}

// Fetch coach availability for a specific coach
export const useCoachAvailability = (coachId: string) => {
  return useQuery({
    queryKey: ["coach-availability", coachId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_availability")
        .select("*")
        .eq("coach_id", coachId)
        .order("day_of_week");

      if (error) throw error;
      return data as CoachAvailability[];
    },
    enabled: !!coachId,
  });
};

// Fetch session types for a specific coach
export const useSessionTypes = (coachId: string) => {
  return useQuery({
    queryKey: ["session-types", coachId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_types")
        .select("*")
        .eq("coach_id", coachId)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as SessionType[];
    },
    enabled: !!coachId,
  });
};

// Fetch booking requests for the current coach
export const useBookingRequests = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["booking-requests"],
    queryFn: async () => {
      // First get the coach profile
      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (!coachProfile) return [];

      const { data, error } = await supabase
        .from("booking_requests")
        .select(`
          *,
          client:client_profiles!booking_requests_client_id_fkey(
            first_name,
            last_name,
            fitness_goals
          ),
          session_type:session_types(*)
        `)
        .eq("coach_id", coachProfile.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BookingRequest[];
    },
    enabled: !!user,
  });
};

// Mutation to update availability
export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (availability: {
      coach_id: string;
      day_of_week: number;
      start_time: string;
      end_time: string;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("coach_availability")
        .upsert({
          coach_id: availability.coach_id,
          day_of_week: availability.day_of_week,
          start_time: availability.start_time,
          end_time: availability.end_time,
          is_active: availability.is_active ?? true,
        }, { onConflict: "coach_id,day_of_week" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["coach-availability", variables.coach_id] });
      queryClient.invalidateQueries({ queryKey: ["coach-profile-completion"] });
      toast.success("Availability updated");
    },
    onError: () => {
      toast.error("Failed to update availability");
    },
  });
};

// Mutation to create/update session type
export const useUpsertSessionType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionType: Partial<SessionType> & { coach_id: string; name: string; price: number }) => {
      const { data, error } = await supabase
        .from("session_types")
        .upsert(sessionType)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["session-types", variables.coach_id] });
      queryClient.invalidateQueries({ queryKey: ["coach-profile-completion"] });
      toast.success("Session type saved");
    },
    onError: () => {
      toast.error("Failed to save session type");
    },
  });
};

// Mutation to respond to booking request
export const useRespondToBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: "accepted" | "rejected" }) => {
      const { data: request } = await supabase
        .from("booking_requests")
        .select("*, session_type:session_types(*)")
        .eq("id", requestId)
        .single();

      if (!request) throw new Error("Request not found");

      // Update the booking request status
      const { error: updateError } = await supabase
        .from("booking_requests")
        .update({ status, responded_at: new Date().toISOString() })
        .eq("id", requestId);

      if (updateError) throw updateError;

      // If accepted, create a coaching session and establish coach-client relationship
      if (status === "accepted") {
        // Create coach_clients relationship (triggers deal_closed in pipeline)
        await supabase
          .from("coach_clients")
          .upsert({
            coach_id: request.coach_id,
            client_id: request.client_id,
            status: "active",
            plan_type: "session",
          }, { onConflict: "coach_id,client_id" });

        const { data: newSession, error: sessionError } = await supabase
          .from("coaching_sessions")
          .insert({
            coach_id: request.coach_id,
            client_id: request.client_id,
            scheduled_at: request.requested_at,
            duration_minutes: request.duration_minutes,
            is_online: request.is_online,
            session_type: request.session_type?.name || "General",
            status: "scheduled",
            notes: request.message,
          })
          .select()
          .single();

        if (sessionError) throw sessionError;

        // Auto-create video meeting for online sessions
        if (request.is_online && newSession) {
          try {
            await supabase.functions.invoke("video-create-meeting", {
              body: { sessionId: newSession.id, provider: "google_meet" },
            });
          } catch {
            // Video meeting creation is optional - don't fail the booking
          }
        }
      }

      return { status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["booking-requests"] });
      queryClient.invalidateQueries({ queryKey: ["coaching-sessions"] });
      toast.success(data.status === "accepted" ? "Booking accepted!" : "Booking declined");
    },
    onError: () => {
      toast.error("Failed to respond to booking");
    },
  });
};

// Mutation to create a booking request (for clients)
export const useCreateBookingRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (request: {
      coach_id: string;
      session_type_id?: string;
      requested_at: string;
      duration_minutes: number;
      is_online: boolean;
      message?: string;
    }) => {
      // Get client profile
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (!clientProfile) throw new Error("Client profile not found");

      const { data, error } = await supabase
        .from("booking_requests")
        .insert({
          ...request,
          client_id: clientProfile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-booking-requests"] });
      toast.success("Booking request sent!");
    },
    onError: () => {
      toast.error("Failed to send booking request");
    },
  });
};
