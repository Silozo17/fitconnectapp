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
}

export const useClientOnboardingStatus = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["client-onboarding-status", user?.id],
    queryFn: async (): Promise<OnboardingStatus> => {
      if (!user?.id) return { isOnboarded: false };

      const { data } = await supabase
        .from("client_profiles")
        .select("onboarding_completed, onboarding_progress")
        .eq("user_id", user.id)
        .maybeSingle();

      return {
        isOnboarded: data?.onboarding_completed ?? false,
        onboardingProgress: data?.onboarding_progress as OnboardingStatus['onboardingProgress'] ?? null,
      };
    },
    enabled: !!user?.id,
    staleTime: 30 * 60 * 1000, // 30 minutes - onboarding status rarely changes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useCoachOnboardingStatus = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coach-onboarding-status", user?.id],
    queryFn: async (): Promise<OnboardingStatus> => {
      if (!user?.id) return { isOnboarded: false };

      const { data } = await supabase
        .from("coach_profiles")
        .select("onboarding_completed, subscription_tier, onboarding_progress")
        .eq("user_id", user.id)
        .maybeSingle();

      return {
        isOnboarded: data?.onboarding_completed ?? false,
        subscriptionTier: data?.subscription_tier ?? null,
        onboardingProgress: data?.onboarding_progress as OnboardingStatus['onboardingProgress'] ?? null,
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes - subscription tier can change more frequently
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};
