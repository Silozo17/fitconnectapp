import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculateProfileCompletion, CompletionResult } from "@/lib/profileCompletionRules";

export interface ProfileCompletionData {
  percentage: number;
  results: CompletionResult[];
  completedCount: number;
  totalCount: number;
  incompleteItems: CompletionResult[];
  isComplete: boolean;
}

/**
 * Hook to fetch and calculate profile completion using centralized rules.
 * Fetches profile, gallery count, and group class count from the database.
 */
export function useProfileCompletion() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coach-profile-completion", user?.id],
    queryFn: async (): Promise<ProfileCompletionData> => {
      if (!user?.id) throw new Error("Not authenticated");

      // First get coach profile ID
      const { data: coachProfile, error: profileError } = await supabase
        .from("coach_profiles")
        .select(`
          id,
          bio,
          card_image_url,
          coach_types,
          experience_years,
          location,
          online_available,
          in_person_available,
          who_i_work_with,
          instagram_url,
          facebook_url,
          youtube_url,
          tiktok_url,
          x_url,
          linkedin_url,
          threads_url
        `)
        .eq("user_id", user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch gallery count
      const { count: galleryCount, error: galleryError } = await supabase
        .from("coach_gallery_images")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", coachProfile.id);

      if (galleryError) throw galleryError;

      // Fetch group class count
      const { count: groupClassCount, error: groupClassError } = await supabase
        .from("coach_group_classes")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", coachProfile.id);

      if (groupClassError) throw groupClassError;

      // Calculate completion using centralized rules
      const completion = calculateProfileCompletion({
        profile: coachProfile,
        galleryCount: galleryCount ?? 0,
        groupClassCount: groupClassCount ?? 0,
      });

      return {
        ...completion,
        isComplete: completion.percentage === 100,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 30, // 30 seconds for reactivity
  });
}
