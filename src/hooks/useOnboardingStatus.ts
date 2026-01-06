import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { isDespia } from "@/lib/despia";
import { STORAGE_KEYS, getStorage, setStorage } from "@/lib/storage-keys";

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

const DEFAULT_ONBOARDING_STATUS: OnboardingStatus = {
  isOnboarded: false,
  onboardingProgress: null,
};

const getClientOnboardingFromStorage = (): OnboardingStatus | undefined => {
  const data = getStorage<{ isOnboarded: boolean }>(STORAGE_KEYS.CLIENT_ONBOARDED);
  if (data?.isOnboarded) {
    return { isOnboarded: true, onboardingProgress: null };
  }
  return undefined;
};

export const useClientOnboardingStatus = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["client-onboarding-status", user?.id],
    queryFn: async (): Promise<OnboardingStatus> => {
      if (!user?.id) {
        const cached = getClientOnboardingFromStorage();
        return cached ?? { isOnboarded: false };
      }

      try {
        const { data, error } = await supabase
          .from("client_profiles")
          .select("onboarding_completed, onboarding_progress")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching client onboarding status:", error);
          return { isOnboarded: false, error: true };
        }

        // Cache the result
        if (data?.onboarding_completed) {
          setStorage(STORAGE_KEYS.CLIENT_ONBOARDED, { isOnboarded: true });
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
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: !isDespia(),
    refetchOnMount: false,
    initialData: getClientOnboardingFromStorage,
    placeholderData: DEFAULT_ONBOARDING_STATUS,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
};

const getCoachOnboardingFromStorage = (): OnboardingStatus | undefined => {
  const data = getStorage<{ isOnboarded: boolean }>(STORAGE_KEYS.COACH_ONBOARDED);
  if (data?.isOnboarded) {
    return { isOnboarded: true, onboardingProgress: null };
  }
  return undefined;
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
          return { isOnboarded: false, error: true };
        }

        // Cache the result
        if (data?.onboarding_completed) {
          setStorage(STORAGE_KEYS.COACH_ONBOARDED, { isOnboarded: true });
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
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: !isDespia(),
    refetchOnMount: false,
    initialData: getCoachOnboardingFromStorage,
    placeholderData: DEFAULT_ONBOARDING_STATUS,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
};
