import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type DocumentType = 'identity' | 'certification' | 'insurance' | 'qualification';
export type DocumentStatus = 'pending' | 'approved' | 'rejected';
export type VerificationStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

export interface AIDocumentAnalysis {
  documentTypeMatch: boolean;
  extractedInfo: {
    holderName?: string;
    issuingAuthority?: string;
    issueDate?: string;
    expiryDate?: string;
    documentNumber?: string;
  };
  qualityAssessment: {
    isReadable: boolean;
    isComplete: boolean;
    hasWatermarks: boolean;
  };
  issues: string[];
  confidenceScore: number;
  shouldFlag: boolean;
  flagReasons: string[];
  recommendation: 'approve' | 'review' | 'reject';
  summary: string;
}

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
  // AI analysis fields (stored as JSON)
  ai_analysis: unknown | null;
  ai_confidence_score: number | null;
  ai_flagged: boolean | null;
  ai_flagged_reasons: string[] | null;
  ai_analyzed_at: string | null;
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

// Analyze document with AI
export const useAIDocumentAnalysis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      documentUrl,
      documentType,
      fileName,
    }: {
      documentId: string;
      documentUrl: string;
      documentType: DocumentType;
      fileName: string;
    }) => {
      // Call AI analysis edge function
      const { data, error } = await supabase.functions.invoke('ai-document-verification', {
        body: { documentUrl, documentType, fileName },
      });

      if (error) throw error;

      const analysis = data.analysis as AIDocumentAnalysis;

      // Update document with AI analysis results
      const { error: updateError } = await supabase
        .from("coach_verification_documents")
        .update({
          ai_analysis: analysis as any,
          ai_confidence_score: analysis.confidenceScore,
          ai_flagged: analysis.shouldFlag,
          ai_flagged_reasons: analysis.flagReasons,
          ai_analyzed_at: new Date().toISOString(),
        })
        .eq("id", documentId);

      if (updateError) throw updateError;

      return analysis;
    },
    onSuccess: (analysis) => {
      queryClient.invalidateQueries({ queryKey: ["verification-documents"] });
      queryClient.invalidateQueries({ queryKey: ["coach-verification-documents"] });
      
      if (analysis.shouldFlag) {
        toast.warning(`AI flagged document for review: ${analysis.flagReasons[0] || 'See details'}`);
      } else if (analysis.recommendation === 'approve') {
        toast.success(`AI analysis complete: Recommended for approval (${analysis.confidenceScore}% confidence)`);
      } else {
        toast.info(`AI analysis complete: ${analysis.recommendation} (${analysis.confidenceScore}% confidence)`);
      }
    },
    onError: (error) => {
      console.error('AI analysis failed:', error);
      toast.error("AI analysis failed - manual review required");
    },
  });
};

// Upload verification document
export const useUploadVerificationDocument = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const aiAnalysis = useAIDocumentAnalysis();

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

      // Generate signed URL for private bucket access (valid for 1 hour)
      const { data: signedData, error: signedError } = await supabase.storage
        .from("documents")
        .createSignedUrl(filePath, 3600);

      if (signedError) throw signedError;

      // Store the file path (not signed URL) for permanent storage
      // We'll generate signed URLs on-demand when needed
      const storedUrl = `verification/${user.id}/${fileName}`;

      // Create document record with the storage path
      const { data, error } = await supabase
        .from("coach_verification_documents")
        .insert({
          coach_id: profile.id,
          document_type: documentType,
          file_name: file.name,
          file_url: storedUrl,
          file_size: file.size,
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger AI analysis with signed URL (temporary access)
      aiAnalysis.mutate({
        documentId: data.id,
        documentUrl: signedData.signedUrl,
        documentType,
        fileName: file.name,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verification-documents"] });
      toast.success("Document uploaded - AI analysis in progress...");
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

// Admin: Get verification stats (all statuses for dashboard cards)
export const useVerificationStats = () => {
  return useQuery({
    queryKey: ["admin-verification-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_profiles")
        .select(`
          verification_status,
          verified_at
        `)
        .neq("verification_status", "not_submitted");

      if (error) throw error;

      const coaches = data || [];
      
      // Calculate start of current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const pendingCount = coaches.filter(c => c.verification_status === "pending").length;
      const approvedThisMonth = coaches.filter(c => 
        c.verification_status === "approved" && 
        c.verified_at && 
        new Date(c.verified_at) >= startOfMonth
      ).length;
      const rejectedThisMonth = coaches.filter(c => 
        c.verification_status === "rejected" && 
        c.verified_at && 
        new Date(c.verified_at) >= startOfMonth
      ).length;

      return {
        pendingCount,
        approvedThisMonth,
        rejectedThisMonth,
      };
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

// Admin: Review verification (with auto-approve documents)
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
      // Update coach verification status
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

      // If approving, auto-approve all pending documents
      if (approved) {
        const { error: docsError } = await supabase
          .from("coach_verification_documents")
          .update({
            status: "approved",
            reviewed_by: adminId,
            reviewed_at: new Date().toISOString(),
            admin_notes: "Auto-approved with profile verification",
          })
          .eq("coach_id", coachId)
          .eq("status", "pending");

        if (docsError) {
          console.error("Failed to auto-approve documents:", docsError);
          // Don't throw - profile was already approved
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-verifications"] });
      queryClient.invalidateQueries({ queryKey: ["coach-verification-documents"] });
      toast.success(
        variables.approved 
          ? "Coach verified - all pending documents auto-approved" 
          : "Verification rejected"
      );
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

// Admin: Re-run AI analysis for a document
export const useRerunAIAnalysis = () => {
  const aiAnalysis = useAIDocumentAnalysis();

  return useMutation({
    mutationFn: async (document: VerificationDocument) => {
      // Generate fresh signed URL for AI analysis
      const { data: signedData, error: signedError } = await supabase.storage
        .from("documents")
        .createSignedUrl(document.file_url, 3600);

      if (signedError) throw signedError;

      return aiAnalysis.mutateAsync({
        documentId: document.id,
        documentUrl: signedData.signedUrl,
        documentType: document.document_type,
        fileName: document.file_name,
      });
    },
  });
};

// Helper to get a signed URL for viewing a document
export const useDocumentSignedUrl = () => {
  return useMutation({
    mutationFn: async (filePath: string) => {
      const { data, error } = await supabase.storage
        .from("documents")
        .createSignedUrl(filePath, 3600);

      if (error) throw error;
      return data.signedUrl;
    },
  });
};
