/**
 * Hook for fetching all discipline widget data
 */

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getDisciplineConfig } from "@/config/disciplines/catalog";
import { DisciplineWidgetData, ComputedMetric, ComputedMilestone } from "@/config/disciplines/types";
import { computeAllMetrics } from "@/services/discipline/metricResolvers";
import { getMilestone } from "@/services/discipline/milestoneResolver";
import { generateHighlight } from "@/services/discipline/highlightGenerator";
import { supabase } from "@/integrations/supabase/client";

async function fetchClientId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('client_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  
  return data?.id || null;
}

export function useDisciplineWidgetData(disciplineId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['discipline-widget', disciplineId, user?.id],
    queryFn: async (): Promise<DisciplineWidgetData | null> => {
      if (!disciplineId || !user?.id) return null;

      const config = getDisciplineConfig(disciplineId);
      if (!config) return null;

      // Get client profile ID for wearable queries
      const clientId = await fetchClientId(user.id);
      if (!clientId) return null;

      // Fetch all data in parallel
      const [metrics, milestone] = await Promise.all([
        computeAllMetrics(config.metrics, user.id, clientId, disciplineId),
        getMilestone(config.milestone, user.id, disciplineId),
      ]);

      // Generate highlight
      const highlight = generateHighlight(config.highlight, metrics);

      return {
        config,
        metrics,
        milestone,
        highlight,
        isLoading: false,
      };
    },
    enabled: !!disciplineId && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
