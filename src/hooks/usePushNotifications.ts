import { useEffect, useCallback, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getDespiaRuntime, isDespia } from "@/lib/despia";

interface PushRegistrationResult {
  success: boolean;
  playerId?: string;
  error?: string;
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const initializationRef = useRef(false);

  /**
   * Register the device for push notifications via Despia/OneSignal
   */
  const registerForPush = useCallback(async (): Promise<PushRegistrationResult> => {
    console.log("[Push] registerForPush called");
    
    if (!user) {
      console.log("[Push] No user logged in, skipping registration");
      return { success: false, error: "No user logged in" };
    }

    if (!isDespia()) {
      console.log("[Push] Not in Despia environment, skipping registration");
      return { success: false, error: "Not in Despia environment" };
    }

    setIsRegistering(true);

    try {
      const runtime = getDespiaRuntime();
      if (!runtime) {
        throw new Error("Despia runtime not available");
      }

      // Get OneSignal player ID from Despia native runtime
      console.log("[Push] Getting OneSignal player ID...");
      const result = await runtime("getonesignalplayerid://", ["onesignalplayerid"]);
      console.log("[Push] Player ID result:", JSON.stringify(result));

      if (!result?.onesignalplayerid) {
        throw new Error("Failed to get OneSignal player ID - result was empty");
      }

      const playerId = result.onesignalplayerid;
      console.log("[Push] Got player ID:", playerId);

      // Determine device type with better detection
      const ua = navigator.userAgent.toLowerCase();
      const deviceType = ua.includes("android") ? "android" : "ios";
      const deviceName = ua.includes("ipad") ? "despia-ipad" : 
                         ua.includes("iphone") ? "despia-iphone" : "despia-device";

      console.log("[Push] Storing token - userId:", user.id, "playerId:", playerId, "device:", deviceName);

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
        console.error("[Push] Failed to store push token:", error);
        throw error;
      }

      console.log("[Push] Token stored successfully in database");
      setIsRegistered(true);
      return { success: true, playerId };
    } catch (error: any) {
      console.error("[Push] Registration failed:", error);
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
      console.log("[Push] Unregistering push for user:", user.id);
      await supabase
        .from("push_tokens")
        .update({ is_active: false })
        .eq("user_id", user.id);

      setIsRegistered(false);
      console.log("[Push] Unregistered successfully");
    } catch (error) {
      console.error("[Push] Failed to unregister push:", error);
    }
  }, [user]);

  /**
   * Check if user has an active push registration
   */
  const checkRegistrationStatus = useCallback(async () => {
    if (!user || !isDespia()) return false;

    try {
      const { data } = await supabase
        .from("push_tokens")
        .select("id, player_id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1);

      const hasToken = !!(data && data.length > 0);
      setIsRegistered(hasToken);
      return hasToken;
    } catch (error) {
      console.error("[Push] Failed to check push registration:", error);
      return false;
    }
  }, [user]);

  /**
   * Set the OneSignal external user ID
   * This links the user's database ID to their device in OneSignal
   */
  const setExternalUserId = useCallback(async () => {
    if (!user || !isDespia()) return;

    try {
      console.log("[Push] Setting OneSignal external user ID:", user.id);
      await despia(`setonesignalplayerid://?user_id=${user.id}`);
      console.log("[Push] External user ID set successfully");
    } catch (error) {
      console.error("[Push] Failed to set external user ID:", error);
    }
  }, [user]);

  // Single initialization effect - combines external ID setting and registration
  // PERFORMANCE FIX: Defer push notification initialization in Despia native
  // to avoid blocking critical app startup path
  useEffect(() => {
    const initializePush = async () => {
      // Skip if not in Despia or no user
      if (!user || !isDespia()) {
        return;
      }

      // Prevent double initialization
      if (initializationRef.current) {
        return;
      }
      initializationRef.current = true;

      console.log("[Push] Initializing push notifications for user:", user.id);

      // Step 1: Always set external user ID first (links user to device in OneSignal)
      try {
        await despia(`setonesignalplayerid://?user_id=${user.id}`);
        console.log("[Push] External user ID set successfully");
      } catch (error) {
        console.error("[Push] Failed to set external user ID:", error);
        // Continue anyway - registration can still work
      }

      // Step 2: Check existing registration directly from database
      const { data: existingTokens } = await supabase
        .from("push_tokens")
        .select("id, player_id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1);

      const hasActiveToken = !!(existingTokens && existingTokens.length > 0);
      setIsRegistered(hasActiveToken);

      // Step 3: Register device if not already registered
      if (!hasActiveToken) {
        const result = await registerForPush();
        console.log("[Push] Registration result:", result);
      }
    };

    // PERFORMANCE FIX: Delay push notification init by 2 seconds in Despia
    // This allows critical UI to render first
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (user && isDespia()) {
      timeoutId = setTimeout(initializePush, 2000);
    }

    // Reset initialization flag when user changes (logout/login)
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      initializationRef.current = false;
    };
  }, [user, registerForPush]);

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
