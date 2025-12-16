import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

// Use the database type directly, with optional new fields
export type MarketplaceCoach = Tables<"coach_profiles"> & {
  rating?: number | null;
  reviews_count?: number | null;
  is_sponsored?: boolean | null;
  tags?: string[] | null;
  gym_affiliation?: string | null;
};

interface UseCoachMarketplaceOptions {
  search?: string;
  coachTypes?: string[];
  priceRange?: { min: number; max: number };
  onlineOnly?: boolean;
  inPersonOnly?: boolean;
  limit?: number;
  featured?: boolean;
  location?: string;
}

export const useCoachMarketplace = (options: UseCoachMarketplaceOptions = {}) => {
  return useQuery({
    queryKey: ["marketplace-coaches", options],
    queryFn: async () => {
      let query = supabase
        .from("coach_profiles")
        .select("*")
        .eq("onboarding_completed", true);

      // Apply filters
      if (options.search) {
        query = query.or(
          `display_name.ilike.%${options.search}%,bio.ilike.%${options.search}%,location.ilike.%${options.search}%`
        );
      }

      if (options.location) {
        query = query.ilike("location", `%${options.location}%`);
      }

      if (options.coachTypes && options.coachTypes.length > 0) {
        query = query.overlaps("coach_types", options.coachTypes);
      }

      if (options.priceRange) {
        query = query
          .gte("hourly_rate", options.priceRange.min)
          .lte("hourly_rate", options.priceRange.max);
      }

      if (options.onlineOnly) {
        query = query.eq("online_available", true);
      }

      if (options.inPersonOnly) {
        query = query.eq("in_person_available", true);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      // Default ordering by hourly_rate descending (as proxy for popularity)
      query = query.order("hourly_rate", { ascending: false, nullsFirst: false });

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as MarketplaceCoach[];
    },
  });
};

export const useCoachById = (coachId: string) => {
  return useQuery({
    queryKey: ["coach", coachId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_profiles")
        .select("*")
        .eq("id", coachId)
        .maybeSingle();

      if (error) throw error;
      return data as MarketplaceCoach | null;
    },
    enabled: !!coachId,
  });
};
