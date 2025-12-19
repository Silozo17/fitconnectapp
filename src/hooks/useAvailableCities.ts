import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CityOption {
  city: string;
  region: string | null;
  country: string | null;
  coachCount: number;
}

/**
 * Fetches distinct cities where coaches are located.
 * Used for autocomplete suggestions in the location filter.
 */
export function useAvailableCities() {
  return useQuery({
    queryKey: ["available-cities"],
    queryFn: async (): Promise<CityOption[]> => {
      // Fetch coaches with location data and count per city
      const { data, error } = await supabase
        .from("public_coach_profiles")
        .select("location_city, location_region, location_country")
        .not("location_city", "is", null)
        .order("location_city");

      if (error) throw error;

      // Aggregate by city
      const cityMap = new Map<string, CityOption>();
      
      for (const coach of data || []) {
        if (!coach.location_city) continue;
        
        const key = coach.location_city.toLowerCase();
        const existing = cityMap.get(key);
        
        if (existing) {
          existing.coachCount++;
        } else {
          cityMap.set(key, {
            city: coach.location_city,
            region: coach.location_region,
            country: coach.location_country,
            coachCount: 1,
          });
        }
      }

      // Sort by coach count (most coaches first), then alphabetically
      return Array.from(cityMap.values()).sort((a, b) => {
        if (b.coachCount !== a.coachCount) {
          return b.coachCount - a.coachCount;
        }
        return a.city.localeCompare(b.city);
      });
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
