import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CoachClient {
  id: string;
  client_id: string;
  coach_id: string;
  status: string;
  plan_type: string | null;
  start_date: string | null;
  created_at: string;
  client_profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    user_id: string;
    fitness_goals: string[] | null;
    weight_kg: number | null;
    height_cm: number | null;
    age: number | null;
    dietary_restrictions: string[] | null;
    allergies: string[] | null;
    medical_conditions: string[] | null;
  } | null;
}

export function useCoachProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coach-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("coach_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useCoachClients() {
  const { data: coachProfile } = useCoachProfile();

  return useQuery({
    queryKey: ["coach-clients", coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile?.id) return [];

      const { data, error } = await supabase
        .from("coach_clients")
        .select(`
          *,
          client_profile:client_profiles!coach_clients_client_id_fkey(
            id,
            first_name,
            last_name,
            user_id,
            fitness_goals,
            weight_kg,
            height_cm,
            age,
            dietary_restrictions,
            allergies,
            medical_conditions
          )
        `)
        .eq("coach_id", coachProfile.id);

      if (error) throw error;
      return data as CoachClient[];
    },
    enabled: !!coachProfile?.id,
  });
}

export function useClientSessions(clientId: string | undefined) {
  const { data: coachProfile } = useCoachProfile();

  return useQuery({
    queryKey: ["client-sessions", clientId, coachProfile?.id],
    queryFn: async () => {
      if (!clientId || !coachProfile?.id) return [];

      const { data, error } = await supabase
        .from("coaching_sessions")
        .select("*")
        .eq("coach_id", coachProfile.id)
        .eq("client_id", clientId)
        .order("scheduled_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!clientId && !!coachProfile?.id,
  });
}

export function useClientNotes(clientId: string | undefined) {
  const { data: coachProfile } = useCoachProfile();

  return useQuery({
    queryKey: ["client-notes", clientId, coachProfile?.id],
    queryFn: async () => {
      if (!clientId || !coachProfile?.id) return [];

      const { data, error } = await supabase
        .from("client_notes")
        .select("*")
        .eq("coach_id", coachProfile.id)
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!clientId && !!coachProfile?.id,
  });
}

export function useClientProgress(clientId: string | undefined) {
  const { data: coachProfile } = useCoachProfile();

  return useQuery({
    queryKey: ["client-progress", clientId, coachProfile?.id],
    queryFn: async () => {
      if (!clientId || !coachProfile?.id) return [];

      const { data, error } = await supabase
        .from("client_progress")
        .select("*")
        .eq("coach_id", coachProfile.id)
        .eq("client_id", clientId)
        .order("recorded_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!clientId && !!coachProfile?.id,
  });
}

export function useClientPlanAssignments(clientId: string | undefined) {
  const { data: coachProfile } = useCoachProfile();

  return useQuery({
    queryKey: ["client-plans", clientId, coachProfile?.id],
    queryFn: async () => {
      if (!clientId || !coachProfile?.id) return [];

      const { data, error } = await supabase
        .from("plan_assignments")
        .select(`
          *,
          training_plan:training_plans!plan_assignments_plan_id_fkey(
            id,
            name,
            description,
            plan_type,
            duration_weeks
          )
        `)
        .eq("coach_id", coachProfile.id)
        .eq("client_id", clientId)
        .order("assigned_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!clientId && !!coachProfile?.id,
  });
}

export function useClientDetail(clientId: string | undefined) {
  const { data: coachProfile } = useCoachProfile();

  return useQuery({
    queryKey: ["client-detail", clientId, coachProfile?.id],
    queryFn: async () => {
      if (!clientId || !coachProfile?.id) return null;

      const { data, error } = await supabase
        .from("coach_clients")
        .select(`
          *,
          client_profile:client_profiles!coach_clients_client_id_fkey(*)
        `)
        .eq("coach_id", coachProfile.id)
        .eq("client_id", clientId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!clientId && !!coachProfile?.id,
  });
}

// Mutations
export function useAddClient() {
  const queryClient = useQueryClient();
  const { data: coachProfile } = useCoachProfile();

  return useMutation({
    mutationFn: async (data: { email: string; firstName: string; lastName: string; planType: string; message?: string }) => {
      if (!coachProfile?.id) throw new Error("Coach profile not found");

      // Send invitation email via edge function
      const response = await supabase.functions.invoke("send-client-invitation", {
        body: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          coachName: coachProfile.display_name || "Your Coach",
          message: data.message,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to send invitation");
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-clients"] });
      toast.success("Invitation sent successfully! The client will receive an email to join.");
    },
    onError: (error) => {
      toast.error("Failed to send invitation: " + error.message);
    },
  });
}

export function useScheduleSession() {
  const queryClient = useQueryClient();
  const { data: coachProfile } = useCoachProfile();

  return useMutation({
    mutationFn: async (data: {
      clientId: string;
      scheduledAt: string;
      duration: number;
      sessionType: string;
      isOnline: boolean;
      location?: string;
      notes?: string;
    }) => {
      if (!coachProfile?.id) throw new Error("Coach profile not found");

      const { error } = await supabase
        .from("coaching_sessions")
        .insert({
          coach_id: coachProfile.id,
          client_id: data.clientId,
          scheduled_at: data.scheduledAt,
          duration_minutes: data.duration,
          session_type: data.sessionType,
          is_online: data.isOnline,
          location: data.location,
          notes: data.notes,
          status: "scheduled",
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-sessions"] });
      toast.success("Session scheduled successfully");
    },
    onError: (error) => {
      toast.error("Failed to schedule session: " + error.message);
    },
  });
}

export function useAddNote() {
  const queryClient = useQueryClient();
  const { data: coachProfile } = useCoachProfile();

  return useMutation({
    mutationFn: async (data: {
      clientId: string;
      content: string;
      category: string;
      isPinned: boolean;
    }) => {
      if (!coachProfile?.id) throw new Error("Coach profile not found");

      const { error } = await supabase
        .from("client_notes")
        .insert({
          coach_id: coachProfile.id,
          client_id: data.clientId,
          content: data.content,
          category: data.category,
          is_pinned: data.isPinned,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-notes"] });
      toast.success("Note added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add note: " + error.message);
    },
  });
}

export function useAddProgress() {
  const queryClient = useQueryClient();
  const { data: coachProfile } = useCoachProfile();

  return useMutation({
    mutationFn: async (data: {
      clientId: string;
      weightKg?: number;
      bodyFatPercentage?: number;
      measurements?: Record<string, number>;
      notes?: string;
    }) => {
      if (!coachProfile?.id) throw new Error("Coach profile not found");

      const { error } = await supabase
        .from("client_progress")
        .insert({
          coach_id: coachProfile.id,
          client_id: data.clientId,
          weight_kg: data.weightKg,
          body_fat_percentage: data.bodyFatPercentage,
          measurements: data.measurements || {},
          notes: data.notes,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-progress"] });
      toast.success("Progress logged successfully");
    },
    onError: (error) => {
      toast.error("Failed to log progress: " + error.message);
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { sessionId: string; status?: string; notes?: string }) => {
      const { error } = await supabase
        .from("coaching_sessions")
        .update({
          status: data.status,
          notes: data.notes,
        })
        .eq("id", data.sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-sessions"] });
      toast.success("Session updated");
    },
    onError: (error) => {
      toast.error("Failed to update session: " + error.message);
    },
  });
}
