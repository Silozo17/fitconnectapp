import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  PROFILE_COMPLETION_RULES, 
  calculateProfileCompletion,
  CompletionContext 
} from "@/lib/profileCompletionRules";

export interface ProfileStep {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  link: string;
  linkText: string;
}

export interface ProfileCompletionData {
  percentage: number;
  completedSteps: ProfileStep[];
  incompleteSteps: ProfileStep[];
  isFullyComplete: boolean;
  totalSteps: number;
  completedCount: number;
}

// Step metadata for UI navigation - maps rule IDs to links
const STEP_METADATA: Record<string, { link: string; linkText: string; description: string }> = {
  profile_photo: {
    link: "/dashboard/coach/settings?tab=marketplace",
    linkText: "Upload Photo",
    description: "Upload a professional profile photo",
  },
  bio: {
    link: "/dashboard/coach/settings?tab=marketplace",
    linkText: "Write Bio",
    description: "Write a compelling bio (50+ characters)",
  },
  specialisations: {
    link: "/dashboard/coach/settings?tab=marketplace",
    linkText: "Add Specialties",
    description: "Select your coaching specialties",
  },
  experience: {
    link: "/dashboard/coach/settings?tab=marketplace",
    linkText: "Add Experience",
    description: "Add your years of experience",
  },
  location: {
    link: "/dashboard/coach/settings?tab=marketplace",
    linkText: "Add Location",
    description: "Add your location",
  },
  availability: {
    link: "/dashboard/coach/settings?tab=marketplace",
    linkText: "Set Availability",
    description: "Set online or in-person availability",
  },
  who_i_work_with: {
    link: "/dashboard/coach/settings?tab=marketplace",
    linkText: "Add Description",
    description: "Describe your ideal clients (20+ characters)",
  },
  gallery: {
    link: "/dashboard/coach/settings?tab=marketplace",
    linkText: "Add Images",
    description: "Add at least one gallery image",
  },
  social_links: {
    link: "/dashboard/coach/settings?tab=marketplace",
    linkText: "Add Links",
    description: "Add at least one social media link",
  },
  stripe_connected: {
    link: "/dashboard/coach/settings?tab=payments",
    linkText: "Connect Stripe",
    description: "Connect your Stripe account to receive payments",
  },
};

/**
 * Hook for dashboard-style profile completion with step navigation
 * Uses centralized completion rules from profileCompletionRules.ts
 */
export const useCoachProfileCompletion = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile-completion", user?.id],
    queryFn: async (): Promise<ProfileCompletionData> => {
      if (!user?.id) throw new Error("Not authenticated");

      // Fetch coach profile
      const { data: profile, error: profileError } = await supabase
        .from("coach_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch gallery images count
      const { count: galleryCount } = await supabase
        .from("coach_gallery_images")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", profile.id);

      // Fetch group classes count (kept for interface compatibility, not used in completion)
      const { count: groupClassCount } = await supabase
        .from("coach_group_classes")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", profile.id);

      // Build completion context using centralized rules
      const ctx: CompletionContext = {
        profile: {
          bio: profile.bio,
          card_image_url: profile.card_image_url,
          coach_types: profile.coach_types,
          experience_years: profile.experience_years,
          location: profile.location,
          online_available: profile.online_available,
          in_person_available: profile.in_person_available,
          who_i_work_with: profile.who_i_work_with,
          instagram_url: profile.instagram_url,
          facebook_url: profile.facebook_url,
          youtube_url: profile.youtube_url,
          tiktok_url: profile.tiktok_url,
          x_url: profile.x_url,
          linkedin_url: profile.linkedin_url,
          threads_url: profile.threads_url,
          stripe_connect_id: profile.stripe_connect_id,
          stripe_connect_onboarded: profile.stripe_connect_onboarded,
        },
        galleryCount: galleryCount ?? 0,
        groupClassCount: groupClassCount ?? 0,
      };

      // Calculate completion using centralized rules
      const completion = calculateProfileCompletion(ctx);

      // Convert to step format for UI
      const allSteps: ProfileStep[] = completion.results.map((result) => {
        const metadata = STEP_METADATA[result.id] || {
          link: "/dashboard/coach/settings?tab=marketplace",
          linkText: "Complete",
          description: result.label,
        };
        
        return {
          id: result.id,
          name: result.label,
          description: metadata.description,
          completed: result.completed,
          link: metadata.link,
          linkText: metadata.linkText,
        };
      });

      const completedSteps = allSteps.filter((s) => s.completed);
      const incompleteSteps = allSteps.filter((s) => !s.completed);

      return {
        percentage: completion.percentage,
        completedSteps,
        incompleteSteps,
        isFullyComplete: completion.percentage === 100,
        totalSteps: completion.totalCount,
        completedCount: completion.completedCount,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 30,
  });
};
