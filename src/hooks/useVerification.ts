import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { logAdminAction } from "@/hooks/useAuditLog";

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

export type AIAnalysisStatus = 'pending' | 'analyzing' | 'completed' | 'failed';

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
  // New status tracking fields
  ai_analysis_status: AIAnalysisStatus | null;
  ai_analysis_error: string | null;
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

// Analyze document with AI - with status tracking
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
      // Set status to 'analyzing' before calling AI
      await supabase
        .from("coach_verification_documents")
        .update({
          ai_analysis_status: 'analyzing',
          ai_analysis_error: null,
        })
        .eq("id", documentId);

      try {
        // Call AI analysis edge function
        const { data, error } = await supabase.functions.invoke('ai-document-verification', {
          body: { documentUrl, documentType, fileName },
        });

        if (error) {
          // Update status to 'failed' with error
          await supabase
            .from("coach_verification_documents")
            .update({
              ai_analysis_status: 'failed',
              ai_analysis_error: error.message || 'AI analysis failed',
            })
            .eq("id", documentId);
          throw error;
        }

        // Check for error in response body
        if (data.error) {
          await supabase
            .from("coach_verification_documents")
            .update({
              ai_analysis_status: 'failed',
              ai_analysis_error: data.error,
            })
            .eq("id", documentId);
          throw new Error(data.error);
        }

        const analysis = data.analysis as AIDocumentAnalysis;

        // Update document with AI analysis results - status 'completed'
        const { error: updateError } = await supabase
          .from("coach_verification_documents")
          .update({
            ai_analysis: analysis as any,
            ai_confidence_score: analysis.confidenceScore,
            ai_flagged: analysis.shouldFlag,
            ai_flagged_reasons: analysis.flagReasons,
            ai_analyzed_at: new Date().toISOString(),
            ai_analysis_status: 'completed',
            ai_analysis_error: null,
          })
          .eq("id", documentId);

        if (updateError) throw updateError;

        return analysis;
      } catch (err) {
        // Ensure status is set to failed on any error
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        await supabase
          .from("coach_verification_documents")
          .update({
            ai_analysis_status: 'failed',
            ai_analysis_error: errorMessage,
          })
          .eq("id", documentId);
        throw err;
      }
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
      queryClient.invalidateQueries({ queryKey: ["verification-documents"] });
      queryClient.invalidateQueries({ queryKey: ["coach-verification-documents"] });
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

      // Validate file size (max 10MB)
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File too large. Maximum size is 10MB.');
      }

      // Validate image dimensions for image files
      if (file.type.startsWith('image/')) {
        try {
          const img = await createImageBitmap(file);
          if (img.width < 400 || img.height < 400) {
            throw new Error('Image resolution too low. Minimum 400x400 pixels for clear analysis.');
          }
        } catch (dimError) {
          // If we can't check dimensions, continue anyway
          console.warn('Could not validate image dimensions:', dimError);
        }
      }

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
      const storedUrl = `verification/${user.id}/${fileName}`;

      // Create document record with the storage path and initial AI status
      const { data, error } = await supabase
        .from("coach_verification_documents")
        .insert({
          coach_id: profile.id,
          document_type: documentType,
          file_name: file.name,
          file_url: storedUrl,
          file_size: file.size,
          ai_analysis_status: 'pending',
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

      // Log the verification action to audit log
      await logAdminAction({
        userId: adminId,
        action: approved ? "APPROVE_COACH_VERIFICATION" : "REJECT_COACH_VERIFICATION",
        entityType: "coach_profiles",
        entityId: coachId,
        newValues: {
          verification_status: approved ? "approved" : "rejected",
          is_verified: approved,
          notes: notes || null,
        },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-verifications"] });
      queryClient.invalidateQueries({ queryKey: ["coach-verification-documents"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
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

      // Log the document review action to audit log
      await logAdminAction({
        userId: adminId,
        action: status === "approved" ? "APPROVE_VERIFICATION_DOCUMENT" : "REJECT_VERIFICATION_DOCUMENT",
        entityType: "coach_verification_documents",
        entityId: documentId,
        newValues: { status, notes: notes || null },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-verification-documents"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
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
