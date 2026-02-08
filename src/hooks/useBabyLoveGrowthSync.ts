import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SyncLogEntry {
  id: string;
  integration_name: string;
  last_sync_at: string;
  articles_imported: number;
  status: string;
  error_message: string | null;
  created_at: string;
}

interface SyncResult {
  success: boolean;
  imported: number;
  total_fetched: number;
  new_articles: number;
  errors?: string[];
}

export const useBabyLoveGrowthSync = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch sync history
  const { data: syncHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["babylovegrowth-sync-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integration_sync_log")
        .select("*")
        .eq("integration_name", "babylovegrowth")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as SyncLogEntry[];
    },
  });

  // Get last successful sync
  const lastSuccessfulSync = syncHistory?.find(
    (entry) => entry.status === "success" || entry.status === "partial"
  );

  // Calculate total imported articles
  const { data: importedCount } = useQuery({
    queryKey: ["babylovegrowth-imported-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("blog_posts")
        .select("*", { count: "exact", head: true })
        .eq("external_source", "babylovegrowth");

      if (error) throw error;
      return count || 0;
    },
  });

  // Check if API key is configured (by checking if we have any successful syncs or trying the function)
  const { data: isConnected } = useQuery({
    queryKey: ["babylovegrowth-connection-status"],
    queryFn: async () => {
      // If we have any sync history, the API key was configured at some point
      if (syncHistory && syncHistory.length > 0) {
        const hasSuccess = syncHistory.some(
          (s) => s.status === "success" || s.status === "partial"
        );
        return hasSuccess;
      }
      return false;
    },
    enabled: !isLoadingHistory,
  });

  // Manual sync trigger
  const triggerSync = useMutation({
    mutationFn: async (): Promise<SyncResult> => {
      const { data, error } = await supabase.functions.invoke<SyncResult>(
        "sync-babylovegrowth"
      );

      if (error) throw error;
      if (!data) throw new Error("No response from sync function");

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["babylovegrowth-sync-history"] });
      queryClient.invalidateQueries({ queryKey: ["babylovegrowth-imported-count"] });
      queryClient.invalidateQueries({ queryKey: ["babylovegrowth-connection-status"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });

      if (data.imported > 0) {
        toast({
          title: "Sync Complete",
          description: `Successfully imported ${data.imported} new article${data.imported === 1 ? "" : "s"} from BabyLoveGrowth.`,
        });
      } else {
        toast({
          title: "Sync Complete",
          description: "No new articles to import.",
        });
      }
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: ["babylovegrowth-sync-history"] });
      
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    syncHistory: syncHistory || [],
    lastSync: lastSuccessfulSync?.last_sync_at,
    importedCount: importedCount || 0,
    isConnected: isConnected || false,
    isLoadingHistory,
    triggerSync,
    isSyncing: triggerSync.isPending,
  };
};
