import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface FeedbackSubmission {
  category: "bug" | "feature" | "improvement" | "general";
  subject: string;
  message: string;
}

interface Feedback {
  id: string;
  user_id: string;
  user_type: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface FeedbackWithUser extends Feedback {
  user_email?: string;
  user_name?: string;
}

export const useSubmitFeedback = () => {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FeedbackSubmission) => {
      if (!user) throw new Error("Not authenticated");

      const userType = role === "admin" || role === "manager" || role === "staff" 
        ? "admin" 
        : role || "client";

      const { error } = await supabase.from("feedback").insert({
        user_id: user.id,
        user_type: userType,
        category: data.category,
        subject: data.subject,
        message: data.message,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      queryClient.invalidateQueries({ queryKey: ["pending-feedback-count"] });
    },
  });
};

export const useFeedbackList = (filters?: {
  status?: string;
  category?: string;
  userType?: string;
}) => {
  return useQuery({
    queryKey: ["feedback", filters],
    queryFn: async (): Promise<FeedbackWithUser[]> => {
      let query = supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters?.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }
      if (filters?.userType && filters.userType !== "all") {
        query = query.eq("user_type", filters.userType);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch user details for each feedback
      const feedbackWithUsers = await Promise.all(
        (data || []).map(async (feedback) => {
          // Try to get user name from appropriate profile table
          let userName = "Unknown User";
          let userEmail = "";

          if (feedback.user_type === "client") {
            const { data: clientProfile } = await supabase
              .from("client_profiles")
              .select("first_name, last_name")
              .eq("user_id", feedback.user_id)
              .single();
            if (clientProfile) {
              userName = [clientProfile.first_name, clientProfile.last_name]
                .filter(Boolean)
                .join(" ") || "Client";
            }
          } else if (feedback.user_type === "coach") {
            const { data: coachProfile } = await supabase
              .from("coach_profiles")
              .select("display_name")
              .eq("user_id", feedback.user_id)
              .single();
            if (coachProfile) {
              userName = coachProfile.display_name || "Coach";
            }
          } else if (feedback.user_type === "admin") {
            const { data: adminProfile } = await supabase
              .from("admin_profiles")
              .select("first_name, last_name, display_name")
              .eq("user_id", feedback.user_id)
              .single();
            if (adminProfile) {
              userName = adminProfile.display_name || 
                [adminProfile.first_name, adminProfile.last_name].filter(Boolean).join(" ") || 
                "Admin";
            }
          }

          return {
            ...feedback,
            user_name: userName,
            user_email: userEmail,
          };
        })
      );

      return feedbackWithUsers;
    },
  });
};

export const useUpdateFeedbackStatus = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      feedbackId,
      status,
      adminNotes,
    }: {
      feedbackId: string;
      status: string;
      adminNotes?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("feedback")
        .update({
          status,
          admin_notes: adminNotes,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", feedbackId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      queryClient.invalidateQueries({ queryKey: ["pending-feedback-count"] });
    },
  });
};

export const usePendingFeedbackCount = () => {
  return useQuery({
    queryKey: ["pending-feedback-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("feedback")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      if (error) throw error;
      return count || 0;
    },
  });
};
