import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface CoachClientReport {
  id: string;
  coach_id: string;
  client_id: string;
  title: string;
  report_data: {
    summary?: string;
    trends?: Array<{ category: string; trend: string; detail: string }>;
    adherence?: Array<{ area: string; score: number; notes: string }>;
    risks?: Array<{ level: string; description: string }>;
    recommendations?: string[];
    photoAnalysis?: {
      hasComparison: boolean;
      visualChanges?: string;
      areasOfImprovement?: string[];
    };
    measurementsTrend?: Record<string, { change: number; trend: string }>;
    wearableInsights?: {
      avgSteps?: number;
      avgSleep?: number;
      avgActiveMinutes?: number;
      trends?: string;
    };
    suggestedNextSteps?: string[];
    generatedAt?: string;
  };
  photo_comparison?: {
    before_url?: string;
    after_url?: string;
    before_date?: string;
    after_date?: string;
    ai_analysis?: string;
  };
  measurements_comparison?: Record<string, { before: number; after: number; change: number }>;
  wearable_summary?: Record<string, any>;
  coach_notes?: string;
  status: "draft" | "finalized" | "sent";
  sent_to_client_at?: string;
  ai_disclaimer_acknowledged: boolean;
  created_at: string;
  updated_at: string;
}

// Fetch all reports for a client
export const useClientReports = (clientId: string | undefined) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["coach-client-reports", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      
      const { data, error } = await supabase
        .from("coach_client_reports")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CoachClientReport[];
    },
    enabled: !!clientId && !!user,
  });
};

// Fetch a single report
export const useClientReport = (reportId: string | undefined) => {
  return useQuery({
    queryKey: ["coach-client-report", reportId],
    queryFn: async () => {
      if (!reportId) return null;
      
      const { data, error } = await supabase
        .from("coach_client_reports")
        .select("*")
        .eq("id", reportId)
        .single();

      if (error) throw error;
      return data as CoachClientReport;
    },
    enabled: !!reportId,
  });
};

// Create a new report
export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: Omit<CoachClientReport, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("coach_client_reports")
        .insert(report)
        .select()
        .single();

      if (error) throw error;
      return data as CoachClientReport;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["coach-client-reports", data.client_id] });
      toast.success("Report saved successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to save report: ${error.message}`);
    },
  });
};

// Update an existing report
export const useUpdateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      reportId, 
      updates 
    }: { 
      reportId: string; 
      updates: Partial<CoachClientReport>; 
    }) => {
      const { data, error } = await supabase
        .from("coach_client_reports")
        .update(updates)
        .eq("id", reportId)
        .select()
        .single();

      if (error) throw error;
      return data as CoachClientReport;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["coach-client-reports", data.client_id] });
      queryClient.invalidateQueries({ queryKey: ["coach-client-report", data.id] });
      toast.success("Report updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update report: ${error.message}`);
    },
  });
};

// Delete a report
export const useDeleteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, clientId }: { reportId: string; clientId: string }) => {
      const { error } = await supabase
        .from("coach_client_reports")
        .delete()
        .eq("id", reportId);

      if (error) throw error;
      return { reportId, clientId };
    },
    onSuccess: ({ clientId }) => {
      queryClient.invalidateQueries({ queryKey: ["coach-client-reports", clientId] });
      toast.success("Report deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete report: ${error.message}`);
    },
  });
};

// Send report to client
export const useSendReportToClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, clientId }: { reportId: string; clientId: string }) => {
      const { data, error } = await supabase
        .from("coach_client_reports")
        .update({
          status: "sent",
          sent_to_client_at: new Date().toISOString(),
        })
        .eq("id", reportId)
        .select()
        .single();

      if (error) throw error;
      return data as CoachClientReport;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["coach-client-reports", data.client_id] });
      queryClient.invalidateQueries({ queryKey: ["coach-client-report", data.id] });
      toast.success("Report sent to client");
    },
    onError: (error: Error) => {
      toast.error(`Failed to send report: ${error.message}`);
    },
  });
};
