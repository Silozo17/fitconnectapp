import { useEffect, useCallback, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { isDespia } from "@/lib/despia";
import despia from "despia-native";

interface PushRegistrationResult {
  success: boolean;
  playerId?: string;
  error?: string;
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const hasSetExternalUserId = useRef(false);

  /**
   * Set the OneSignal external user ID on app load
   * This connects the logged-in user ID with OneSignal for targeted notifications
   */
  const setExternalUserId = useCallback(async () => {
    if (!user || !isDespia() || hasSetExternalUserId.current) {
      return;
    }

    try {
      console.log("[Push] Setting OneSignal external user ID:", user.id);
      await despia(`setonesignalplayerid://?user_id=${user.id}`);
      hasSetExternalUserId.current = true;
      console.log("[Push] OneSignal external user ID set successfully");
    } catch (error) {
      console.error("[Push] Failed to set OneSignal external user ID:", error);
    }
  }, [user]);

  /**
   * Register the device for push notifications via Despia/OneSignal
   */
  const registerForPush = useCallback(async (): Promise<PushRegistrationResult> => {
    if (!user) {
      return { success: false, error: "No user logged in" };
    }

    if (!isDespia()) {
      return { success: false, error: "Not in Despia environment" };
    }

    setIsRegistering(true);

    try {
      // Get OneSignal player ID from Despia native runtime
      const result = await despia("getonesignalplayerid://", ["onesignalplayerid"]);
      
      if (!result || !result.onesignalplayerid) {
        throw new Error("Failed to get OneSignal player ID");
      }

      const playerId = result.onesignalplayerid;

      // Get device info
      const deviceType = /android/i.test(navigator.userAgent) ? "android" : "ios";
      const deviceName = navigator.userAgent.substring(0, 100);

      // Store push token in database
      const { error } = await supabase
        .from("push_tokens")
        .upsert(
          {
            user_id: user.id,
            player_id: playerId,
            device_type: deviceType,
            device_name: deviceName,
            is_active: true,
          },
          {
            onConflict: "user_id,player_id",
          }
        );

      if (error) {
        console.error("Failed to store push token:", error);
        throw error;
      }

      setIsRegistered(true);
      return { success: true, playerId };
    } catch (error: any) {
      console.error("Push registration failed:", error);
      return { success: false, error: error.message };
    } finally {
      setIsRegistering(false);
    }
  }, [user]);

  /**
   * Unregister push notifications by deactivating the token
   */
  const unregisterPush = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from("push_tokens")
        .update({ is_active: false })
        .eq("user_id", user.id);

      setIsRegistered(false);
      hasSetExternalUserId.current = false;
    } catch (error) {
      console.error("Failed to unregister push:", error);
    }
  }, [user]);

  /**
   * Check if user has an active push registration
   */
  const checkRegistrationStatus = useCallback(async () => {
    if (!user || !isDespia()) return;

    try {
      const { data } = await supabase
        .from("push_tokens")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1);

      setIsRegistered(!!(data && data.length > 0));
    } catch (error) {
      console.error("Failed to check push registration:", error);
    }
  }, [user]);

  // Set external user ID on every app load when user is logged in
  useEffect(() => {
    if (user && isDespia()) {
      setExternalUserId();
    }
  }, [user, setExternalUserId]);

  // Reset the flag when user logs out
  useEffect(() => {
    if (!user) {
      hasSetExternalUserId.current = false;
    }
  }, [user]);

  // Auto-register on login when in Despia environment
  useEffect(() => {
    if (user && isDespia()) {
      checkRegistrationStatus().then(() => {
        // Register if not already registered
        if (!isRegistered) {
          registerForPush();
        }
      });
    }
  }, [user, checkRegistrationStatus, registerForPush, isRegistered]);

  return {
    isDespia: isDespia(),
    isRegistered,
    isRegistering,
    registerForPush,
    unregisterPush,
    checkRegistrationStatus,
    setExternalUserId,
  };
};
