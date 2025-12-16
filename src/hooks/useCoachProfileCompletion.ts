import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

export const useCoachProfileCompletion = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coach-profile-completion", user?.id],
    queryFn: async (): Promise<ProfileCompletionData> => {
      if (!user?.id) throw new Error("Not authenticated");

      // Fetch coach profile
      const { data: profile, error: profileError } = await supabase
        .from("coach_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch session types count
      const { count: sessionTypesCount } = await supabase
        .from("session_types")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", profile.id);

      // Fetch availability count
      const { count: availabilityCount } = await supabase
        .from("coach_availability")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", profile.id)
        .eq("is_active", true);

      // Fetch verification documents count
      const { count: documentsCount } = await supabase
        .from("coach_verification_documents")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", profile.id);

      // Define all steps
      const steps: ProfileStep[] = [
        {
          id: "profile_photo",
          name: "Profile Photo",
          description: "Upload a professional profile photo",
          completed: !!profile.profile_image_url,
          link: "/dashboard/coach/settings",
          linkText: "Upload Photo",
        },
        {
          id: "display_name",
          name: "Display Name",
          description: "Add your display name",
          completed: !!profile.display_name && profile.display_name.length > 0,
          link: "/dashboard/coach/settings",
          linkText: "Add Name",
        },
        {
          id: "bio",
          name: "Bio",
          description: "Write a compelling bio (50+ characters)",
          completed: !!profile.bio && profile.bio.length >= 50,
          link: "/dashboard/coach/settings",
          linkText: "Write Bio",
        },
        {
          id: "specialties",
          name: "Specialties",
          description: "Select your coaching specialties",
          completed: !!profile.coach_types && profile.coach_types.length > 0,
          link: "/dashboard/coach/settings",
          linkText: "Add Specialties",
        },
        {
          id: "hourly_rate",
          name: "Hourly Rate",
          description: "Set your hourly rate",
          completed: !!profile.hourly_rate && profile.hourly_rate > 0,
          link: "/dashboard/coach/settings",
          linkText: "Set Rate",
        },
        {
          id: "location",
          name: "Location",
          description: "Add your location",
          completed: !!profile.location && profile.location.length > 0,
          link: "/dashboard/coach/settings",
          linkText: "Add Location",
        },
        {
          id: "session_types",
          name: "Session Types",
          description: "Create at least one session type",
          completed: (sessionTypesCount || 0) > 0,
          link: "/dashboard/coach/packages",
          linkText: "Create Session",
        },
        {
          id: "availability",
          name: "Availability",
          description: "Set your available hours",
          completed: (availabilityCount || 0) > 0,
          link: "/dashboard/coach/schedule",
          linkText: "Set Hours",
        },
        {
          id: "stripe_connect",
          name: "Payment Setup",
          description: "Connect Stripe to receive payments",
          completed: !!profile.stripe_connect_onboarded,
          link: "/dashboard/coach/settings",
          linkText: "Connect Stripe",
        },
        {
          id: "verification",
          name: "Verification",
          description: "Upload verification documents",
          completed: (documentsCount || 0) > 0,
          link: "/dashboard/coach/verification",
          linkText: "Upload Docs",
        },
      ];

      const completedSteps = steps.filter((s) => s.completed);
      const incompleteSteps = steps.filter((s) => !s.completed);
      const percentage = Math.round((completedSteps.length / steps.length) * 100);

      return {
        percentage,
        completedSteps,
        incompleteSteps,
        isFullyComplete: completedSteps.length === steps.length,
        totalSteps: steps.length,
        completedCount: completedSteps.length,
      };
    },
    enabled: !!user?.id,
  });
};
