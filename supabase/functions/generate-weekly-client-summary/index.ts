import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WeeklyData {
  habitsCompleted: number;
  habitTotal: number;
  habitCompletionRate: number;
  workoutsLogged: number;
  avgSteps: number;
  avgSleep: number;
  nutritionEntries: number;
  streakDays: number;
  weekOverWeekChange: {
    habits: number;
    workouts: number;
    steps: number;
  };
}

interface WeeklySummary {
  summary: string;
  highlights: string[];
  improvements: string[];
  weeklyData: WeeklyData;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

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
      .select("id, first_name")
      .eq("user_id", user.id)
      .single();

    if (!clientProfile) {
      return new Response(JSON.stringify({ error: "Client profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);
    
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);

    console.log(`Generating weekly summary for client ${clientProfile.id}`);

    // Get habit logs for this week
    const { data: thisWeekHabits } = await supabase
      .from("habit_logs")
      .select("completed_count, client_habits!inner(client_id, target_count)")
      .eq("client_habits.client_id", clientProfile.id)
      .gte("log_date", weekStart.toISOString().split("T")[0]);

    const { data: prevWeekHabits } = await supabase
      .from("habit_logs")
      .select("completed_count, client_habits!inner(client_id, target_count)")
      .eq("client_habits.client_id", clientProfile.id)
      .gte("log_date", prevWeekStart.toISOString().split("T")[0])
      .lt("log_date", weekStart.toISOString().split("T")[0]);

    // Calculate habit completion
    const thisWeekCompleted = thisWeekHabits?.reduce((sum, log) => sum + (log.completed_count || 0), 0) || 0;
    const thisWeekTotal = thisWeekHabits?.reduce((sum, log) => {
      const habits = log.client_habits as unknown as { target_count: number };
      return sum + (habits?.target_count || 1);
    }, 0) || 0;
    const prevWeekCompleted = prevWeekHabits?.reduce((sum, log) => sum + (log.completed_count || 0), 0) || 0;

    // Get workouts
    const { count: thisWeekWorkouts } = await supabase
      .from("workout_logs")
      .select("*", { count: "exact", head: true })
      .eq("client_id", clientProfile.id)
      .gte("created_at", weekStart.toISOString());

    const { count: prevWeekWorkouts } = await supabase
      .from("workout_logs")
      .select("*", { count: "exact", head: true })
      .eq("client_id", clientProfile.id)
      .gte("created_at", prevWeekStart.toISOString())
      .lt("created_at", weekStart.toISOString());

    // Get wearable data
    const { data: wearableData } = await supabase
      .from("wearable_data")
      .select("metric_type, value")
      .eq("client_id", clientProfile.id)
      .gte("recorded_at", weekStart.toISOString());

    const { data: prevWearableData } = await supabase
      .from("wearable_data")
      .select("metric_type, value")
      .eq("client_id", clientProfile.id)
      .gte("recorded_at", prevWeekStart.toISOString())
      .lt("recorded_at", weekStart.toISOString());

    // Calculate averages
    const stepsData = wearableData?.filter(d => d.metric_type === "steps") || [];
    const prevStepsData = prevWearableData?.filter(d => d.metric_type === "steps") || [];
    const avgSteps = stepsData.length > 0 
      ? Math.round(stepsData.reduce((sum, d) => sum + (d.value || 0), 0) / stepsData.length)
      : 0;
    const prevAvgSteps = prevStepsData.length > 0
      ? Math.round(prevStepsData.reduce((sum, d) => sum + (d.value || 0), 0) / prevStepsData.length)
      : 0;

    const sleepData = wearableData?.filter(d => d.metric_type === "sleep_hours") || [];
    const avgSleep = sleepData.length > 0
      ? Math.round((sleepData.reduce((sum, d) => sum + (d.value || 0), 0) / sleepData.length) * 10) / 10
      : 0;

    // Get nutrition entries
    const { count: nutritionEntries } = await supabase
      .from("nutrition_entries")
      .select("*", { count: "exact", head: true })
      .eq("client_id", clientProfile.id)
      .gte("logged_at", weekStart.toISOString());

    // Calculate week-over-week changes
    const habitChange = prevWeekCompleted > 0 
      ? Math.round(((thisWeekCompleted - prevWeekCompleted) / prevWeekCompleted) * 100)
      : 0;
    const workoutChange = (prevWeekWorkouts || 0) > 0
      ? Math.round((((thisWeekWorkouts || 0) - (prevWeekWorkouts || 0)) / (prevWeekWorkouts || 1)) * 100)
      : 0;
    const stepsChange = prevAvgSteps > 0
      ? Math.round(((avgSteps - prevAvgSteps) / prevAvgSteps) * 100)
      : 0;

    const weeklyData: WeeklyData = {
      habitsCompleted: thisWeekCompleted,
      habitTotal: thisWeekTotal,
      habitCompletionRate: thisWeekTotal > 0 ? Math.round((thisWeekCompleted / thisWeekTotal) * 100) : 0,
      workoutsLogged: thisWeekWorkouts || 0,
      avgSteps,
      avgSleep,
      nutritionEntries: nutritionEntries || 0,
      streakDays: 0, // Simplified
      weekOverWeekChange: {
        habits: habitChange,
        workouts: workoutChange,
        steps: stepsChange,
      },
    };

    // Generate AI summary using Lovable AI
    const prompt = `Generate a brief, encouraging weekly fitness summary for ${clientProfile.first_name || "this client"}.

Weekly stats:
- Habits completed: ${weeklyData.habitsCompleted}/${weeklyData.habitTotal} (${weeklyData.habitCompletionRate}%)
- Workouts logged: ${weeklyData.workoutsLogged}
- Average daily steps: ${weeklyData.avgSteps}
- Average sleep: ${weeklyData.avgSleep} hours
- Nutrition entries: ${weeklyData.nutritionEntries}

Week-over-week changes:
- Habits: ${weeklyData.weekOverWeekChange.habits > 0 ? '+' : ''}${weeklyData.weekOverWeekChange.habits}%
- Workouts: ${weeklyData.weekOverWeekChange.workouts > 0 ? '+' : ''}${weeklyData.weekOverWeekChange.workouts}%
- Steps: ${weeklyData.weekOverWeekChange.steps > 0 ? '+' : ''}${weeklyData.weekOverWeekChange.steps}%

Respond in JSON format:
{
  "summary": "2-3 sentence encouraging summary",
  "highlights": ["highlight 1", "highlight 2"],
  "improvements": ["area to focus on"]
}`;

    const aiResponse = await fetch("https://api.lovable.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a supportive fitness coach assistant. Generate brief, positive summaries. Keep highlights to 2 items max, improvements to 1 item.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    let aiSummary = {
      summary: `Great week of progress! You completed ${weeklyData.habitCompletionRate}% of your habits and logged ${weeklyData.workoutsLogged} workouts.`,
      highlights: ["Consistent effort throughout the week"],
      improvements: ["Keep pushing towards your goals"],
    };

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content;
      if (content) {
        try {
          const parsed = JSON.parse(content);
          aiSummary = {
            summary: parsed.summary || aiSummary.summary,
            highlights: parsed.highlights || aiSummary.highlights,
            improvements: parsed.improvements || aiSummary.improvements,
          };
        } catch (e) {
          console.log("Using fallback summary due to parse error");
        }
      }
    }

    const result: WeeklySummary = {
      ...aiSummary,
      weeklyData,
    };

    console.log("Weekly summary generated successfully");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error generating weekly summary:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
