import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCoachProfileId } from "./useCoachProfileId";
import { addDays, differenceInDays } from "date-fns";
import { toast } from "sonner";

export type SuggestionType = "renewal" | "upgrade" | "addon" | "new_package";
export type SuggestionPriority = "high" | "normal" | "low";
export type SuggestionOutcome = "accepted" | "dismissed" | "expired";

export interface UpsellSuggestion {
  id: string;
  clientId: string;
  clientName: string;
  suggestionType: SuggestionType;
  packageId: string | null;
  packageName: string | null;
  reason: string;
  priority: SuggestionPriority;
  suggestedAt: Date;
  outcome: SuggestionOutcome | null;
  outcomeAt: Date | null;
}

export interface UpsellOpportunity {
  clientId: string;
  clientName: string;
  suggestionType: SuggestionType;
  suggestedPackageId: string | null;
  suggestedPackageName: string | null;
  reason: string;
  priority: SuggestionPriority;
  engagementScore: number | null;
}

export function useUpsellOpportunities() {
  const { data: coachId } = useCoachProfileId();

  return useQuery({
    queryKey: ["upsell-opportunities", coachId],
    queryFn: async (): Promise<UpsellOpportunity[]> => {
      if (!coachId) throw new Error("No coach ID");

      const opportunities: UpsellOpportunity[] = [];

      // Get active clients with their engagement scores
      const { data: clients, error: clientsError } = await supabase
        .from("coach_clients")
        .select(
          `
          client_id,
          start_date,
          client_profile:client_profiles!coach_clients_client_id_fkey(
            id, first_name, last_name, fitness_goals
          )
        `
        )
        .eq("coach_id", coachId)
        .eq("status", "active");

      if (clientsError) throw clientsError;

      // Get engagement scores
      const { data: engagementScores } = await supabase
        .from("client_engagement_scores")
        .select("client_id, overall_score")
        .eq("coach_id", coachId);

      const scoreMap = new Map(
        (engagementScores || []).map((s) => [s.client_id, s.overall_score])
      );

      // Get active packages for clients
      const { data: activePurchases } = await supabase
        .from("client_package_purchases")
        .select("*")
        .eq("coach_id", coachId)
        .eq("status", "active");

      // Get all available packages
      const { data: packages } = await supabase
        .from("coach_packages")
        .select("id, name, session_count, price, is_active")
        .eq("coach_id", coachId)
        .eq("is_active", true);

      // Get existing upsell suggestions to avoid duplicates
      const { data: existingSuggestions } = await supabase
        .from("upsell_suggestions")
        .select("client_id, suggestion_type")
        .eq("coach_id", coachId)
        .is("outcome", null);

      const existingSet = new Set(
        (existingSuggestions || []).map(
          (s) => `${s.client_id}-${s.suggestion_type}`
        )
      );

      for (const client of clients || []) {
        const clientProfile = client.client_profile as any;
        if (!clientProfile) continue;

        const clientName = `${clientProfile.first_name || ""} ${
          clientProfile.last_name || ""
        }`.trim();
        const engagementScore = scoreMap.get(client.client_id) || null;
        const clientActivePurchase = (activePurchases || []).find(
          (p) => p.client_id === client.client_id
        );
        const daysSinceStart = client.start_date
          ? differenceInDays(new Date(), new Date(client.start_date))
          : 0;

        // Rule 1: Renewal Reminder
        // Package expires in 7 days + engagement score > 60
        if (clientActivePurchase?.expires_at) {
          const daysUntilExpiry = differenceInDays(
            new Date(clientActivePurchase.expires_at),
            new Date()
          );
          if (
            daysUntilExpiry <= 7 &&
            daysUntilExpiry > 0 &&
            (engagementScore || 0) > 60
          ) {
            const key = `${client.client_id}-renewal`;
            if (!existingSet.has(key)) {
              const pkg = (packages || []).find(
                (p) => p.id === clientActivePurchase.package_id
              );
              opportunities.push({
                clientId: client.client_id,
                clientName,
                suggestionType: "renewal",
                suggestedPackageId: clientActivePurchase.package_id,
                suggestedPackageName: pkg?.name || "Current package",
                reason: `Package expires in ${daysUntilExpiry} days with high engagement`,
                priority: (engagementScore || 0) > 80 ? "high" : "normal",
                engagementScore,
              });
            }
          }
        }

        // Rule 2: Upgrade Suggestion
        // High engagement (>75) + on basic plan (cheapest) + 30+ days active
        if (
          (engagementScore || 0) > 75 &&
          daysSinceStart >= 30 &&
          clientActivePurchase
        ) {
          const currentPackage = (packages || []).find(
            (p) => p.id === clientActivePurchase.package_id
          );
          const higherPackages = (packages || []).filter(
            (p) => p.price > (currentPackage?.price || 0)
          );

          if (higherPackages.length > 0) {
            const key = `${client.client_id}-upgrade`;
            if (!existingSet.has(key)) {
              const suggestedPkg = higherPackages[0]; // Suggest next tier
              opportunities.push({
                clientId: client.client_id,
                clientName,
                suggestionType: "upgrade",
                suggestedPackageId: suggestedPkg.id,
                suggestedPackageName: suggestedPkg.name,
                reason: `High engagement client on basic plan for 30+ days`,
                priority: "normal",
                engagementScore,
              });
            }
          }
        }

        // Rule 3: Add-on Suggestion
        // Training client + goals include weight loss + no nutrition-related package
        const goals = (clientProfile.fitness_goals as string[]) || [];
        const hasWeightGoal = goals.some(
          (g) =>
            g.toLowerCase().includes("weight") ||
            g.toLowerCase().includes("fat")
        );

        if (hasWeightGoal && clientActivePurchase) {
          const nutritionPackages = (packages || []).filter(
            (p) =>
              p.name.toLowerCase().includes("nutrition") ||
              p.name.toLowerCase().includes("diet") ||
              p.name.toLowerCase().includes("meal")
          );

          if (nutritionPackages.length > 0) {
            const key = `${client.client_id}-addon`;
            if (!existingSet.has(key)) {
              opportunities.push({
                clientId: client.client_id,
                clientName,
                suggestionType: "addon",
                suggestedPackageId: nutritionPackages[0].id,
                suggestedPackageName: nutritionPackages[0].name,
                reason: `Client has weight goals but no nutrition package`,
                priority: "low",
                engagementScore,
              });
            }
          }
        }
      }

      // Sort by priority
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return opportunities.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );
    },
    enabled: !!coachId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSuggestionHistory(clientId?: string) {
  const { data: coachId } = useCoachProfileId();

  return useQuery({
    queryKey: ["upsell-suggestion-history", coachId, clientId],
    queryFn: async (): Promise<UpsellSuggestion[]> => {
      if (!coachId) throw new Error("No coach ID");

      let query = supabase
        .from("upsell_suggestions")
        .select(
          `
          *,
          client_profile:client_profiles!upsell_suggestions_client_id_fkey(
            first_name, last_name
          ),
          package:coach_packages!upsell_suggestions_package_id_fkey(
            name
          )
        `
        )
        .eq("coach_id", coachId)
        .order("suggested_at", { ascending: false });

      if (clientId) {
        query = query.eq("client_id", clientId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((s: any) => ({
        id: s.id,
        clientId: s.client_id,
        clientName: `${s.client_profile?.first_name || ""} ${
          s.client_profile?.last_name || ""
        }`.trim(),
        suggestionType: s.suggestion_type as SuggestionType,
        packageId: s.package_id,
        packageName: s.package?.name || null,
        reason: s.reason,
        priority: s.priority as SuggestionPriority,
        suggestedAt: new Date(s.suggested_at),
        outcome: s.outcome as SuggestionOutcome | null,
        outcomeAt: s.outcome_at ? new Date(s.outcome_at) : null,
      }));
    },
    enabled: !!coachId,
  });
}

export function useCreateSuggestion() {
  const queryClient = useQueryClient();
  const { data: coachId } = useCoachProfileId();

  return useMutation({
    mutationFn: async (data: {
      clientId: string;
      suggestionType: SuggestionType;
      packageId?: string;
      reason: string;
      priority?: SuggestionPriority;
    }) => {
      if (!coachId) throw new Error("No coach ID");

      const { error } = await supabase.from("upsell_suggestions").insert({
        client_id: data.clientId,
        coach_id: coachId,
        suggestion_type: data.suggestionType,
        package_id: data.packageId,
        reason: data.reason,
        priority: data.priority || "normal",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upsell-opportunities"] });
      queryClient.invalidateQueries({
        queryKey: ["upsell-suggestion-history"],
      });
      toast.success("Suggestion created");
    },
    onError: () => {
      toast.error("Failed to create suggestion");
    },
  });
}

export function useUpdateSuggestionOutcome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      suggestionId: string;
      outcome: SuggestionOutcome;
      convertedPurchaseId?: string;
    }) => {
      const { error } = await supabase
        .from("upsell_suggestions")
        .update({
          outcome: data.outcome,
          outcome_at: new Date().toISOString(),
          converted_purchase_id: data.convertedPurchaseId,
        })
        .eq("id", data.suggestionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upsell-opportunities"] });
      queryClient.invalidateQueries({
        queryKey: ["upsell-suggestion-history"],
      });
    },
    onError: () => {
      toast.error("Failed to update suggestion");
    },
  });
}
