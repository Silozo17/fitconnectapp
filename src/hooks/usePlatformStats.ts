import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PlatformStats {
  totalUsers: number;
  totalCoaches: number;
  avgRating: number;
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async (): Promise<PlatformStats> => {
      // Get admin-configured values from platform_settings
      // This is publicly accessible for stat keys only (via RLS policy)
      const { data: settings, error } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", ["stat_total_users", "stat_total_coaches", "stat_avg_rating"]);

      if (error) {
        console.error("Error fetching platform stats:", error);
        // Return defaults if there's an error
        return { totalUsers: 0, totalCoaches: 0, avgRating: 4.9 };
      }

      const settingsMap: Record<string, string> = {};
      settings?.forEach((item) => {
        settingsMap[item.key] = String(item.value ?? "");
      });

      // Use admin-configured values - these are the public-facing numbers
      // If not configured (0), we show 0 since live counts require auth
      const totalUsers = parseInt(settingsMap.stat_total_users || "0", 10);
      const totalCoaches = parseInt(settingsMap.stat_total_coaches || "0", 10);
      const avgRating = parseFloat(settingsMap.stat_avg_rating || "4.9");

      return {
        totalUsers,
        totalCoaches,
        avgRating,
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}