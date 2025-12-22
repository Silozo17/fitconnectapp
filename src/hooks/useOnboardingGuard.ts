import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook to guard dashboard routes and redirect users with incomplete onboarding
 * back to their respective onboarding flow.
 */
export const useOnboardingGuard = (userType: "client" | "coach") => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user?.id) {
        setIsChecking(false);
        return;
      }

      try {
        const tableName = userType === "client" ? "client_profiles" : "coach_profiles";
        const { data, error } = await supabase
          .from(tableName)
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error(`Error checking ${userType} onboarding status:`, error);
          setIsChecking(false);
          return;
        }

        const completed = data?.onboarding_completed ?? false;
        setIsOnboarded(completed);

        if (!completed) {
          // Redirect to onboarding
          navigate(`/onboarding/${userType}`, { replace: true });
        }
      } catch (err) {
        console.error(`Error in onboarding guard for ${userType}:`, err);
      } finally {
        setIsChecking(false);
      }
    };

    checkOnboarding();
  }, [user?.id, userType, navigate]);

  return { isChecking, isOnboarded };
};
