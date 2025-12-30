import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCoachProfileId } from "./useCoachProfileId";
import { toast } from "sonner";

export type SummaryType = "weekly" | "monthly" | "custom";
export type SummaryStatus = "draft" | "approved" | "shared";

export interface GeneratedContent {
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

export interface ClientSummary {
  id: string;
  clientId: string;
  coachId: string;
  version: number;
  summaryType: SummaryType;
  generatedContent: GeneratedContent;
  coachEdits: GeneratedContent | null;
  status: SummaryStatus;
  approvedAt: Date | null;
  sharedAt: Date | null;
  scheduledFor: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export function useSummaryHistory(clientId: string) {
  const { data: coachId } = useCoachProfileId();

  return useQuery({
    queryKey: ["client-summaries", coachId, clientId],
    queryFn: async (): Promise<ClientSummary[]> => {
      if (!coachId) throw new Error("No coach ID");

      const { data, error } = await supabase
        .from("client_ai_summaries")
        .select("*")
        .eq("coach_id", coachId)
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((s) => ({
        id: s.id,
        clientId: s.client_id,
        coachId: s.coach_id,
        version: s.version,
        summaryType: s.summary_type as SummaryType,
        generatedContent: s.generated_content as unknown as GeneratedContent,
        coachEdits: s.coach_edits as unknown as GeneratedContent | null,
        status: s.status as SummaryStatus,
        approvedAt: s.approved_at ? new Date(s.approved_at) : null,
        sharedAt: s.shared_at ? new Date(s.shared_at) : null,
        scheduledFor: s.scheduled_for ? new Date(s.scheduled_for) : null,
        createdAt: new Date(s.created_at),
        updatedAt: new Date(s.updated_at),
      }));
    },
    enabled: !!coachId && !!clientId,
  });
}

export function usePendingSummaries() {
  const { data: coachId } = useCoachProfileId();

  return useQuery({
    queryKey: ["pending-summaries", coachId],
    queryFn: async () => {
      if (!coachId) throw new Error("No coach ID");

      const { data, error } = await supabase
        .from("client_ai_summaries")
        .select(
          `
          *,
          client_profile:client_profiles!client_ai_summaries_client_id_fkey(
            first_name, last_name
          )
        `
        )
        .eq("coach_id", coachId)
        .eq("status", "draft")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((s: any) => ({
        id: s.id,
        clientId: s.client_id,
        clientName: `${s.client_profile?.first_name || ""} ${
          s.client_profile?.last_name || ""
        }`.trim(),
        summaryType: s.summary_type as SummaryType,
        createdAt: new Date(s.created_at),
      }));
    },
    enabled: !!coachId,
  });
}

export function useGenerateSummary() {
  const queryClient = useQueryClient();
  const { data: coachId } = useCoachProfileId();

  return useMutation({
    mutationFn: async (data: {
      clientId: string;
      summaryType?: SummaryType;
      focusAreas?: string[];
    }) => {
      if (!coachId) throw new Error("No coach ID");

      // Call edge function to generate summary
      const { data: result, error } = await supabase.functions.invoke(
        "generate-client-summary",
        {
          body: {
            clientId: data.clientId,
            summaryType: data.summaryType || "weekly",
            focusAreas: data.focusAreas,
          },
        }
      );

      if (error) throw error;

      // Get current version count
      const { data: existing } = await supabase
        .from("client_ai_summaries")
        .select("version")
        .eq("coach_id", coachId)
        .eq("client_id", data.clientId)
        .eq("summary_type", data.summaryType || "weekly")
        .order("version", { ascending: false })
        .limit(1);

      const nextVersion = (existing?.[0]?.version || 0) + 1;

      // Save to database
      const { error: insertError } = await supabase
        .from("client_ai_summaries")
        .insert({
          client_id: data.clientId,
          coach_id: coachId,
          version: nextVersion,
          summary_type: data.summaryType || "weekly",
          generated_content: result.summary,
          status: "draft",
        });

      if (insertError) throw insertError;

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["pending-summaries"] });
      toast.success("Summary generated successfully");
    },
    onError: (error) => {
      console.error("Summary generation error:", error);
      toast.error("Failed to generate summary");
    },
  });
}

export function useUpdateSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      summaryId: string;
      coachEdits: GeneratedContent;
    }) => {
      const { error } = await supabase
        .from("client_ai_summaries")
        .update({
          coach_edits: JSON.parse(JSON.stringify(data.coachEdits)),
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.summaryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-summaries"] });
      toast.success("Summary updated");
    },
    onError: () => {
      toast.error("Failed to update summary");
    },
  });
}

export function useApproveSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (summaryId: string) => {
      const { error } = await supabase
        .from("client_ai_summaries")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", summaryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["pending-summaries"] });
      toast.success("Summary approved");
    },
    onError: () => {
      toast.error("Failed to approve summary");
    },
  });
}

export function useShareSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (summaryId: string) => {
      const { error } = await supabase
        .from("client_ai_summaries")
        .update({
          status: "shared",
          shared_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", summaryId);

      if (error) throw error;

      // TODO: Send notification to client
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["pending-summaries"] });
      toast.success("Summary shared with client");
    },
    onError: () => {
      toast.error("Failed to share summary");
    },
  });
}

export function useScheduleSummary() {
  const queryClient = useQueryClient();
  const { data: coachId } = useCoachProfileId();

  return useMutation({
    mutationFn: async (data: {
      clientId: string;
      summaryType: SummaryType;
      scheduledFor: Date;
    }) => {
      if (!coachId) throw new Error("No coach ID");

      // Create a placeholder for scheduled generation
      const { error } = await supabase.from("client_ai_summaries").insert({
        client_id: data.clientId,
        coach_id: coachId,
        version: 0, // Will be updated when actually generated
        summary_type: data.summaryType,
        generated_content: { pending: true },
        status: "draft",
        scheduled_for: data.scheduledFor.toISOString(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-summaries"] });
      toast.success("Summary generation scheduled");
    },
    onError: () => {
      toast.error("Failed to schedule summary");
    },
  });
}

export function useDeleteSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (summaryId: string) => {
      const { error } = await supabase
        .from("client_ai_summaries")
        .delete()
        .eq("id", summaryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["pending-summaries"] });
      toast.success("Summary deleted");
    },
    onError: () => {
      toast.error("Failed to delete summary");
    },
  });
}
