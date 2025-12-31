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

    // Accept either clientId (for single client) or coachId (for all clients)
    const body = await req.json();
    const { clientId, coachId } = body;
    
    console.log("Generating recommendations - clientId:", clientId, "coachId:", coachId);

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

    // Determine which clients to process
    let clientIds: string[] = [];
    
    if (clientId) {
      clientIds = [clientId];
    } else {
      // Get all active clients for this coach
      const { data: coachClients } = await supabase
        .from("coach_clients")
        .select("client_id")
        .eq("coach_id", coachProfile.id)
        .eq("status", "active");
      
      clientIds = coachClients?.map(c => c.client_id) || [];
    }

    if (clientIds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, count: 0, recommendations: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${clientIds.length} client(s)`);

    const allRecommendations: any[] = [];

    for (const currentClientId of clientIds) {
      // Get client data
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("*, client_goals(*)")
        .eq("id", currentClientId)
        .single();

      // Get recent progress
      const { data: progress } = await supabase
        .from("client_progress")
        .select("*")
        .eq("client_id", currentClientId)
        .order("recorded_at", { ascending: false })
        .limit(10);

      // Get active plan assignments
      const { data: planAssignments } = await supabase
        .from("plan_assignments")
        .select("*, training_plan:training_plans(*)")
        .eq("client_id", currentClientId)
        .eq("status", "active");

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
              client_id: currentClientId,
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
            client_id: currentClientId,
            recommendation_type: "workout",
            title: "Plan Nearing Completion",
            description: `Current training plan is in its final week. Consider preparing the next phase.`,
            rationale: `Plan "${currentPlan.training_plan?.name}" has ${weeks - weeksElapsed} week(s) remaining.`,
            priority: "medium",
            suggested_changes: { action: "prepare_next_plan" },
          });
        }
      }

      // Check activity levels from health data (using created_at column)
      const { data: healthData } = await supabase
        .from("health_data_sync")
        .select("*")
        .eq("client_id", currentClientId)
        .eq("data_type", "steps")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (healthData) {
        const avgSteps = healthData.length > 0 
          ? healthData.reduce((sum, d) => sum + (Number(d.value) || 0), 0) / healthData.length 
          : 0;
        
        if (avgSteps < 5000) {
          recommendations.push({
            coach_id: coachProfile.id,
            client_id: currentClientId,
            recommendation_type: "general",
            title: "Low Daily Activity",
            description: "Client's average daily steps are below recommended levels. Consider adding walking or active recovery sessions.",
            rationale: `Average steps: ${Math.round(avgSteps)} (recommended: 8,000+)`,
            priority: avgSteps < 3000 ? "high" : "medium",
            suggested_changes: { action: "add_walking", target_steps: 8000 },
          });
        }
      }

      allRecommendations.push(...recommendations);
    }

    // Insert recommendations if any
    if (allRecommendations.length > 0) {
      const { error: insertError } = await supabase
        .from("ai_plan_recommendations")
        .insert(allRecommendations);

      if (insertError) {
        console.error("Error inserting recommendations:", insertError);
        throw insertError;
      }

      console.log(`Generated ${allRecommendations.length} recommendations`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: allRecommendations.length,
        recommendations: allRecommendations 
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
