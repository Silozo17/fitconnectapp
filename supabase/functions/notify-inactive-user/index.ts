import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InactiveUserRequest {
  days?: number; // 3 or 7, defaults to 3
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: InactiveUserRequest = await req.json().catch(() => ({}));
    const days = body.days || 3;

    console.log(`Starting ${days}-day inactive user notification check...`);

    // Calculate date range (users inactive for exactly N days, not more)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - days);
    const targetDateStart = new Date(targetDate);
    targetDateStart.setHours(0, 0, 0, 0);
    const targetDateEnd = new Date(targetDate);
    targetDateEnd.setHours(23, 59, 59, 999);

    // Find clients whose last activity was N days ago
    // We check updated_at on client_profiles as a proxy for activity
    const { data: inactiveClients, error: clientError } = await supabase
      .from("client_profiles")
      .select("id, user_id, first_name, updated_at")
      .eq("status", "active")
      .eq("onboarding_completed", true)
      .lt("updated_at", targetDateEnd.toISOString())
      .gt("updated_at", targetDateStart.toISOString());

    if (clientError) {
      console.error("Error fetching inactive clients:", clientError);
      throw clientError;
    }

    console.log(`Found ${inactiveClients?.length || 0} clients inactive for ${days} days`);

    const userIds: string[] = [];
    const notifications: any[] = [];

    for (const client of inactiveClients || []) {
      // Check notification preferences
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("push_reengagement")
        .eq("user_id", client.user_id)
        .single();

      if (prefs?.push_reengagement === false) continue;

      // Check if we already sent a re-engagement notification recently
      const { data: recentNotif } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", client.user_id)
        .eq("type", `inactive_${days}d`)
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (recentNotif && recentNotif.length > 0) continue;

      userIds.push(client.user_id);

      const title = days === 3 ? "We Miss You" : "Your Journey Awaits";
      const subtitle = days === 3 ? "Get Back on Track" : "Time to Return";
      const message = days === 3 
        ? "Your fitness goals are waiting. Log in to continue your journey"
        : "Don't let your progress slip away. Your coach is ready when you are";

      notifications.push({
        user_id: client.user_id,
        type: `inactive_${days}d`,
        title,
        message,
        data: { days_inactive: days },
      });
    }

    // Insert in-app notifications
    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (notifError) {
        console.error("Error inserting notifications:", notifError);
      }
    }

    // Send push notifications
    if (userIds.length > 0) {
      const title = days === 3 ? "We Miss You" : "Your Journey Awaits";
      const subtitle = days === 3 ? "Get Back on Track" : "Time to Return";
      const message = days === 3 
        ? "Your fitness goals are waiting. Log in to continue your journey"
        : "Don't let your progress slip away. Your coach is ready when you are";

      const pushResponse = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds,
          title,
          subtitle,
          message,
          preferenceKey: "push_reengagement",
          data: { days_inactive: days },
        }),
      });

      if (!pushResponse.ok) {
        console.error("Push notification failed:", await pushResponse.text());
      }
    }

    console.log(`Sent ${days}-day inactive notifications to ${userIds.length} users`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notified: userIds.length,
        days,
        totalInactive: inactiveClients?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in notify-inactive-user:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
