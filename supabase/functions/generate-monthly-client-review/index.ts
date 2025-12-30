import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MonthlyReviewData {
  period: { start: string; end: string };
  weight: { start: number | null; end: number | null; change: number | null };
  habits: { totalCompleted: number; completionRate: number };
  workouts: { count: number; totalMinutes: number };
  nutrition: { avgCalories: number; avgProtein: number };
  health: { avgSteps: number; avgSleep: number; avgActiveMinutes: number };
  challenges: { completed: number; xpEarned: number };
  streak: { current: number; best: number };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get client profile
    const { data: clientProfile } = await supabase
      .from("client_profiles")
      .select("id, first_name, fitness_goals")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!clientProfile) {
      return new Response(JSON.stringify({ error: "Client profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clientId = clientProfile.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startStr = startOfMonth.toISOString().split("T")[0];
    const endStr = endOfMonth.toISOString().split("T")[0];

    // Gather data in parallel
    const [
      progressRes,
      habitsRes,
      workoutsRes,
      foodRes,
      healthRes,
      challengesRes,
      streakRes,
    ] = await Promise.all([
      supabase
        .from("client_progress")
        .select("weight_kg, recorded_at")
        .eq("client_id", clientId)
        .gte("recorded_at", startStr)
        .lte("recorded_at", endStr)
        .order("recorded_at"),
      supabase
        .from("habit_logs")
        .select("completed_count")
        .eq("client_id", clientId)
        .gte("logged_at", startStr)
        .lte("logged_at", endStr),
      supabase
        .from("training_logs")
        .select("duration_minutes")
        .eq("client_id", clientId)
        .gte("created_at", startStr)
        .lte("created_at", endStr),
      supabase
        .from("food_diary")
        .select("calories, protein")
        .eq("client_id", clientId)
        .gte("logged_at", startStr)
        .lte("logged_at", endStr),
      supabase
        .from("health_data_sync")
        .select("data_type, value")
        .eq("client_id", clientId)
        .gte("recorded_at", startStr)
        .lte("recorded_at", endStr),
      supabase
        .from("challenge_participants")
        .select("current_progress, challenge_id, challenges(xp_reward)")
        .eq("client_id", clientId)
        .eq("status", "completed")
        .gte("completed_at", startStr)
        .lte("completed_at", endStr),
      supabase
        .from("habit_streaks")
        .select("current_streak, longest_streak")
        .eq("client_id", clientId)
        .order("current_streak", { ascending: false })
        .limit(1),
    ]);

    // Process weight data
    const weights = (progressRes.data || []).filter((p) => p.weight_kg);
    const weightStart = weights[0]?.weight_kg ?? null;
    const weightEnd = weights[weights.length - 1]?.weight_kg ?? null;
    const weightChange = weightStart && weightEnd ? weightEnd - weightStart : null;

    // Process habits
    const habitLogs = habitsRes.data || [];
    const totalCompleted = habitLogs.filter((h) => (h.completed_count ?? 0) > 0).length;
    const completionRate = habitLogs.length > 0 ? totalCompleted / habitLogs.length : 0;

    // Process workouts
    const workouts = workoutsRes.data || [];
    const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);

    // Process nutrition
    const foodEntries = foodRes.data || [];
    const avgCalories = foodEntries.length > 0
      ? foodEntries.reduce((sum, f) => sum + (f.calories || 0), 0) / foodEntries.length
      : 0;
    const avgProtein = foodEntries.length > 0
      ? foodEntries.reduce((sum, f) => sum + (f.protein || 0), 0) / foodEntries.length
      : 0;

    // Process health data
    const healthData = healthRes.data || [];
    const steps = healthData.filter((h) => h.data_type === "steps");
    const sleep = healthData.filter((h) => h.data_type === "sleep");
    const active = healthData.filter((h) => h.data_type === "active_minutes");
    const avgSteps = steps.length > 0 ? steps.reduce((s, h) => s + h.value, 0) / steps.length : 0;
    const avgSleep = sleep.length > 0 ? sleep.reduce((s, h) => s + h.value, 0) / sleep.length / 60 : 0;
    const avgActiveMinutes = active.length > 0 ? active.reduce((s, h) => s + h.value, 0) / active.length : 0;

    // Process challenges
    const challenges = challengesRes.data || [];
    const xpEarned = challenges.reduce((sum, c: any) => sum + (c.challenges?.xp_reward || 0), 0);

    // Process streaks
    const streakData = streakRes.data?.[0];
    const currentStreak = streakData?.current_streak || 0;
    const bestStreak = streakData?.longest_streak || 0;

    const reviewData: MonthlyReviewData = {
      period: { start: startStr, end: endStr },
      weight: { start: weightStart, end: weightEnd, change: weightChange },
      habits: { totalCompleted, completionRate: Math.round(completionRate * 100) },
      workouts: { count: workouts.length, totalMinutes },
      nutrition: { avgCalories: Math.round(avgCalories), avgProtein: Math.round(avgProtein) },
      health: { avgSteps: Math.round(avgSteps), avgSleep: Math.round(avgSleep * 10) / 10, avgActiveMinutes: Math.round(avgActiveMinutes) },
      challenges: { completed: challenges.length, xpEarned },
      streak: { current: currentStreak, best: bestStreak },
    };

    // Generate AI summary if API key is available
    let aiSummary = null;
    if (lovableApiKey) {
      const firstName = clientProfile.first_name || "there";
      const goals = clientProfile.fitness_goals?.join(", ") || "general fitness";

      const systemPrompt = `You are a supportive fitness coach assistant. Generate a brief, encouraging monthly progress summary for a client. Be positive but honest. Use simple language. Keep it under 150 words. Never give medical advice.`;

      const userPrompt = `Generate a monthly progress summary for ${firstName} whose goals are: ${goals}.

Data from the past month:
- Weight change: ${weightChange ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)}kg` : "Not tracked"}
- Workouts: ${workouts.length} sessions (${totalMinutes} total minutes)
- Habit completion rate: ${Math.round(completionRate * 100)}%
- Average daily steps: ${Math.round(avgSteps).toLocaleString()}
- Average sleep: ${avgSleep.toFixed(1)} hours
- Challenges completed: ${challenges.length}

Provide:
1. A brief headline (5-7 words)
2. 2-3 sentences highlighting achievements
3. One actionable focus area for next month`;

      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            max_tokens: 300,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          aiSummary = aiData.choices?.[0]?.message?.content || null;
        } else {
          console.log("[monthly-review] AI request failed:", aiResponse.status);
        }
      } catch (aiError) {
        console.error("[monthly-review] AI error:", aiError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: reviewData,
        aiSummary,
        generatedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[monthly-review] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
