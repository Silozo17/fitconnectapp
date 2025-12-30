import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { subWeeks, addDays, differenceInDays } from "date-fns";
import { isFeatureEnabled } from "@/lib/coach-feature-flags";
import { useClientRiskDetection, type RiskLevel } from "./useClientRiskDetection";

export type Trajectory = "improving" | "stable" | "declining" | "critical";

export interface EnhancedChurnData {
  clientId: string;
  clientName: string;
  avatarUrl: string | null;
  riskLevel: RiskLevel;
  riskScore: number;
  riskFactors: string[];
  trajectory: Trajectory;
  trajectoryConfidence: number; // 0-100
  predictedChurnDate: Date | null;
  daysUntilChurn: number | null;
  weeklyScores: number[]; // Last 4 weeks
  suggestedAction: string;
  urgency: "immediate" | "soon" | "monitor";
}

function calculateTrajectory(weeklyScores: number[]): { trajectory: Trajectory; confidence: number } {
  if (weeklyScores.length < 2) {
    return { trajectory: "stable", confidence: 30 };
  }

  // Calculate trend using simple linear regression slope
  const n = weeklyScores.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = weeklyScores.reduce((a, b) => a + b, 0);
  const sumXY = weeklyScores.reduce((sum, score, i) => sum + i * score, 0);
  const sumX2 = weeklyScores.reduce((sum, _, i) => sum + i * i, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  
  // Confidence based on data points and consistency
  const avgScore = sumY / n;
  const variance = weeklyScores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / n;
  const consistency = Math.max(0, 100 - Math.sqrt(variance));
  const confidence = Math.min(100, Math.round((n / 4) * 25 + consistency * 0.5));

  if (slope < -5) return { trajectory: "critical", confidence };
  if (slope < -2) return { trajectory: "declining", confidence };
  if (slope > 5) return { trajectory: "improving", confidence };
  return { trajectory: "stable", confidence };
}

function predictChurnDate(riskScore: number, trajectory: Trajectory): { date: Date | null; days: number | null } {
  // High risk with declining trajectory = imminent
  // Base prediction on current risk score and trajectory
  if (riskScore < 35) return { date: null, days: null };

  let baseDays: number;
  
  switch (trajectory) {
    case "critical":
      baseDays = 7;
      break;
    case "declining":
      baseDays = 21;
      break;
    case "stable":
      baseDays = 45;
      break;
    case "improving":
      return { date: null, days: null }; // Unlikely to churn
  }

  // Adjust based on risk score
  const riskMultiplier = 1 - ((riskScore - 35) / 130); // Higher risk = shorter time
  const adjustedDays = Math.round(baseDays * Math.max(0.5, riskMultiplier));
  
  const predictedDate = addDays(new Date(), adjustedDays);
  return { date: predictedDate, days: adjustedDays };
}

function getUrgency(daysUntilChurn: number | null, riskLevel: RiskLevel): "immediate" | "soon" | "monitor" {
  if (daysUntilChurn !== null && daysUntilChurn <= 7) return "immediate";
  if (daysUntilChurn !== null && daysUntilChurn <= 21) return "soon";
  if (riskLevel === "high") return "soon";
  return "monitor";
}

export function useEnhancedChurnPrediction() {
  const { user } = useAuth();
  const { data: baseRiskData } = useClientRiskDetection();

  return useQuery({
    queryKey: ["enhanced-churn-prediction", user?.id],
    queryFn: async (): Promise<EnhancedChurnData[]> => {
      if (!user?.id || !baseRiskData || !isFeatureEnabled("ENHANCED_CHURN_PREDICTION")) {
        return [];
      }

      // Get coach profile
      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!coachProfile) return [];

      const enhancedDataPromises = baseRiskData.map(async (client) => {
        // Get historical engagement scores (last 4 weeks)
        const fourWeeksAgo = subWeeks(new Date(), 4);
        
        const { data: history } = await supabase
          .from("client_engagement_history")
          .select("engagement_score, week_start")
          .eq("client_id", client.clientId)
          .eq("coach_id", coachProfile.id)
          .gte("week_start", fourWeeksAgo.toISOString().split("T")[0])
          .order("week_start", { ascending: true });

        // Calculate weekly scores (inverse of risk for engagement perspective)
        let weeklyScores: number[] = [];
        if (history && history.length > 0) {
          weeklyScores = history.map(h => h.engagement_score);
        } else {
          // Use current risk score as baseline if no history
          weeklyScores = [100 - client.riskScore];
        }

        const { trajectory, confidence } = calculateTrajectory(weeklyScores);
        const { date: predictedChurnDate, days: daysUntilChurn } = predictChurnDate(
          client.riskScore,
          trajectory
        );

        const urgency = getUrgency(daysUntilChurn, client.riskLevel);

        return {
          clientId: client.clientId,
          clientName: client.clientName,
          avatarUrl: client.avatarUrl,
          riskLevel: client.riskLevel,
          riskScore: client.riskScore,
          riskFactors: client.riskFactors,
          trajectory,
          trajectoryConfidence: confidence,
          predictedChurnDate,
          daysUntilChurn,
          weeklyScores,
          suggestedAction: client.suggestedAction,
          urgency,
        };
      });

      const results = await Promise.all(enhancedDataPromises);
      
      // Sort by urgency then risk score
      return results.sort((a, b) => {
        const urgencyOrder = { immediate: 0, soon: 1, monitor: 2 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        }
        return b.riskScore - a.riskScore;
      });
    },
    enabled: !!user?.id && !!baseRiskData && isFeatureEnabled("ENHANCED_CHURN_PREDICTION"),
    staleTime: 5 * 60 * 1000,
  });
}
