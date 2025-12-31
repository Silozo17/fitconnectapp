import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { subDays, differenceInDays } from "date-fns";

export type RiskLevel = "high" | "medium" | "low";

export interface ClientRiskData {
  clientId: string;
  clientName: string;
  avatarUrl: string | null;
  riskLevel: RiskLevel;
  riskScore: number; // 0-100, higher = more at risk
  riskFactors: string[];
  lastActivity: Date | null;
  daysSinceLastSession: number | null;
  daysSinceLastMessage: number | null;
  habitCompletionRate: number | null;
  suggestedAction: string;
}

interface RiskWeights {
  inactivityDays: number;
  missedSessions: number;
  lowHabitCompletion: number;
  noRecentProgress: number;
  decliningEngagement: number;
}

const RISK_WEIGHTS: RiskWeights = {
  inactivityDays: 25,
  missedSessions: 20,
  lowHabitCompletion: 20,
  noRecentProgress: 15,
  decliningEngagement: 20,
};

function calculateRiskLevel(score: number): RiskLevel {
  if (score >= 60) return "high";
  if (score >= 35) return "medium";
  return "low";
}

function getSuggestedAction(riskFactors: string[], riskLevel: RiskLevel): string {
  if (riskLevel === "high") {
    if (riskFactors.includes("No activity in 14+ days")) {
      return "Send a personal check-in message to re-engage";
    }
    if (riskFactors.includes("Multiple missed sessions")) {
      return "Schedule a call to discuss their schedule";
    }
    return "Reach out with a motivational message";
  }
  if (riskLevel === "medium") {
    if (riskFactors.includes("Low habit completion")) {
      return "Simplify their habit goals";
    }
    if (riskFactors.includes("No recent progress logged")) {
      return "Remind them to log their progress";
    }
    return "Send an encouraging check-in";
  }
  return "Keep up the great coaching!";
}

export function useClientRiskDetection() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["client-risk-detection", user?.id],
    queryFn: async (): Promise<ClientRiskData[]> => {
      if (!user?.id) return [];

      // Get coach profile
      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!coachProfile) return [];

      // Get active clients
      const { data: clients } = await supabase
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

      if (!clients || clients.length === 0) return [];

      const now = new Date();
      const fourteenDaysAgo = subDays(now, 14);
      const sevenDaysAgo = subDays(now, 7);

      const riskDataPromises = clients.map(async (client) => {
        const clientProfile = client.client_profiles;
        if (!clientProfile) return null;

        const clientId = client.client_id;
        const riskFactors: string[] = [];
        let riskScore = 0;

        // Check last session
        const { data: lastSession } = await supabase
          .from("coaching_sessions")
          .select("scheduled_at")
          .eq("client_id", clientId)
          .eq("coach_id", coachProfile.id)
          .order("scheduled_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const daysSinceLastSession = lastSession?.scheduled_at
          ? differenceInDays(now, new Date(lastSession.scheduled_at))
          : null;

        if (daysSinceLastSession !== null && daysSinceLastSession > 14) {
          riskScore += RISK_WEIGHTS.inactivityDays;
          riskFactors.push("No activity in 14+ days");
        } else if (daysSinceLastSession !== null && daysSinceLastSession > 7) {
          riskScore += RISK_WEIGHTS.inactivityDays * 0.5;
          riskFactors.push("No sessions in 7+ days");
        }

        // Check cancelled/missed sessions
        const { count: cancelledCount } = await supabase
          .from("coaching_sessions")
          .select("*", { count: "exact", head: true })
          .eq("client_id", clientId)
          .eq("coach_id", coachProfile.id)
          .in("status", ["cancelled", "no_show"])
          .gte("scheduled_at", fourteenDaysAgo.toISOString());

        if (cancelledCount && cancelledCount >= 2) {
          riskScore += RISK_WEIGHTS.missedSessions;
          riskFactors.push("Multiple missed sessions");
        }

        // Check habit completion rate (last 7 days)
        const { data: habitLogs } = await supabase
          .from("habit_logs")
          .select("completed_count, client_habits!inner(client_id, target_count)")
          .eq("client_habits.client_id", clientId)
          .gte("logged_at", sevenDaysAgo.toISOString().split("T")[0]);

        let habitCompletionRate: number | null = null;
        if (habitLogs && habitLogs.length > 0) {
          const totalCompleted = habitLogs.reduce((sum, log) => sum + (log.completed_count || 0), 0);
          const totalTarget = habitLogs.reduce((sum, log) => {
            const habits = log.client_habits as unknown as { target_count: number };
            return sum + (habits?.target_count || 1);
          }, 0);
          habitCompletionRate = totalTarget > 0 ? (totalCompleted / totalTarget) * 100 : null;

          if (habitCompletionRate !== null && habitCompletionRate < 30) {
            riskScore += RISK_WEIGHTS.lowHabitCompletion;
            riskFactors.push("Low habit completion");
          } else if (habitCompletionRate !== null && habitCompletionRate < 50) {
            riskScore += RISK_WEIGHTS.lowHabitCompletion * 0.5;
            riskFactors.push("Declining habit completion");
          }
        }

        // Check recent progress entries
        const { count: progressCount } = await supabase
          .from("client_progress")
          .select("*", { count: "exact", head: true })
          .eq("client_id", clientId)
          .gte("recorded_at", fourteenDaysAgo.toISOString());

        if (!progressCount || progressCount === 0) {
          riskScore += RISK_WEIGHTS.noRecentProgress;
          riskFactors.push("No recent progress logged");
        }

        // Check last message
        const { data: lastMessage } = await supabase
          .from("messages")
          .select("created_at")
          .or(`sender_id.eq.${clientId},receiver_id.eq.${clientId}`)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        const daysSinceLastMessage = lastMessage?.created_at
          ? differenceInDays(now, new Date(lastMessage.created_at))
          : null;

        if (daysSinceLastMessage !== null && daysSinceLastMessage > 7) {
          riskScore += RISK_WEIGHTS.decliningEngagement;
          riskFactors.push("No recent communication");
        }

        // Determine last activity
        const activityDates = [
          lastSession?.scheduled_at ? new Date(lastSession.scheduled_at) : null,
          lastMessage?.created_at ? new Date(lastMessage.created_at) : null,
        ].filter(Boolean) as Date[];

        const lastActivity = activityDates.length > 0
          ? new Date(Math.max(...activityDates.map((d) => d.getTime())))
          : null;

        const riskLevel = calculateRiskLevel(riskScore);
        const clientName = [clientProfile.first_name, clientProfile.last_name]
          .filter(Boolean)
          .join(" ") || clientProfile.username;

        return {
          clientId,
          clientName,
          avatarUrl: clientProfile.avatar_url,
          riskLevel,
          riskScore: Math.min(riskScore, 100),
          riskFactors,
          lastActivity,
          daysSinceLastSession,
          daysSinceLastMessage,
          habitCompletionRate,
          suggestedAction: getSuggestedAction(riskFactors, riskLevel),
        };
      });

      const results = await Promise.all(riskDataPromises);
      return results
        .filter((r): r is ClientRiskData => r !== null)
        .sort((a, b) => b.riskScore - a.riskScore);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
