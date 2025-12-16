import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type DocumentType = 'identity' | 'certification' | 'insurance' | 'qualification';
export type DocumentStatus = 'pending' | 'approved' | 'rejected';
export type VerificationStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

export interface VerificationDocument {
  id: string;
  coach_id: string;
  document_type: DocumentType;
  file_name: string;
  file_url: string;
  file_size: number | null;
  status: DocumentStatus;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoachVerificationStatus {
  verification_status: VerificationStatus;
  is_verified: boolean;
  verified_at: string | null;
  verification_notes: string | null;
}

// Get coach's verification status
export const useVerificationStatus = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["verification-status", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_profiles")
        .select("verification_status, is_verified, verified_at, verification_notes")
        .eq("user_id", user!.id)
        .single();

      if (error) throw error;
      return data as CoachVerificationStatus;
    },
    enabled: !!user,
  });
};

// Get coach's verification documents
export const useVerificationDocuments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["verification-documents", user?.id],
    queryFn: async () => {
      // First get coach profile id
      const { data: profile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user!.id)
        .single();

      if (!profile) return [];

      const { data, error } = await supabase
        .from("coach_verification_documents")
        .select("*")
        .eq("coach_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as VerificationDocument[];
    },
    enabled: !!user,
  });
};

// Upload verification document
export const useUploadVerificationDocument = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      file, 
      documentType 
    }: { 
      file: File; 
      documentType: DocumentType;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Get coach profile
      const { data: profile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) throw new Error("Coach profile not found");

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${documentType}-${Date.now()}.${fileExt}`;
      const filePath = `verification/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      // Create document record
      const { data, error } = await supabase
        .from("coach_verification_documents")
        .insert({
          coach_id: profile.id,
          document_type: documentType,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verification-documents"] });
      toast.success("Document uploaded successfully");
    },
    onError: (error) => {
      toast.error("Failed to upload document: " + error.message);
    },
  });
};

// Delete verification document
export const useDeleteVerificationDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from("coach_verification_documents")
        .delete()
        .eq("id", documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verification-documents"] });
      toast.success("Document deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete document: " + error.message);
    },
  });
};

// Submit for verification
export const useSubmitForVerification = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("coach_profiles")
        .update({ verification_status: "pending" })
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verification-status"] });
      toast.success("Verification request submitted");
    },
    onError: (error) => {
      toast.error("Failed to submit: " + error.message);
    },
  });
};

// Admin: Get pending verifications
export const usePendingVerifications = (status?: VerificationStatus) => {
  return useQuery({
    queryKey: ["admin-verifications", status],
    queryFn: async () => {
      let query = supabase
        .from("coach_profiles")
        .select(`
          id,
          user_id,
          display_name,
          profile_image_url,
          coach_types,
          verification_status,
          is_verified,
          verified_at,
          verification_notes,
          created_at
        `)
        .neq("verification_status", "not_submitted");

      if (status) {
        query = query.eq("verification_status", status);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

// Admin: Get documents for a coach
export const useCoachVerificationDocuments = (coachId: string | null) => {
  return useQuery({
    queryKey: ["coach-verification-documents", coachId],
    queryFn: async () => {
      if (!coachId) return [];

      const { data, error } = await supabase
        .from("coach_verification_documents")
        .select("*")
        .eq("coach_id", coachId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as VerificationDocument[];
    },
    enabled: !!coachId,
  });
};

// Admin: Review verification
export const useReviewVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      coachId,
      approved,
      notes,
      adminId,
    }: {
      coachId: string;
      approved: boolean;
      notes?: string;
      adminId: string;
    }) => {
      const { error } = await supabase
        .from("coach_profiles")
        .update({
          verification_status: approved ? "approved" : "rejected",
          is_verified: approved,
          verified_at: approved ? new Date().toISOString() : null,
          verified_by: adminId,
          verification_notes: notes || null,
        })
        .eq("id", coachId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-verifications"] });
      queryClient.invalidateQueries({ queryKey: ["coach-verification-documents"] });
      toast.success(variables.approved ? "Coach verified successfully" : "Verification rejected");
    },
    onError: (error) => {
      toast.error("Failed to review: " + error.message);
    },
  });
};

// Admin: Review individual document
export const useReviewDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      status,
      notes,
      adminId,
    }: {
      documentId: string;
      status: DocumentStatus;
      notes?: string;
      adminId: string;
    }) => {
      const { error } = await supabase
        .from("coach_verification_documents")
        .update({
          status,
          admin_notes: notes || null,
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-verification-documents"] });
      toast.success("Document reviewed");
    },
    onError: (error) => {
      toast.error("Failed to review document: " + error.message);
    },
  });
};
