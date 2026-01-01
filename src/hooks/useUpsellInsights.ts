import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCoachProfileId } from "./useCoachProfileId";

// Re-export types from useUpsellOpportunities for consistency
export type { SuggestionType, SuggestionPriority, SuggestionOutcome } from "./useUpsellOpportunities";
export { useCreateSuggestion, useUpdateSuggestionOutcome, useSuggestionHistory } from "./useUpsellOpportunities";

export type UpsellStatus = "pending" | "accepted" | "dismissed";

export interface UpsellSuggestion {
  id: string;
  clientId: string;
  clientName: string;
  suggestionType: string;
  reason: string;
  suggestedProduct: string | null;
  suggestedValue: number | null;
  priority: "high" | "normal" | "low";
  status: UpsellStatus;
  createdAt: Date;
}

export function useUpsellInsights(clientId?: string) {
  const { data: coachId } = useCoachProfileId();

  return useQuery({
    queryKey: ["upsell-insights", coachId, clientId],
    queryFn: async (): Promise<UpsellSuggestion[]> => {
      if (!coachId) throw new Error("No coach ID");

      let query = supabase
        .from("upsell_suggestions")
        .select(`
          id,
          client_id,
          suggestion_type,
          reason,
          priority,
          outcome,
          suggested_at,
          package_id,
          client_profile:client_profiles!upsell_suggestions_client_id_fkey(
            first_name, last_name
          ),
          package:coach_packages!upsell_suggestions_package_id_fkey(
            name, price
          )
        `)
        .eq("coach_id", coachId)
        .order("suggested_at", { ascending: false });

      if (clientId) {
        query = query.eq("client_id", clientId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((s: any) => {
        // Map outcome to status
        let status: UpsellStatus = "pending";
        if (s.outcome === "accepted") status = "accepted";
        else if (s.outcome === "dismissed") status = "dismissed";

        return {
          id: s.id,
          clientId: s.client_id,
          clientName: `${s.client_profile?.first_name || ""} ${s.client_profile?.last_name || ""}`.trim() || "Unknown",
          suggestionType: s.suggestion_type,
          reason: s.reason,
          suggestedProduct: s.package?.name || null,
          suggestedValue: s.package?.price || null,
          priority: s.priority || "normal",
          status,
          createdAt: new Date(s.suggested_at),
        };
      });
    },
    enabled: !!coachId,
    staleTime: 1000 * 60 * 5,
  });
}
