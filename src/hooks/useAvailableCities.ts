import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { parseLegacyLocation } from "@/lib/location-utils";

interface CityOption {
  city: string;
  region: string | null;
  country: string | null;
  coachCount: number;
}

/**
 * Fetches distinct cities where coaches are located.
 * Includes both structured Google Places data AND parsed legacy location fields.
 * Used for autocomplete suggestions in the location filter.
 */
export function useAvailableCities() {
  return useQuery({
    queryKey: ["available-cities"],
    queryFn: async (): Promise<CityOption[]> => {
      // Fetch coaches with both structured and legacy location data
      const { data, error } = await supabase
        .from("public_coach_profiles")
        .select("location_city, location_region, location_country, location")
        .order("location_city");

      if (error) throw error;

      // Aggregate by city
      const cityMap = new Map<string, CityOption>();
      
      for (const coach of data || []) {
        let city: string | null = null;
        let region: string | null = null;
        let country: string | null = null;
        
        // Prefer structured data
        if (coach.location_city) {
          city = coach.location_city;
          region = coach.location_region;
          country = coach.location_country;
        } else if (coach.location) {
          // Parse legacy location
          const parsed = parseLegacyLocation(coach.location);
          city = parsed.city;
          region = parsed.region;
          country = parsed.country;
        }
        
        if (!city) continue;
        
        const key = city.toLowerCase();
        const existing = cityMap.get(key);
        
        if (existing) {
          existing.coachCount++;
        } else {
          cityMap.set(key, {
            city,
            region,
            country,
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
