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

    console.log("Starting weekly progress notification...");

    // Calculate the past week range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Get all active clients who have completed onboarding
    const { data: activeClients, error: clientError } = await supabase
      .from("client_profiles")
      .select("id, user_id, first_name")
      .eq("status", "active")
      .eq("onboarding_completed", true);

    if (clientError) {
      console.error("Error fetching active clients:", clientError);
      throw clientError;
    }

    console.log(`Processing ${activeClients?.length || 0} active clients`);

    const notifications: any[] = [];
    const pushData: { userId: string; title: string; subtitle: string; message: string }[] = [];

    for (const client of activeClients || []) {
      // Check notification preferences
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("push_progress")
        .eq("user_id", client.user_id)
        .single();

      if (prefs?.push_progress === false) continue;

      // Count habit completions this week
      const { count: habitCount } = await supabase
        .from("habit_logs")
        .select("*", { count: "exact", head: true })
        .eq("client_id", client.id)
        .gte("logged_at", startDate.toISOString().split("T")[0])
        .lte("logged_at", endDate.toISOString().split("T")[0]);

      // Count workout sessions this week
      const { count: sessionCount } = await supabase
        .from("coaching_sessions")
        .select("*", { count: "exact", head: true })
        .eq("client_id", client.id)
        .eq("status", "completed")
        .gte("scheduled_at", startDate.toISOString())
        .lte("scheduled_at", endDate.toISOString());

      // Count challenge progress updates
      const { count: challengeCount } = await supabase
        .from("challenge_participants")
        .select("*", { count: "exact", head: true })
        .eq("client_id", client.id)
        .eq("status", "active");

      const habitsCompleted = habitCount || 0;
      const sessionsCompleted = sessionCount || 0;
      const activeChallenges = challengeCount || 0;

      // Skip if no activity
      if (habitsCompleted === 0 && sessionsCompleted === 0) continue;

      // Build message based on activity
      let messageItems: string[] = [];
      if (sessionsCompleted > 0) {
        messageItems.push(`${sessionsCompleted} session${sessionsCompleted > 1 ? "s" : ""}`);
      }
      if (habitsCompleted > 0) {
        messageItems.push(`${habitsCompleted} habit${habitsCompleted > 1 ? "s" : ""} completed`);
      }
      if (activeChallenges > 0) {
        messageItems.push(`${activeChallenges} active challenge${activeChallenges > 1 ? "s" : ""}`);
      }

      const activitySummary = messageItems.join(", ");
      const encouragement = habitsCompleted >= 7 ? "Amazing consistency!" : "Keep up the great work!";

      notifications.push({
        user_id: client.user_id,
        type: "weekly_progress",
        title: "Your Week in Review",
        message: `${activitySummary}. ${encouragement}`,
        data: { 
          habits_completed: habitsCompleted,
          sessions_completed: sessionsCompleted,
          active_challenges: activeChallenges,
          week_start: startDate.toISOString(),
          week_end: endDate.toISOString(),
        },
      });

      pushData.push({
        userId: client.user_id,
        title: "Your Week in Review",
        subtitle: "Weekly Progress",
        message: `${activitySummary}. ${encouragement}`,
      });
    }

    // Insert in-app notifications in batches
    if (notifications.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);
        const { error: notifError } = await supabase
          .from("notifications")
          .insert(batch);

        if (notifError) {
          console.error("Error inserting notification batch:", notifError);
        }
      }
    }

    // Send push notifications
    if (pushData.length > 0) {
      const userIds = pushData.map(p => p.userId);
      
      const pushResponse = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds,
          title: "Your Week in Review",
          subtitle: "Weekly Progress",
          message: "Check out what you accomplished this week!",
          preferenceKey: "push_progress",
        }),
      });

      if (!pushResponse.ok) {
        console.error("Push notification failed:", await pushResponse.text());
      }
    }

    console.log(`Sent weekly progress to ${pushData.length} users`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notified: pushData.length,
        totalClients: activeClients?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in notify-weekly-progress:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
