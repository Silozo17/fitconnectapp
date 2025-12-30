import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCoachProfileId } from "./useCoachProfileId";
import { subWeeks, startOfWeek, differenceInWeeks } from "date-fns";
import { toast } from "sonner";

export type PlateauMetricType = "weight" | "strength" | "cardio";

export interface PlateauDetection {
  clientId: string;
  clientName: string;
  metricType: PlateauMetricType;
  startDate: Date;
  durationWeeks: number;
  baselineValue: number;
  currentValue: number;
  changePercentage: number;
  isActive: boolean;
  severity: "mild" | "moderate" | "severe";
}

export interface PlateauHistory {
  id: string;
  clientId: string;
  metricType: PlateauMetricType;
  detectedAt: Date;
  startDate: Date;
  endDate: Date | null;
  durationWeeks: number | null;
  baselineValue: number | null;
  currentValue: number | null;
  changePercentage: number | null;
  isManual: boolean;
  coachNotes: string | null;
  breakthroughAt: Date | null;
}

// Thresholds for plateau detection
const THRESHOLDS = {
  weight: { changePercent: 0.5, minWeeks: 3 },
  strength: { changePercent: 2, minWeeks: 4 },
  cardio: { changePercent: 3, minWeeks: 3 },
};

function calculateLinearRegression(data: { x: number; y: number }[]): {
  slope: number;
  rSquared: number;
} {
  if (data.length < 2) return { slope: 0, rSquared: 0 };

  const n = data.length;
  const sumX = data.reduce((s, d) => s + d.x, 0);
  const sumY = data.reduce((s, d) => s + d.y, 0);
  const sumXY = data.reduce((s, d) => s + d.x * d.y, 0);
  const sumX2 = data.reduce((s, d) => s + d.x * d.x, 0);
  const sumY2 = data.reduce((s, d) => s + d.y * d.y, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const meanY = sumY / n;

  // Calculate R-squared
  const predictedY = data.map((d) => (slope * d.x + (sumY - slope * sumX)) / n);
  const ssRes = data.reduce(
    (s, d, i) => s + Math.pow(d.y - predictedY[i], 2),
    0
  );
  const ssTot = data.reduce((s, d) => s + Math.pow(d.y - meanY, 2), 0);
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  return { slope, rSquared };
}

function getSeverity(
  durationWeeks: number,
  metricType: PlateauMetricType
): "mild" | "moderate" | "severe" {
  const minWeeks = THRESHOLDS[metricType].minWeeks;
  if (durationWeeks < minWeeks + 2) return "mild";
  if (durationWeeks < minWeeks + 4) return "moderate";
  return "severe";
}

export function usePlateauDetection() {
  const { data: coachId } = useCoachProfileId();

  return useQuery({
    queryKey: ["plateau-detection", coachId],
    queryFn: async (): Promise<PlateauDetection[]> => {
      if (!coachId) throw new Error("No coach ID");

      // Get all active clients
      const { data: clients, error: clientsError } = await supabase
        .from("coach_clients")
        .select(
          `
          client_id,
          client_profile:client_profiles!coach_clients_client_id_fkey(
            id, first_name, last_name
          )
        `
        )
        .eq("coach_id", coachId)
        .eq("status", "active");

      if (clientsError) throw clientsError;

      const plateaus: PlateauDetection[] = [];
      const lookbackWeeks = 8;
      const startDate = subWeeks(new Date(), lookbackWeeks);

      for (const client of clients || []) {
        const clientProfile = client.client_profile as any;
        if (!clientProfile) continue;

        const clientName = `${clientProfile.first_name || ""} ${
          clientProfile.last_name || ""
        }`.trim();

        // Fetch weight progress
        const { data: progressData } = await supabase
          .from("client_progress")
          .select("recorded_at, weight_kg")
          .eq("client_id", client.client_id)
          .gte("recorded_at", startDate.toISOString())
          .order("recorded_at", { ascending: true });

        // Check for weight plateau
        if (progressData && progressData.length >= 3) {
          const weightData = progressData
            .filter((p) => p.weight_kg !== null)
            .map((p, i) => ({
              x: i,
              y: p.weight_kg!,
              date: new Date(p.recorded_at),
            }));

          if (weightData.length >= 3) {
            const { slope, rSquared } = calculateLinearRegression(
              weightData.map((d) => ({ x: d.x, y: d.y }))
            );

            const firstValue = weightData[0].y;
            const lastValue = weightData[weightData.length - 1].y;
            const changePercent = Math.abs(
              ((lastValue - firstValue) / firstValue) * 100
            );
            const durationWeeks = differenceInWeeks(
              new Date(),
              weightData[0].date
            );

            // Plateau if: small change, high R-squared (flat line), sufficient duration
            if (
              changePercent < THRESHOLDS.weight.changePercent &&
              rSquared > 0.7 &&
              durationWeeks >= THRESHOLDS.weight.minWeeks
            ) {
              plateaus.push({
                clientId: client.client_id,
                clientName,
                metricType: "weight",
                startDate: weightData[0].date,
                durationWeeks,
                baselineValue: firstValue,
                currentValue: lastValue,
                changePercentage: changePercent,
                isActive: true,
                severity: getSeverity(durationWeeks, "weight"),
              });
            }
          }
        }

        // TODO: Add strength and cardio plateau detection when training_log_exercises is available
      }

      return plateaus;
    },
    enabled: !!coachId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function usePlateauHistory(clientId?: string) {
  const { data: coachId } = useCoachProfileId();

  return useQuery({
    queryKey: ["plateau-history", coachId, clientId],
    queryFn: async (): Promise<PlateauHistory[]> => {
      if (!coachId) throw new Error("No coach ID");

      let query = supabase
        .from("plateau_history")
        .select("*")
        .eq("coach_id", coachId)
        .order("detected_at", { ascending: false });

      if (clientId) {
        query = query.eq("client_id", clientId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((p) => ({
        id: p.id,
        clientId: p.client_id,
        metricType: p.metric_type as PlateauMetricType,
        detectedAt: new Date(p.detected_at),
        startDate: new Date(p.start_date),
        endDate: p.end_date ? new Date(p.end_date) : null,
        durationWeeks: p.duration_weeks,
        baselineValue: p.baseline_value,
        currentValue: p.current_value,
        changePercentage: p.change_percentage,
        isManual: p.is_manual || false,
        coachNotes: p.coach_notes,
        breakthroughAt: p.breakthrough_at ? new Date(p.breakthrough_at) : null,
      }));
    },
    enabled: !!coachId,
  });
}

export function useMarkPlateau() {
  const queryClient = useQueryClient();
  const { data: coachId } = useCoachProfileId();

  return useMutation({
    mutationFn: async (data: {
      clientId: string;
      metricType: PlateauMetricType;
      startDate: Date;
      notes?: string;
    }) => {
      if (!coachId) throw new Error("No coach ID");

      const { error } = await supabase.from("plateau_history").insert({
        client_id: data.clientId,
        coach_id: coachId,
        metric_type: data.metricType,
        start_date: data.startDate.toISOString().split("T")[0],
        is_manual: true,
        coach_notes: data.notes,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plateau-history"] });
      toast.success("Plateau marked successfully");
    },
    onError: () => {
      toast.error("Failed to mark plateau");
    },
  });
}

export function useMarkBreakthrough() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plateauId: string) => {
      const { error } = await supabase
        .from("plateau_history")
        .update({
          breakthrough_at: new Date().toISOString(),
          end_date: new Date().toISOString().split("T")[0],
        })
        .eq("id", plateauId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plateau-history"] });
      queryClient.invalidateQueries({ queryKey: ["plateau-detection"] });
      toast.success("Breakthrough recorded! 🎉");
    },
    onError: () => {
      toast.error("Failed to record breakthrough");
    },
  });
}
