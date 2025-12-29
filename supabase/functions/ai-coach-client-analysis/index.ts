import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ClientData {
  progressData: any[];
  mealLogs: any[];
  trainingLogs: any[];
  habits: any[];
  profile: any;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { clientId } = await req.json();
    if (!clientId) {
      throw new Error("Client ID is required");
    }

    console.log(`Generating AI analysis for client ${clientId} by coach ${user.id}`);

    // Verify coach has access to this client
    const { data: coachProfile } = await supabase
      .from("coach_profiles")
      .select("id, subscription_tier")
      .eq("user_id", user.id)
      .single();

    if (!coachProfile) {
      throw new Error("Coach profile not found");
    }

    // Check tier access (enterprise or founder only)
    const allowedTiers = ["enterprise", "founder"];
    if (!allowedTiers.includes(coachProfile.subscription_tier || "")) {
      throw new Error("This feature requires Enterprise or Founder plan");
    }

    // Verify coach-client relationship
    const { data: relationship } = await supabase
      .from("coach_clients")
      .select("id")
      .eq("coach_id", coachProfile.id)
      .eq("client_id", clientId)
      .eq("status", "active")
      .single();

    if (!relationship) {
      throw new Error("No active relationship with this client");
    }

    // Fetch client data (respecting privacy settings via RLS with service role for aggregation)
    const clientData: ClientData = {
      progressData: [],
      mealLogs: [],
      trainingLogs: [],
      habits: [],
      profile: null,
    };

    // Get client profile
    const { data: profile } = await supabase
      .from("client_profiles")
      .select("first_name, last_name, fitness_goals, weight_kg, height_cm, activity_level")
      .eq("id", clientId)
      .single();
    clientData.profile = profile;

    // Get progress data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: progressData } = await supabase
      .from("client_progress")
      .select("weight_kg, body_fat_percentage, recorded_at, measurements")
      .eq("client_id", clientId)
      .gte("recorded_at", thirtyDaysAgo.toISOString())
      .order("recorded_at", { ascending: false });
    clientData.progressData = progressData || [];

    // Get meal logs (last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const { data: mealLogs } = await supabase
      .from("food_diary")
      .select("meal_type, calories, protein_g, carbs_g, fat_g, logged_at")
      .eq("client_id", clientId)
      .gte("logged_at", fourteenDaysAgo.toISOString());
    clientData.mealLogs = mealLogs || [];

    // Get training logs (last 30 days)
    const { data: trainingLogs } = await supabase
      .from("training_logs")
      .select("workout_name, duration_minutes, rpe, fatigue_level, logged_at")
      .eq("client_id", clientId)
      .gte("logged_at", thirtyDaysAgo.toISOString());
    clientData.trainingLogs = trainingLogs || [];

    // Get habit logs
    const { data: habits } = await supabase
      .from("habit_logs")
      .select("habit_id, completed, completed_count, logged_at, client_habits(name, target_count)")
      .eq("client_id", clientId)
      .gte("logged_at", fourteenDaysAgo.toISOString());
    clientData.habits = habits || [];

    console.log("Client data fetched:", {
      progressCount: clientData.progressData.length,
      mealCount: clientData.mealLogs.length,
      trainingCount: clientData.trainingLogs.length,
      habitCount: clientData.habits.length,
    });

    // Generate AI analysis using Lovable AI (Gemini)
    const prompt = buildAnalysisPrompt(clientData);
    
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${Deno.env.get("GOOGLE_GEMINI_API_KEY")}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
      throw new Error("Failed to generate AI analysis");
    }

    const geminiData = await geminiResponse.json();
    const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("AI response received, parsing...");

    // Parse AI response into structured format
    const report = parseAIResponse(aiText);
    report.generatedAt = new Date().toISOString();

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error generating AI analysis:", message);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function buildAnalysisPrompt(data: ClientData): string {
  const { profile, progressData, mealLogs, trainingLogs, habits } = data;

  // Calculate summary stats
  const totalMeals = mealLogs.length;
  const avgCalories = totalMeals > 0
    ? Math.round(mealLogs.reduce((sum, m) => sum + (m.calories || 0), 0) / totalMeals)
    : 0;
  const avgProtein = totalMeals > 0
    ? Math.round(mealLogs.reduce((sum, m) => sum + (m.protein_g || 0), 0) / totalMeals)
    : 0;

  const totalWorkouts = trainingLogs.length;
  const avgRPE = totalWorkouts > 0
    ? (trainingLogs.reduce((sum, t) => sum + (t.rpe || 0), 0) / totalWorkouts).toFixed(1)
    : "N/A";

  const habitCompletionRate = habits.length > 0
    ? Math.round((habits.filter((h: any) => h.completed).length / habits.length) * 100)
    : 0;

  const weightChange = progressData.length >= 2
    ? (progressData[0].weight_kg - progressData[progressData.length - 1].weight_kg).toFixed(1)
    : "N/A";

  return `You are an expert fitness coach analyzing client data. Generate a structured analysis report.

CLIENT PROFILE:
- Name: ${profile?.first_name || "Client"} ${profile?.last_name || ""}
- Goals: ${profile?.fitness_goals?.join(", ") || "Not specified"}
- Current weight: ${profile?.weight_kg || "N/A"} kg
- Height: ${profile?.height_cm || "N/A"} cm
- Activity level: ${profile?.activity_level || "Not specified"}

DATA SUMMARY (Last 30 days):
- Progress entries: ${progressData.length}
- Weight change: ${weightChange} kg
- Meal logs: ${totalMeals} entries
- Average daily calories: ${avgCalories}
- Average protein per meal: ${avgProtein}g
- Training sessions: ${totalWorkouts}
- Average workout RPE: ${avgRPE}
- Habit completion rate: ${habitCompletionRate}%

TRAINING FATIGUE LEVELS: ${trainingLogs.map(t => t.fatigue_level).filter(Boolean).join(", ") || "Not tracked"}

Generate a JSON response with this exact structure:
{
  "summary": "2-3 sentence overview of client's current status and trajectory",
  "trends": [
    {"category": "Weight", "trend": "improving|stable|declining", "detail": "Brief explanation"},
    {"category": "Nutrition", "trend": "improving|stable|declining", "detail": "Brief explanation"},
    {"category": "Training", "trend": "improving|stable|declining", "detail": "Brief explanation"}
  ],
  "adherence": [
    {"area": "Nutrition Logging", "score": 0-100, "notes": "Brief note"},
    {"area": "Training Consistency", "score": 0-100, "notes": "Brief note"},
    {"area": "Habit Tracking", "score": 0-100, "notes": "Brief note"}
  ],
  "risks": [
    {"level": "low|medium|high", "description": "Describe any concerns"}
  ],
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2",
    "Actionable recommendation 3"
  ]
}

Return ONLY valid JSON, no markdown or other text.`;
}

function parseAIResponse(text: string): any {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("No JSON found");
  } catch (e) {
    console.error("Failed to parse AI response:", e);
    // Return a fallback structure
    return {
      summary: "Unable to generate detailed analysis. Please try again.",
      trends: [],
      adherence: [],
      risks: [],
      recommendations: ["Ensure client is logging data regularly for better insights"],
    };
  }
}
