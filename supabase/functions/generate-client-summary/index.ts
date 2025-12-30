import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GeneratedSummary {
  overview: string;
  achievements: string[];
  areasForImprovement: string[];
  recommendations: string[];
  metrics: {
    label: string;
    value: string;
    trend?: "up" | "down" | "stable";
  }[];
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

    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { clientId, summaryType = "weekly", focusAreas = [] } = await req.json();

    if (!clientId) {
      throw new Error("clientId is required");
    }

    console.log(`Generating ${summaryType} summary for client ${clientId}`);

    // Get coach profile
    const { data: coachProfile } = await supabase
      .from("coach_profiles")
      .select("id, display_name")
      .eq("user_id", user.id)
      .single();

    if (!coachProfile) {
      throw new Error("Coach profile not found");
    }

    // Verify coach has access to this client
    const { data: clientRelation } = await supabase
      .from("coach_clients")
      .select("*")
      .eq("coach_id", coachProfile.id)
      .eq("client_id", clientId)
      .single();

    if (!clientRelation) {
      throw new Error("Client not found or access denied");
    }

    // Fetch client data
    const { data: clientProfile } = await supabase
      .from("client_profiles")
      .select("*")
      .eq("id", clientId)
      .single();

    // Fetch recent progress data
    const { data: progressData } = await supabase
      .from("client_progress")
      .select("*")
      .eq("client_id", clientId)
      .order("recorded_at", { ascending: false })
      .limit(10);

    // Fetch engagement score
    const { data: engagementScore } = await supabase
      .from("client_engagement_scores")
      .select("*")
      .eq("client_id", clientId)
      .eq("coach_id", coachProfile.id)
      .single();

    // Fetch recent habit completions
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: habitLogs } = await supabase
      .from("habit_logs")
      .select("*, client_habits!inner(name)")
      .eq("client_habits.client_id", clientId)
      .gte("completed_at", thirtyDaysAgo.toISOString())
      .limit(100);

    // Fetch recent sessions
    const { data: sessions } = await supabase
      .from("coaching_sessions")
      .select("*")
      .eq("client_id", clientId)
      .eq("coach_id", coachProfile.id)
      .gte("scheduled_at", thirtyDaysAgo.toISOString())
      .order("scheduled_at", { ascending: false });

    // Calculate metrics
    const clientName = `${clientProfile?.first_name || ""} ${clientProfile?.last_name || ""}`.trim() || "Client";
    
    const completedSessions = sessions?.filter(s => s.status === "completed").length || 0;
    const totalSessions = sessions?.length || 0;
    const sessionAttendanceRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    const habitCompletions = habitLogs?.length || 0;
    
    // Weight progress
    let weightChange: number | null = null;
    if (progressData && progressData.length >= 2) {
      const latest = progressData[0]?.weight_kg;
      const earliest = progressData[progressData.length - 1]?.weight_kg;
      if (latest && earliest) {
        weightChange = latest - earliest;
      }
    }

    // Build prompt for AI
    const prompt = `You are a fitness coach assistant. Generate a ${summaryType} progress summary for a client.

CLIENT INFO:
- Name: ${clientName}
- Goals: ${clientProfile?.fitness_goals?.join(", ") || "Not specified"}
- Activity Level: ${clientProfile?.activity_level || "Not specified"}

RECENT METRICS:
- Session Attendance Rate: ${sessionAttendanceRate}% (${completedSessions}/${totalSessions} sessions)
- Habit Completions (last 30 days): ${habitCompletions}
- Engagement Score: ${engagementScore?.overall_score || "N/A"}/100
${weightChange !== null ? `- Weight Change: ${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)}kg` : ""}

${focusAreas.length > 0 ? `FOCUS AREAS: ${focusAreas.join(", ")}` : ""}

Generate a JSON response with this exact structure:
{
  "overview": "A 2-3 sentence summary of the client's progress",
  "achievements": ["List of 2-4 specific achievements or positive observations"],
  "areasForImprovement": ["List of 1-3 areas where the client can improve"],
  "recommendations": ["List of 2-3 actionable recommendations"],
  "metrics": [
    {"label": "Metric name", "value": "Value with unit", "trend": "up|down|stable"}
  ]
}

IMPORTANT GUIDELINES:
- Be positive and encouraging but honest
- Focus on observable metrics and behaviors
- Do NOT use any medical or diagnostic language
- Keep achievements specific and data-driven
- Make recommendations actionable and practical
- Include 3-5 relevant metrics in the metrics array`;

    // Call Lovable AI
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    
    let summary: GeneratedSummary;
    
    if (lovableApiKey) {
      const aiResponse = await fetch("https://api.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${lovableApiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!aiResponse.ok) {
        console.error("AI API error:", await aiResponse.text());
        throw new Error("AI generation failed");
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || "";
      
      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        summary = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response");
      }
    } else {
      // Fallback summary if no API key
      console.log("No LOVABLE_API_KEY found, generating fallback summary");
      summary = {
        overview: `${clientName} has been making progress over the past ${summaryType === "weekly" ? "week" : "month"}. With ${completedSessions} completed sessions and an engagement score of ${engagementScore?.overall_score || "N/A"}, they are showing commitment to their fitness journey.`,
        achievements: [
          `Completed ${completedSessions} training sessions`,
          habitCompletions > 0 ? `Logged ${habitCompletions} habit completions` : "Started tracking habits",
          sessionAttendanceRate >= 80 ? "Excellent session attendance" : "Regular session participation",
        ].filter(Boolean),
        areasForImprovement: [
          sessionAttendanceRate < 80 ? "Improve session attendance consistency" : null,
          "Continue building on current momentum",
        ].filter(Boolean) as string[],
        recommendations: [
          "Review and adjust training intensity based on progress",
          "Consider setting new short-term goals",
          "Continue consistent habit tracking",
        ],
        metrics: [
          { label: "Sessions Completed", value: `${completedSessions}/${totalSessions}`, trend: "stable" as const },
          { label: "Attendance Rate", value: `${sessionAttendanceRate}%`, trend: sessionAttendanceRate >= 80 ? "up" as const : "stable" as const },
          { label: "Engagement Score", value: `${engagementScore?.overall_score || 0}/100`, trend: "stable" as const },
        ],
      };

      if (weightChange !== null) {
        summary.metrics.push({
          label: "Weight Change",
          value: `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)}kg`,
          trend: weightChange < 0 ? "down" : weightChange > 0 ? "up" : "stable",
        });
      }
    }

    console.log("Summary generated successfully");

    return new Response(
      JSON.stringify({ summary, generated: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating summary:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
