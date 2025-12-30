import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting onboarding incomplete notification check...");

    // Get clients who signed up > 24 hours ago but haven't completed onboarding
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    // Fetch incomplete client profiles (between 24-48 hours old to avoid spamming)
    const { data: incompleteClients, error: clientError } = await supabase
      .from("client_profiles")
      .select("id, user_id, first_name, created_at")
      .eq("onboarding_completed", false)
      .lt("created_at", twentyFourHoursAgo)
      .gt("created_at", fortyEightHoursAgo)
      .eq("status", "active");

    if (clientError) {
      console.error("Error fetching incomplete clients:", clientError);
      throw clientError;
    }

    // Fetch incomplete coach profiles
    const { data: incompleteCoaches, error: coachError } = await supabase
      .from("coach_profiles")
      .select("id, user_id, display_name, created_at")
      .eq("onboarding_completed", false)
      .lt("created_at", twentyFourHoursAgo)
      .gt("created_at", fortyEightHoursAgo)
      .is("status", null);

    if (coachError) {
      console.error("Error fetching incomplete coaches:", coachError);
      throw coachError;
    }

    const userIds: string[] = [];
    const notifications: any[] = [];

    // Process clients
    for (const client of incompleteClients || []) {
      // Check notification preferences
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("push_onboarding")
        .eq("user_id", client.user_id)
        .single();

      if (prefs?.push_onboarding === false) continue;

      userIds.push(client.user_id);
      notifications.push({
        user_id: client.user_id,
        type: "onboarding_reminder",
        title: "Complete Your Profile",
        message: "Just a few steps left to unlock all features",
        data: { profile_type: "client" },
      });
    }

    // Process coaches
    for (const coach of incompleteCoaches || []) {
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("push_onboarding")
        .eq("user_id", coach.user_id)
        .single();

      if (prefs?.push_onboarding === false) continue;

      userIds.push(coach.user_id);
      notifications.push({
        user_id: coach.user_id,
        type: "onboarding_reminder",
        title: "Complete Your Profile",
        message: "Finish setting up to start connecting with clients",
        data: { profile_type: "coach" },
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
      const pushResponse = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds,
          title: "Complete Your Profile",
          subtitle: "Just a few steps left",
          message: "Finish setting up to unlock all features",
          preferenceKey: "push_onboarding",
        }),
      });

      if (!pushResponse.ok) {
        console.error("Push notification failed:", await pushResponse.text());
      }
    }

    console.log(`Sent onboarding reminders to ${userIds.length} users`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notified: userIds.length,
        clients: incompleteClients?.length || 0,
        coaches: incompleteCoaches?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in notify-onboarding-incomplete:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
