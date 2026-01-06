import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { STORAGE_KEYS } from "@/lib/storage-keys";

/**
 * Simplified onboarding guard hook
 * Uses cached state for instant decisions, validates with DB in background
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

      // Check cache first for instant decision
      const storageKey = userType === "client" 
        ? STORAGE_KEYS.CLIENT_ONBOARDED 
        : STORAGE_KEYS.COACH_ONBOARDED;
      
      // Check cache - handle both string 'true' and legacy JSON formats
      const cachedValue = localStorage.getItem(storageKey);
      if (cachedValue === 'true' || (cachedValue && JSON.parse(cachedValue)?.isOnboarded)) {
        setIsOnboarded(true);
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
          console.error(`Error checking ${userType} onboarding:`, error);
          setIsChecking(false);
          return;
        }

        const completed = data?.onboarding_completed ?? false;
        setIsOnboarded(completed);

        if (completed) {
          localStorage.setItem(storageKey, 'true');
        } else {
          navigate(`/onboarding/${userType}`, { replace: true });
        }
      } catch (err) {
        console.error(`Error in onboarding guard:`, err);
      } finally {
        setIsChecking(false);
      }
    };

    checkOnboarding();
  }, [user?.id, userType, navigate]);

  return { isChecking, isOnboarded };
};
