import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCoachProfileId } from "./useCoachProfileId";

export type UpsellType = "package_upgrade" | "add_nutrition" | "extend_sessions" | "premium_feature";
export type UpsellStatus = "pending" | "accepted" | "dismissed";
export type ConfidenceLevel = "high" | "medium" | "low";

export interface UpsellSuggestion {
  id: string;
  clientId: string;
  clientName: string;
  suggestionType: UpsellType;
  reason: string;
  suggestedProduct: string | null;
  suggestedValue: number | null;
  confidence: ConfidenceLevel;
  status: UpsellStatus;
  createdAt: Date;
}

export function useUpsellInsights() {
  const { data: coachId } = useCoachProfileId();

  return useQuery({
    queryKey: ["upsell-insights", coachId],
    queryFn: async (): Promise<UpsellSuggestion[]> => {
      if (!coachId) throw new Error("No coach ID");

      // For now, return mock data - in production this would come from an AI analysis
      // or a dedicated upsell_suggestions table
      return [];
    },
    enabled: !!coachId,
    staleTime: 1000 * 60 * 10,
  });
}