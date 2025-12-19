import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface OnboardingStatus {
  isOnboarded: boolean;
  subscriptionTier?: string | null;
}

export const useClientOnboardingStatus = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["client-onboarding-status", user?.id],
    queryFn: async (): Promise<OnboardingStatus> => {
      if (!user?.id) return { isOnboarded: false };

      const { data } = await supabase
        .from("client_profiles")
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      return {
        isOnboarded: data?.onboarding_completed ?? false,
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
        .select("onboarding_completed, subscription_tier")
        .eq("user_id", user.id)
        .maybeSingle();

      return {
        isOnboarded: data?.onboarding_completed ?? false,
        subscriptionTier: data?.subscription_tier ?? null,
      };
    },
    enabled: !!user?.id,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};
