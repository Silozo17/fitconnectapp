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
      const [usersResult, coachesResult, ratingsResult] = await Promise.all([
        supabase.from("client_profiles").select("id", { count: "exact", head: true }),
        supabase.from("coach_profiles").select("id", { count: "exact", head: true }),
        supabase.from("reviews").select("rating"),
      ]);

      const totalUsers = usersResult.count || 0;
      const totalCoaches = coachesResult.count || 0;
      
      // Calculate average rating
      let avgRating = 4.9; // Default fallback
      if (ratingsResult.data && ratingsResult.data.length > 0) {
        const sum = ratingsResult.data.reduce((acc, r) => acc + (r.rating || 0), 0);
        avgRating = sum / ratingsResult.data.length;
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
