import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CoachQualification {
  id: string;
  coach_id: string;
  name: string;
  issuing_authority: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  document_number: string | null;
  is_verified: boolean;
  verification_source: string | null;
  verification_document_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateQualificationInput {
  coach_id: string;
  name: string;
  issuing_authority?: string;
  issue_date?: string;
  expiry_date?: string;
  document_number?: string;
}

export interface UpdateQualificationInput {
  id: string;
  name?: string;
  issuing_authority?: string;
  issue_date?: string;
  expiry_date?: string;
  document_number?: string;
}

// Hook to fetch qualifications for a coach (public view)
export function useCoachQualifications(coachId: string | undefined) {
  return useQuery({
    queryKey: ["coach-qualifications", coachId],
    queryFn: async () => {
      if (!coachId) return [];
      
      const { data, error } = await supabase
        .from("coach_qualifications")
        .select("*")
        .eq("coach_id", coachId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CoachQualification[];
    },
    enabled: !!coachId,
  });
}

// Hook to fetch qualifications for the current coach (settings view)
export function useMyQualifications() {
  return useQuery({
    queryKey: ["my-qualifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // First get the coach profile
      const { data: profile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) return [];

      const { data, error } = await supabase
        .from("coach_qualifications")
        .select("*")
        .eq("coach_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CoachQualification[];
    },
  });
}

// Hook to create a qualification
export function useCreateQualification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateQualificationInput) => {
      const { data, error } = await supabase
        .from("coach_qualifications")
        .insert({
          coach_id: input.coach_id,
          name: input.name,
          issuing_authority: input.issuing_authority || null,
          issue_date: input.issue_date || null,
          expiry_date: input.expiry_date || null,
          document_number: input.document_number || null,
          is_verified: false,
          verification_source: null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-qualifications"] });
      queryClient.invalidateQueries({ queryKey: ["coach-qualifications", data.coach_id] });
      toast.success("Qualification added");
    },
    onError: () => {
      toast.error("Failed to add qualification");
    },
  });
}

// Hook to update a qualification
export function useUpdateQualification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateQualificationInput) => {
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from("coach_qualifications")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-qualifications"] });
      queryClient.invalidateQueries({ queryKey: ["coach-qualifications", data.coach_id] });
      toast.success("Qualification updated");
    },
    onError: () => {
      toast.error("Failed to update qualification");
    },
  });
}

// Hook to delete a qualification
export function useDeleteQualification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("coach_qualifications")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-qualifications"] });
      toast.success("Qualification removed");
    },
    onError: () => {
      toast.error("Failed to remove qualification");
    },
  });
}
