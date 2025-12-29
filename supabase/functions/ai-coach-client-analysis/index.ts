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
  notes: any[];
  wearableData: any[];
  progressPhotos: any[];
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

    // Fetch client data
    const clientData: ClientData = {
      progressData: [],
      mealLogs: [],
      trainingLogs: [],
      habits: [],
      profile: null,
      notes: [],
      wearableData: [],
      progressPhotos: [],
    };

    // Get client profile
    const { data: profile } = await supabase
      .from("client_profiles")
      .select("first_name, last_name, fitness_goals, weight_kg, height_cm, activity_level, body_measurements")
      .eq("id", clientId)
      .single();
    clientData.profile = profile;

    // Define time ranges
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Get progress data (last 60 days for comparison)
    const { data: progressData } = await supabase
      .from("client_progress")
      .select("weight_kg, body_fat_percentage, recorded_at, measurements, photo_urls")
      .eq("client_id", clientId)
      .gte("recorded_at", sixtyDaysAgo.toISOString())
      .order("recorded_at", { ascending: false });
    clientData.progressData = progressData || [];

    // Extract progress photos
    clientData.progressPhotos = (progressData || [])
      .filter((p: any) => p.photo_urls && p.photo_urls.length > 0)
      .map((p: any) => ({
        date: p.recorded_at,
        urls: p.photo_urls,
      }));

    // Get meal logs (last 14 days)
    const { data: mealLogs } = await supabase
      .from("food_diary")
      .select("meal_type, calories, protein_g, carbs_g, fat_g, logged_at")
      .eq("client_id", clientId)
      .gte("logged_at", fourteenDaysAgo.toISOString());
    clientData.mealLogs = mealLogs || [];

    // Get training logs (last 30 days)
    const { data: trainingLogs } = await supabase
      .from("training_logs")
      .select("workout_name, duration_minutes, rpe, fatigue_level, logged_at, notes")
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

    // Get coach notes about this client
    const { data: notes } = await supabase
      .from("client_notes")
      .select("content, category, created_at")
      .eq("client_id", clientId)
      .eq("coach_id", coachProfile.id)
      .order("created_at", { ascending: false })
      .limit(10);
    clientData.notes = notes || [];

    // Get wearable data
    const { data: wearableData } = await supabase
      .from("health_data_sync")
      .select("data_type, value, unit, recorded_at")
      .eq("client_id", clientId)
      .gte("recorded_at", fourteenDaysAgo.toISOString())
      .order("recorded_at", { ascending: false });
    clientData.wearableData = wearableData || [];

    console.log("Client data fetched:", {
      progressCount: clientData.progressData.length,
      mealCount: clientData.mealLogs.length,
      trainingCount: clientData.trainingLogs.length,
      habitCount: clientData.habits.length,
      notesCount: clientData.notes.length,
      wearableCount: clientData.wearableData.length,
      photosCount: clientData.progressPhotos.length,
    });

    // Generate AI analysis using Lovable AI Gateway
    const prompt = buildAnalysisPrompt(clientData);
    
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert fitness coach AI assistant. Analyze client data and provide structured, actionable insights. Always return valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", errorText);
      throw new Error("Failed to generate AI analysis");
    }

    const aiData = await aiResponse.json();
    const aiText = aiData.choices?.[0]?.message?.content || "";

    console.log("AI response received, parsing...");

    // Parse AI response into structured format
    const report = parseAIResponse(aiText);
    report.generatedAt = new Date().toISOString();

    // Add photo comparison data if available
    if (clientData.progressPhotos.length >= 2) {
      const sortedPhotos = clientData.progressPhotos.sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      report.photoComparison = {
        hasPhotos: true,
        beforeDate: sortedPhotos[0].date,
        afterDate: sortedPhotos[sortedPhotos.length - 1].date,
        beforeUrl: sortedPhotos[0].urls[0],
        afterUrl: sortedPhotos[sortedPhotos.length - 1].urls[0],
      };
    } else {
      report.photoComparison = { hasPhotos: false };
    }

    // Add measurements comparison if available
    const progressWithMeasurements = clientData.progressData.filter((p: any) => p.measurements);
    if (progressWithMeasurements.length >= 2) {
      const sorted = progressWithMeasurements.sort((a: any, b: any) => 
        new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
      );
      report.measurementsComparison = {
        hasData: true,
        before: {
          date: sorted[0].recorded_at,
          measurements: sorted[0].measurements,
        },
        after: {
          date: sorted[sorted.length - 1].recorded_at,
          measurements: sorted[sorted.length - 1].measurements,
        },
      };
    } else {
      report.measurementsComparison = { hasData: false };
    }

    // Add wearable summary if available
    if (clientData.wearableData.length > 0) {
      const wearableSummary: Record<string, { avg: number; unit: string; count: number }> = {};
      clientData.wearableData.forEach((d: any) => {
        if (!wearableSummary[d.data_type]) {
          wearableSummary[d.data_type] = { avg: 0, unit: d.unit, count: 0 };
        }
        wearableSummary[d.data_type].avg += Number(d.value) || 0;
        wearableSummary[d.data_type].count++;
      });
      
      Object.keys(wearableSummary).forEach(key => {
        wearableSummary[key].avg = Math.round(wearableSummary[key].avg / wearableSummary[key].count);
      });
      
      report.wearableSummary = wearableSummary;
    }

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
  const { profile, progressData, mealLogs, trainingLogs, habits, notes, wearableData } = data;

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

  // Weight change calculation
  const sortedProgress = [...progressData].sort((a, b) => 
    new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );
  const weightChange = sortedProgress.length >= 2
    ? (sortedProgress[sortedProgress.length - 1].weight_kg - sortedProgress[0].weight_kg).toFixed(1)
    : "N/A";

  // Wearable data summary
  const wearableSummary = wearableData.reduce((acc: any, d: any) => {
    if (!acc[d.data_type]) acc[d.data_type] = [];
    acc[d.data_type].push(d.value);
    return acc;
  }, {});

  const wearableAvgs = Object.entries(wearableSummary).map(([type, values]: [string, any]) => {
    const avg = values.reduce((a: number, b: number) => a + Number(b), 0) / values.length;
    return `${type}: avg ${Math.round(avg)}`;
  }).join(", ");

  // Recent notes summary
  const noteSummary = notes.slice(0, 5).map((n: any) => `- [${n.category}] ${n.content}`).join("\n");

  return `You are an expert fitness coach analyzing client data. Generate a comprehensive analysis report.

CLIENT PROFILE:
- Name: ${profile?.first_name || "Client"} ${profile?.last_name || ""}
- Goals: ${profile?.fitness_goals?.join(", ") || "Not specified"}
- Current weight: ${profile?.weight_kg || "N/A"} kg
- Height: ${profile?.height_cm || "N/A"} cm
- Activity level: ${profile?.activity_level || "Not specified"}

DATA SUMMARY (Last 30-60 days):
- Progress entries: ${progressData.length}
- Weight change over period: ${weightChange} kg
- Meal logs: ${totalMeals} entries
- Average daily calories: ${avgCalories}
- Average protein per meal: ${avgProtein}g
- Training sessions: ${totalWorkouts}
- Average workout RPE: ${avgRPE}
- Habit completion rate: ${habitCompletionRate}%

WEARABLE DATA:
${wearableAvgs || "No wearable data available"}

TRAINING FATIGUE LEVELS: ${trainingLogs.map(t => t.fatigue_level).filter(Boolean).join(", ") || "Not tracked"}

RECENT COACH NOTES:
${noteSummary || "No recent notes"}

Generate a JSON response with this exact structure:
{
  "summary": "2-3 sentence overview of client's current status, progress trajectory, and key observations",
  "trends": [
    {"category": "Weight", "trend": "improving|stable|declining|insufficient_data", "detail": "Specific observation about weight trends"},
    {"category": "Nutrition", "trend": "improving|stable|declining|insufficient_data", "detail": "Analysis of nutrition logging and adherence"},
    {"category": "Training", "trend": "improving|stable|declining|insufficient_data", "detail": "Training consistency and intensity analysis"},
    {"category": "Recovery", "trend": "improving|stable|declining|insufficient_data", "detail": "Based on fatigue levels, sleep, and wearable data"}
  ],
  "adherence": [
    {"area": "Nutrition Logging", "score": 0-100, "notes": "Frequency and consistency of meal logging"},
    {"area": "Training Consistency", "score": 0-100, "notes": "Workout frequency and plan adherence"},
    {"area": "Habit Tracking", "score": 0-100, "notes": "Daily habit completion rate"}
  ],
  "risks": [
    {"level": "low|medium|high", "description": "Any concerns about overtraining, underrecovery, nutrition deficits, or stalled progress"}
  ],
  "recommendations": [
    "Specific, actionable recommendation 1",
    "Specific, actionable recommendation 2",
    "Specific, actionable recommendation 3",
    "Specific, actionable recommendation 4"
  ],
  "suggestedNextSteps": [
    "Immediate action coach should take",
    "Topic for next check-in conversation"
  ]
}

IMPORTANT: Base your analysis only on the provided data. If data is insufficient, indicate this in the relevant sections. Return ONLY valid JSON, no markdown or other text.`;
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
      summary: "Unable to generate detailed analysis. Please try again or ensure the client has logged sufficient data.",
      trends: [
        { category: "Weight", trend: "insufficient_data", detail: "Not enough data to determine trend" },
        { category: "Nutrition", trend: "insufficient_data", detail: "Not enough data to determine trend" },
        { category: "Training", trend: "insufficient_data", detail: "Not enough data to determine trend" },
      ],
      adherence: [
        { area: "Nutrition Logging", score: 0, notes: "Unable to calculate" },
        { area: "Training Consistency", score: 0, notes: "Unable to calculate" },
        { area: "Habit Tracking", score: 0, notes: "Unable to calculate" },
      ],
      risks: [{ level: "low", description: "Analysis incomplete - recommend manual review" }],
      recommendations: [
        "Ensure client is logging data regularly for better insights",
        "Schedule a check-in to discuss progress tracking",
      ],
      suggestedNextSteps: [
        "Review client's logging habits",
        "Consider setting up reminders for the client",
      ],
    };
  }
}
