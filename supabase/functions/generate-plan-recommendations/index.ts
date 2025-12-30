import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { clientId } = await req.json();
    console.log("Generating recommendations for client:", clientId);

    // Get coach profile
    const { data: coachProfile } = await supabase
      .from("coach_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!coachProfile) {
      return new Response(JSON.stringify({ error: "Coach profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get client data
    const { data: clientProfile } = await supabase
      .from("client_profiles")
      .select("*, client_goals(*)")
      .eq("id", clientId)
      .single();

    // Get recent progress
    const { data: progress } = await supabase
      .from("client_progress")
      .select("*")
      .eq("client_id", clientId)
      .order("recorded_at", { ascending: false })
      .limit(10);

    // Get active plan assignments
    const { data: planAssignments } = await supabase
      .from("plan_assignments")
      .select("*, training_plan:training_plans(*)")
      .eq("client_id", clientId)
      .eq("status", "active");

    // Analyze data and generate recommendations
    const recommendations: any[] = [];

    // Check weight trends
    if (progress && progress.length >= 2) {
      const recentWeight = progress[0]?.weight_kg;
      const oldWeight = progress[progress.length - 1]?.weight_kg;
      if (recentWeight && oldWeight) {
        const change = recentWeight - oldWeight;
        const goals = clientProfile?.client_goals || [];
        const hasWeightLossGoal = goals.some((g: any) => g.goal_type === "weight_loss");
        
        if (hasWeightLossGoal && change > 0) {
          recommendations.push({
            coach_id: coachProfile.id,
            client_id: clientId,
            recommendation_type: "nutrition",
            title: "Weight Loss Plateau Detected",
            description: "Client has gained weight despite having a weight loss goal. Consider adjusting calorie targets or increasing activity.",
            rationale: `Weight increased by ${change.toFixed(1)}kg over recent entries.`,
            priority: "high",
            suggested_changes: { action: "reduce_calories", amount: 200 },
          });
        }
      }
    }

    // Check plan completion
    if (planAssignments && planAssignments.length > 0) {
      const currentPlan = planAssignments[0];
      const weeks = currentPlan.training_plan?.duration_weeks || 4;
      const startDate = new Date(currentPlan.start_date);
      const now = new Date();
      const weeksElapsed = Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      if (weeksElapsed >= weeks - 1) {
        recommendations.push({
          coach_id: coachProfile.id,
          client_id: clientId,
          recommendation_type: "workout",
          title: "Plan Nearing Completion",
          description: `Current training plan is in its final week. Consider preparing the next phase.`,
          rationale: `Plan "${currentPlan.training_plan?.name}" has ${weeks - weeksElapsed} week(s) remaining.`,
          priority: "medium",
          suggested_changes: { action: "prepare_next_plan" },
        });
      }
    }

    // Check activity levels from health data
    const { data: healthData } = await supabase
      .from("health_data_sync")
      .select("*")
      .eq("client_id", clientId)
      .eq("data_type", "steps")
      .gte("synced_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (healthData) {
      const avgSteps = healthData.length > 0 
        ? healthData.reduce((sum, d) => sum + (Number(d.value) || 0), 0) / healthData.length 
        : 0;
      
      if (avgSteps < 5000) {
        recommendations.push({
          coach_id: coachProfile.id,
          client_id: clientId,
          recommendation_type: "general",
          title: "Low Daily Activity",
          description: "Client's average daily steps are below recommended levels. Consider adding walking or active recovery sessions.",
          rationale: `Average steps: ${Math.round(avgSteps)} (recommended: 8,000+)`,
          priority: avgSteps < 3000 ? "high" : "medium",
          suggested_changes: { action: "add_walking", target_steps: 8000 },
        });
      }
    }

    // Insert recommendations if any
    if (recommendations.length > 0) {
      const { error: insertError } = await supabase
        .from("ai_plan_recommendations")
        .insert(recommendations);

      if (insertError) {
        console.error("Error inserting recommendations:", insertError);
        throw insertError;
      }

      console.log(`Generated ${recommendations.length} recommendations`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: recommendations.length,
        recommendations 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error generating recommendations:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
