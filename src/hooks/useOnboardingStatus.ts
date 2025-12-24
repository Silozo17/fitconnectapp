import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface OnboardingStatus {
  isOnboarded: boolean;
  subscriptionTier?: string | null;
  onboardingProgress?: {
    current_step?: number;
    form_data?: Record<string, unknown>;
    last_updated?: string;
  } | null;
  error?: boolean;
}

export const useClientOnboardingStatus = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["client-onboarding-status", user?.id],
    queryFn: async (): Promise<OnboardingStatus> => {
      if (!user?.id) return { isOnboarded: false };

      try {
        const { data, error } = await supabase
          .from("client_profiles")
          .select("onboarding_completed, onboarding_progress")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching client onboarding status:", error);
          // Return error state but don't throw - prevents infinite loading
          return { isOnboarded: false, error: true };
        }

        return {
          isOnboarded: data?.onboarding_completed ?? false,
          onboardingProgress: data?.onboarding_progress as OnboardingStatus['onboardingProgress'] ?? null,
        };
      } catch (err) {
        console.error("Exception fetching client onboarding status:", err);
        return { isOnboarded: false, error: true };
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes - prevents waterfall loading on dashboard
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: true,
    retry: 2, // Retry twice before giving up
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
};

export const useCoachOnboardingStatus = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coach-onboarding-status", user?.id],
    queryFn: async (): Promise<OnboardingStatus> => {
      if (!user?.id) return { isOnboarded: false };

      try {
        const { data, error } = await supabase
          .from("coach_profiles")
          .select("onboarding_completed, subscription_tier, onboarding_progress")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching coach onboarding status:", error);
          // Return error state but don't throw - prevents infinite loading
          return { isOnboarded: false, error: true };
        }

        return {
          isOnboarded: data?.onboarding_completed ?? false,
          subscriptionTier: data?.subscription_tier ?? null,
          onboardingProgress: data?.onboarding_progress as OnboardingStatus['onboardingProgress'] ?? null,
        };
      } catch (err) {
        console.error("Exception fetching coach onboarding status:", err);
        return { isOnboarded: false, error: true };
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2, // Retry twice before giving up
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
};
