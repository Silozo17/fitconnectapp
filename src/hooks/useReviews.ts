import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Review {
  id: string;
  client_id: string;
  coach_id: string;
  session_id: string | null;
  rating: number;
  review_text: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  client?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export interface CreateReviewData {
  coach_id: string;
  session_id?: string;
  rating: number;
  review_text?: string;
  is_public?: boolean;
}

// Fetch reviews for a coach (public)
export const useCoachReviews = (coachId: string | undefined) => {
  return useQuery({
    queryKey: ["coach-reviews", coachId],
    queryFn: async () => {
      if (!coachId) return [];
      
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          client:client_profiles!reviews_client_id_fkey (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq("coach_id", coachId)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as Review[];
    },
    enabled: !!coachId,
  });
};

// Fetch reviews by the current client
export const useClientReviews = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["client-reviews", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: profile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) return [];

      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("client_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
    enabled: !!user,
  });
};

// Check if client has already reviewed a session
export const useHasReviewed = (sessionId: string | undefined) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["has-reviewed", sessionId, user?.id],
    queryFn: async () => {
      if (!user || !sessionId) return false;

      const { data: profile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) return false;

      const { data, error } = await supabase
        .from("reviews")
        .select("id")
        .eq("client_id", profile.id)
        .eq("session_id", sessionId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!sessionId,
  });
};

// Create a new review
export const useCreateReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (reviewData: CreateReviewData) => {
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) throw new Error("Client profile not found");

      const { data, error } = await supabase
        .from("reviews")
        .insert({
          client_id: profile.id,
          coach_id: reviewData.coach_id,
          session_id: reviewData.session_id || null,
          rating: reviewData.rating,
          review_text: reviewData.review_text || null,
          is_public: reviewData.is_public ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["coach-reviews", variables.coach_id] });
      queryClient.invalidateQueries({ queryKey: ["client-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["has-reviewed"] });
    },
  });
};

// Calculate average rating
export const calculateAverageRating = (reviews: Review[]): number => {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
};
