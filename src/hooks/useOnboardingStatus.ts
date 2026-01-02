import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { isDespia } from "@/lib/despia";

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

// Default placeholder to prevent loading flash
const DEFAULT_ONBOARDING_STATUS: OnboardingStatus = {
  isOnboarded: false,
  onboardingProgress: null,
};

// PERFORMANCE FIX: Read from localStorage for instant hydration
const getClientOnboardingFromStorage = (): OnboardingStatus | undefined => {
  try {
    if (typeof localStorage === 'undefined') return undefined;
    const isOnboarded = localStorage.getItem('fitconnect_client_onboarded') === 'true';
    if (isOnboarded) {
      return { isOnboarded: true, onboardingProgress: null };
    }
  } catch {}
  return undefined;
};

export const useClientOnboardingStatus = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["client-onboarding-status", user?.id],
    queryFn: async (): Promise<OnboardingStatus> => {
      // FIX: Guard against race condition during native pull-to-refresh
      // Check localStorage for known-onboarded users before making DB call
      if (!user?.id) {
        const isKnown = localStorage.getItem('fitconnect_client_onboarded') === 'true';
        if (isKnown) {
          return { isOnboarded: true, onboardingProgress: null };
        }
        return { isOnboarded: false };
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

        // Cache the result for future visits
        if (data?.onboarding_completed) {
          localStorage.setItem('fitconnect_client_onboarded', 'true');
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: !isDespia(),
    // PERFORMANCE FIX: Changed from 'always' to false - trust localStorage for returning users
    refetchOnMount: false,
    // PERFORMANCE FIX: Use localStorage for instant hydration
    initialData: getClientOnboardingFromStorage,
    placeholderData: DEFAULT_ONBOARDING_STATUS,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
};

// PERFORMANCE FIX: Read from localStorage for instant hydration
const getCoachOnboardingFromStorage = (): OnboardingStatus | undefined => {
  try {
    if (typeof localStorage === 'undefined') return undefined;
    const isOnboarded = localStorage.getItem('fitconnect_coach_onboarded') === 'true';
    if (isOnboarded) {
      return { isOnboarded: true, onboardingProgress: null };
    }
  } catch {}
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

        // Cache the result for future visits
        if (data?.onboarding_completed) {
          localStorage.setItem('fitconnect_coach_onboarded', 'true');
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
    // PERFORMANCE FIX: Changed from 'always' to false - trust localStorage for returning users
    refetchOnMount: false,
    // PERFORMANCE FIX: Use localStorage for instant hydration
    initialData: getCoachOnboardingFromStorage,
    placeholderData: DEFAULT_ONBOARDING_STATUS,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
};
