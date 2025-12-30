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

    const { assignment_id, client_id, coach_id, plan_id, plan_type } = await req.json();

    console.log("Processing plan assignment notification:", { assignment_id, client_id, plan_type });

    if (!client_id || !coach_id) {
      return new Response(
        JSON.stringify({ error: "client_id and coach_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from("client_profiles")
      .select("user_id, first_name")
      .eq("id", client_id)
      .single();

    if (clientError || !client) {
      console.error("Error fetching client:", clientError);
      throw new Error("Client not found");
    }

    // Get coach details
    const { data: coach, error: coachError } = await supabase
      .from("coach_profiles")
      .select("display_name")
      .eq("id", coach_id)
      .single();

    if (coachError || !coach) {
      console.error("Error fetching coach:", coachError);
      throw new Error("Coach not found");
    }

    // Get plan name if plan_id provided
    let planName = plan_type === "meal" ? "meal plan" : "training plan";
    if (plan_id) {
      const tableName = plan_type === "meal" ? "meal_plans" : "training_plans";
      const { data: plan } = await supabase
        .from(tableName)
        .select("name")
        .eq("id", plan_id)
        .single();
      
      if (plan?.name) {
        planName = plan.name;
      }
    }

    const coachName = coach.display_name || "Your coach";
    const planTypeLabel = plan_type === "meal" ? "meal" : "training";

    // Check notification preferences
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("push_bookings")
      .eq("user_id", client.user_id)
      .single();

    // Create in-app notification
    const { error: notifError } = await supabase
      .from("notifications")
      .insert({
        user_id: client.user_id,
        type: "plan_assigned",
        title: "New Plan Available",
        message: `${coachName} has assigned you a new ${planTypeLabel} plan`,
        data: { 
          assignment_id,
          plan_id, 
          plan_type,
          plan_name: planName,
          coach_id,
        },
      });

    if (notifError) {
      console.error("Error inserting notification:", notifError);
    }

    // Send push notification if preferences allow
    if (prefs?.push_bookings !== false) {
      const pushResponse = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: [client.user_id],
          title: "New Plan Available",
          subtitle: coachName,
          message: `Your coach has assigned you a new ${planTypeLabel} plan`,
          data: { assignment_id, plan_id, plan_type },
        }),
      });

      if (!pushResponse.ok) {
        console.error("Push notification failed:", await pushResponse.text());
      }
    }

    console.log(`Plan assignment notification sent to ${client.first_name || "client"}`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in notify-plan-assigned:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
