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
      // First get admin-configured values from platform_settings
      const { data: settings } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", ["stat_total_users", "stat_total_coaches", "stat_avg_rating"]);

      const settingsMap: Record<string, string> = {};
      settings?.forEach((item) => {
        settingsMap[item.key] = String(item.value ?? "");
      });

      const configuredUsers = parseInt(settingsMap.stat_total_users || "0", 10);
      const configuredCoaches = parseInt(settingsMap.stat_total_coaches || "0", 10);
      const configuredRating = parseFloat(settingsMap.stat_avg_rating || "4.9");

      // If configured values are > 0, use them; otherwise fetch live from database
      let totalUsers = configuredUsers;
      let totalCoaches = configuredCoaches;
      let avgRating = configuredRating;

      if (configuredUsers === 0 || configuredCoaches === 0) {
        const [usersResult, coachesResult, ratingsResult] = await Promise.all([
          configuredUsers === 0 
            ? supabase.from("client_profiles").select("id", { count: "exact", head: true })
            : Promise.resolve({ count: configuredUsers }),
          configuredCoaches === 0
            ? supabase.from("coach_profiles").select("id", { count: "exact", head: true })
            : Promise.resolve({ count: configuredCoaches }),
          supabase.from("reviews").select("rating"),
        ]);

        if (configuredUsers === 0) {
          totalUsers = usersResult.count || 0;
        }
        if (configuredCoaches === 0) {
          totalCoaches = coachesResult.count || 0;
        }
        
        // Calculate average rating from reviews if available
        if (ratingsResult.data && ratingsResult.data.length > 0) {
          const sum = ratingsResult.data.reduce((acc, r) => acc + (r.rating || 0), 0);
          avgRating = sum / ratingsResult.data.length;
        }
      }

      return {
        totalUsers,
        totalCoaches,
        avgRating,
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}