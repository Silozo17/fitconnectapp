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
      console.log("OneSignal not configured, skipping push notification");
      return new Response(
        JSON.stringify({ skipped: true, reason: "OneSignal not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { userIds, title, message, data, preferenceKey }: PushNotificationRequest = await req.json();

    console.log(`Sending push notification to ${userIds.length} users: "${title}"`);

    // Filter users based on their notification preferences
    let eligibleUserIds = userIds;
    if (preferenceKey) {
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select(`user_id, ${preferenceKey}`)
        .in("user_id", userIds);

      if (prefs) {
        const disabledUsers = new Set(
          prefs.filter((p: any) => p[preferenceKey] === false).map((p: any) => p.user_id)
        );
        eligibleUserIds = userIds.filter((id) => !disabledUsers.has(id));
      }
    }

    if (eligibleUserIds.length === 0) {
      console.log("No eligible users after preference check");
      return new Response(
        JSON.stringify({ skipped: true, reason: "No eligible users" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get active push tokens for eligible users
    const { data: tokens, error: tokensError } = await supabase
      .from("push_tokens")
      .select("player_id")
      .in("user_id", eligibleUserIds)
      .eq("is_active", true);

    if (tokensError) {
      console.error("Error fetching push tokens:", tokensError);
      throw tokensError;
    }

    if (!tokens || tokens.length === 0) {
      console.log("No active push tokens found");
      return new Response(
        JSON.stringify({ skipped: true, reason: "No active push tokens" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const playerIds = tokens.map((t) => t.player_id);
    console.log(`Sending to ${playerIds.length} devices`);

    // Send push notification via OneSignal
    const oneSignalResponse = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${oneSignalApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_id: oneSignalAppId,
        include_player_ids: playerIds,
        headings: { en: title },
        contents: { en: message },
        data: data || {},
      }),
    });

    if (!oneSignalResponse.ok) {
      const errorText = await oneSignalResponse.text();
      console.error("OneSignal error:", errorText);
      throw new Error(`OneSignal API error: ${errorText}`);
    }

    const responseData = await oneSignalResponse.json();
    console.log("OneSignal response:", responseData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        recipients: playerIds.length,
        oneSignalId: responseData.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending push notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
