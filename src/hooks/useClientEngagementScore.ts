import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { subDays, differenceInHours } from "date-fns";
import { isFeatureEnabled } from "@/lib/coach-feature-flags";

export interface EngagementScoreBreakdown {
  sessionAttendance: number;    // 25% weight
  habitCompletion: number;      // 25% weight
  messageResponsiveness: number; // 15% weight
  progressLogging: number;      // 20% weight
  planAdherence: number;        // 15% weight
}

export interface ClientEngagementData {
  clientId: string;
  clientName: string;
  avatarUrl: string | null;
  overallScore: number;
  breakdown: EngagementScoreBreakdown;
  weekOverWeekChange: number;
  trend: "up" | "down" | "stable";
  lastUpdated: Date;
}

const SCORE_WEIGHTS = {
  sessionAttendance: 0.25,
  habitCompletion: 0.25,
  messageResponsiveness: 0.15,
  progressLogging: 0.20,
  planAdherence: 0.15,
};

export function useClientEngagementScore(clientId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["client-engagement-score", user?.id, clientId],
    queryFn: async (): Promise<ClientEngagementData[]> => {
      if (!user?.id || !isFeatureEnabled("CLIENT_ENGAGEMENT_SCORING")) return [];

      // Get coach profile
      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!coachProfile) return [];

      // Get clients to analyze
      let clientsQuery = supabase
        .from("coach_clients")
        .select(`
          client_id,
          client_profiles!coach_clients_client_id_fkey (
            id,
            first_name,
            last_name,
            username,
            avatar_url
          )
        `)
        .eq("coach_id", coachProfile.id)
        .eq("status", "active");

      if (clientId) {
        clientsQuery = clientsQuery.eq("client_id", clientId);
      }

      const { data: clients } = await clientsQuery;
      if (!clients || clients.length === 0) return [];

      const now = new Date();
      const thirtyDaysAgo = subDays(now, 30);
      const sevenDaysAgo = subDays(now, 7);
      const fourteenDaysAgo = subDays(now, 14);

      const engagementPromises = clients.map(async (client) => {
        const profile = client.client_profiles;
        if (!profile) return null;

        const cId = client.client_id;
        const breakdown: EngagementScoreBreakdown = {
          sessionAttendance: 0,
          habitCompletion: 0,
          messageResponsiveness: 0,
          progressLogging: 0,
          planAdherence: 0,
        };

        // 1. Session Attendance Score (last 30 days)
        const { data: sessions } = await supabase
          .from("coaching_sessions")
          .select("status")
          .eq("client_id", cId)
          .eq("coach_id", coachProfile.id)
          .gte("scheduled_at", thirtyDaysAgo.toISOString());

        if (sessions && sessions.length > 0) {
          const attended = sessions.filter(s => s.status === "completed").length;
          const total = sessions.length;
          breakdown.sessionAttendance = Math.round((attended / total) * 100);
        } else {
          breakdown.sessionAttendance = 50; // Neutral if no sessions scheduled
        }

        // 2. Habit Completion Score (last 7 days)
        const { data: habitLogs } = await supabase
          .from("habit_logs")
          .select("completed_count, client_habits!inner(client_id, target_count)")
          .eq("client_habits.client_id", cId)
          .gte("logged_at", sevenDaysAgo.toISOString().split("T")[0]);

        if (habitLogs && habitLogs.length > 0) {
          const totalCompleted = habitLogs.reduce((sum, log) => sum + (log.completed_count || 0), 0);
          const totalTarget = habitLogs.reduce((sum, log) => {
            const habits = log.client_habits as unknown as { target_count: number };
            return sum + (habits?.target_count || 1);
          }, 0);
          breakdown.habitCompletion = totalTarget > 0 
            ? Math.min(100, Math.round((totalCompleted / totalTarget) * 100))
            : 50;
        } else {
          breakdown.habitCompletion = 50;
        }

        // 3. Message Responsiveness (average response time in last 14 days)
        const { data: messages } = await supabase
          .from("messages")
          .select("created_at, sender_id")
          .or(`sender_id.eq.${cId},receiver_id.eq.${cId}`)
          .gte("created_at", fourteenDaysAgo.toISOString())
          .order("created_at", { ascending: true });

        if (messages && messages.length > 1) {
          let responseTimes: number[] = [];
          for (let i = 1; i < messages.length; i++) {
            if (messages[i].sender_id === cId && messages[i - 1].sender_id !== cId) {
              const diff = differenceInHours(
                new Date(messages[i].created_at),
                new Date(messages[i - 1].created_at)
              );
              responseTimes.push(diff);
            }
          }
          if (responseTimes.length > 0) {
            const avgResponseHours = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
            // Score: < 2h = 100, 2-6h = 80, 6-12h = 60, 12-24h = 40, 24-48h = 20, > 48h = 10
            if (avgResponseHours < 2) breakdown.messageResponsiveness = 100;
            else if (avgResponseHours < 6) breakdown.messageResponsiveness = 80;
            else if (avgResponseHours < 12) breakdown.messageResponsiveness = 60;
            else if (avgResponseHours < 24) breakdown.messageResponsiveness = 40;
            else if (avgResponseHours < 48) breakdown.messageResponsiveness = 20;
            else breakdown.messageResponsiveness = 10;
          } else {
            breakdown.messageResponsiveness = 50;
          }
        } else {
          breakdown.messageResponsiveness = 50;
        }

        // 4. Progress Logging Score (last 14 days)
        const { count: progressCount } = await supabase
          .from("client_progress")
          .select("*", { count: "exact", head: true })
          .eq("client_id", cId)
          .gte("recorded_at", fourteenDaysAgo.toISOString());

        // Expected: at least 1 per week = 2 in 14 days
        const expectedProgress = 2;
        breakdown.progressLogging = Math.min(100, Math.round(((progressCount || 0) / expectedProgress) * 100));

        // 5. Plan Adherence Score (training log completions in last 7 days)
        const { count: trainingLogCount } = await supabase
          .from("training_logs")
          .select("*", { count: "exact", head: true })
          .eq("client_id", cId)
          .gte("logged_at", sevenDaysAgo.toISOString());

        // Expected: at least 3 workouts per week
        const expectedWorkouts = 3;
        if (trainingLogCount && trainingLogCount > 0) {
          breakdown.planAdherence = Math.min(100, Math.round((trainingLogCount / expectedWorkouts) * 100));
        } else {
          breakdown.planAdherence = 50;
        }

        // Calculate overall score
        const overallScore = Math.round(
          breakdown.sessionAttendance * SCORE_WEIGHTS.sessionAttendance +
          breakdown.habitCompletion * SCORE_WEIGHTS.habitCompletion +
          breakdown.messageResponsiveness * SCORE_WEIGHTS.messageResponsiveness +
          breakdown.progressLogging * SCORE_WEIGHTS.progressLogging +
          breakdown.planAdherence * SCORE_WEIGHTS.planAdherence
        );

        // Get previous week's score from history if exists
        const { data: previousScore } = await supabase
          .from("client_engagement_scores")
          .select("overall_score, week_over_week_change")
          .eq("client_id", cId)
          .eq("coach_id", coachProfile.id)
          .maybeSingle();

        const weekOverWeekChange = previousScore 
          ? overallScore - previousScore.overall_score 
          : 0;

        const trend: "up" | "down" | "stable" = 
          weekOverWeekChange > 5 ? "up" : weekOverWeekChange < -5 ? "down" : "stable";

        // Upsert the current score
        await supabase
          .from("client_engagement_scores")
          .upsert({
            client_id: cId,
            coach_id: coachProfile.id,
            overall_score: overallScore,
            session_attendance_score: breakdown.sessionAttendance,
            habit_completion_score: breakdown.habitCompletion,
            message_responsiveness_score: breakdown.messageResponsiveness,
            progress_logging_score: breakdown.progressLogging,
            plan_adherence_score: breakdown.planAdherence,
            week_over_week_change: weekOverWeekChange,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "client_id,coach_id",
          });

        const clientName = [profile.first_name, profile.last_name]
          .filter(Boolean)
          .join(" ") || profile.username;

        return {
          clientId: cId,
          clientName,
          avatarUrl: profile.avatar_url,
          overallScore,
          breakdown,
          weekOverWeekChange,
          trend,
          lastUpdated: now,
        };
      });

      const results = await Promise.all(engagementPromises);
      return results
        .filter((r): r is ClientEngagementData => r !== null)
        .sort((a, b) => a.overallScore - b.overallScore); // Lowest first (need attention)
    },
    enabled: !!user?.id && isFeatureEnabled("CLIENT_ENGAGEMENT_SCORING"),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
