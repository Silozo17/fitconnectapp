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

    console.log("Starting streak at risk notification check...");

    const today = new Date().toISOString().split("T")[0];

    // Find users with active streaks (>= 3 days) who haven't logged a habit today
    const { data: atRiskStreaks, error: streakError } = await supabase
      .from("habit_streaks")
      .select(`
        habit_id,
        current_streak,
        last_completed_date,
        client_habits!inner (
          id,
          name,
          client_id,
          is_active
        )
      `)
      .gte("current_streak", 3)
      .neq("last_completed_date", today)
      .eq("client_habits.is_active", true);

    if (streakError) {
      console.error("Error fetching at-risk streaks:", streakError);
      throw streakError;
    }

    console.log(`Found ${atRiskStreaks?.length || 0} streaks at risk`);

    const notifiedUsers = new Set<string>();
    const notifications: any[] = [];

    for (const streak of atRiskStreaks || []) {
      const habit = (streak as any).client_habits;
      if (!habit) continue;

      // Get client user_id
      const { data: client } = await supabase
        .from("client_profiles")
        .select("user_id, first_name")
        .eq("id", habit.client_id)
        .single();

      if (!client) continue;

      // Check if already notified this user today
      if (notifiedUsers.has(client.user_id)) continue;

      // Check notification preferences
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("push_progress")
        .eq("user_id", client.user_id)
        .single();

      if (prefs?.push_progress === false) continue;

      notifiedUsers.add(client.user_id);

      // Create in-app notification
      notifications.push({
        user_id: client.user_id,
        type: "streak_at_risk",
        title: "Streak at Risk",
        message: `Don't break your ${streak.current_streak} day streak! Complete your habit today`,
        data: { 
          habit_id: habit.id, 
          habit_name: habit.name,
          current_streak: streak.current_streak,
        },
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

    // Send push notifications to each user with their specific streak info
    for (const notification of notifications) {
      const pushResponse = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: [notification.user_id],
          title: "Streak at Risk",
          subtitle: `${notification.data.current_streak} Day Streak`,
          message: "Don't break your streak! Complete your habit today",
          preferenceKey: "push_progress",
          data: notification.data,
        }),
      });

      if (!pushResponse.ok) {
        console.error("Push notification failed:", await pushResponse.text());
      }
    }

    console.log(`Sent streak at risk notifications to ${notifiedUsers.size} users`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notified: notifiedUsers.size,
        streaksAtRisk: atRiskStreaks?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in notify-streak-at-risk:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
