import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationRequest {
  userIds: string[];
  title: string;
  message: string;
  data?: Record<string, unknown>;
  preferenceKey?: string; // e.g., 'push_messages', 'push_bookings', etc.
  useExternalUserIds?: boolean; // If true, use include_external_user_ids instead of player_ids
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const oneSignalAppId = Deno.env.get("ONESIGNAL_APP_ID");
    const oneSignalApiKey = Deno.env.get("ONESIGNAL_API_KEY");

    if (!oneSignalAppId || !oneSignalApiKey) {
      console.log("[send-push] OneSignal not configured, skipping push notification");
      return new Response(
        JSON.stringify({ skipped: true, reason: "OneSignal not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { 
      userIds, 
      title, 
      message, 
      data, 
      preferenceKey,
      useExternalUserIds = true // Default to using external user IDs (set via setonesignalplayerid)
    }: PushNotificationRequest = await req.json();

    console.log(`[send-push] ===== PUSH NOTIFICATION REQUEST =====`);
    console.log(`[send-push] Title: "${title}"`);
    console.log(`[send-push] Message: "${message}"`);
    console.log(`[send-push] Target user IDs: ${JSON.stringify(userIds)}`);
    console.log(`[send-push] Preference key: ${preferenceKey || "none"}`);
    console.log(`[send-push] Method: ${useExternalUserIds ? "external_user_ids" : "player_ids"}`);

    // Filter users based on their notification preferences
    let eligibleUserIds = userIds;
    if (preferenceKey) {
      console.log(`[send-push] Checking notification preferences for key: ${preferenceKey}`);
      const { data: prefs, error: prefsError } = await supabase
        .from("notification_preferences")
        .select(`user_id, ${preferenceKey}`)
        .in("user_id", userIds);

      if (prefsError) {
        console.error(`[send-push] Error fetching preferences:`, prefsError);
      }

      console.log(`[send-push] Preferences data:`, JSON.stringify(prefs));

      if (prefs) {
        const disabledUsers = new Set(
          prefs.filter((p: any) => p[preferenceKey] === false).map((p: any) => p.user_id)
        );
        console.log(`[send-push] Users with disabled ${preferenceKey}:`, Array.from(disabledUsers));
        eligibleUserIds = userIds.filter((id) => !disabledUsers.has(id));
      }
    }

    if (eligibleUserIds.length === 0) {
      console.log("[send-push] No eligible users after preference check");
      return new Response(
        JSON.stringify({ skipped: true, reason: "No eligible users" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[send-push] Eligible user IDs: ${JSON.stringify(eligibleUserIds)}`);

    // Also check if users have push tokens registered (for debugging)
    const { data: debugTokens } = await supabase
      .from("push_tokens")
      .select("user_id, player_id, device_type, is_active")
      .in("user_id", eligibleUserIds);
    console.log(`[send-push] Push tokens in database for eligible users:`, JSON.stringify(debugTokens));

    // Build OneSignal request body
    let oneSignalBody: Record<string, unknown> = {
      app_id: oneSignalAppId,
      headings: { en: title },
      contents: { en: message },
      data: data || {},
    };

    if (useExternalUserIds) {
      // Use external user IDs (set via setonesignalplayerid on app load)
      // This is the preferred method as it directly targets users by their database ID
      oneSignalBody.include_external_user_ids = eligibleUserIds;
      console.log(`[send-push] OneSignal body with external_user_ids:`, JSON.stringify(oneSignalBody));
    } else {
      // Fallback: Get active push tokens for eligible users and use player_ids
      const { data: tokens, error: tokensError } = await supabase
        .from("push_tokens")
        .select("player_id")
        .in("user_id", eligibleUserIds)
        .eq("is_active", true);

      if (tokensError) {
        console.error("[send-push] Error fetching push tokens:", tokensError);
        throw tokensError;
      }

      if (!tokens || tokens.length === 0) {
        console.log("[send-push] No active push tokens found");
        return new Response(
          JSON.stringify({ skipped: true, reason: "No active push tokens" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const playerIds = tokens.map((t) => t.player_id);
      oneSignalBody.include_player_ids = playerIds;
      console.log(`[send-push] Targeting ${playerIds.length} player IDs`);
    }

    // Send push notification via OneSignal
    const oneSignalResponse = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${oneSignalApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(oneSignalBody),
    });

    if (!oneSignalResponse.ok) {
      const errorText = await oneSignalResponse.text();
      console.error("[send-push] OneSignal error:", errorText);
      throw new Error(`OneSignal API error: ${errorText}`);
    }

    const responseData = await oneSignalResponse.json();
    console.log("[send-push] OneSignal response:", responseData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        recipients: eligibleUserIds.length,
        oneSignalId: responseData.id,
        method: useExternalUserIds ? "external_user_ids" : "player_ids"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[send-push] Error sending push notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
