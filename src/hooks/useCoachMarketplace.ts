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
  card_image_url?: string | null;
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
  showSponsoredFirst?: boolean;
}

export const useCoachMarketplace = (options: UseCoachMarketplaceOptions = {}) => {
  const showSponsoredFirst = options.showSponsoredFirst !== false; // Default true

  return useQuery({
    queryKey: ["marketplace-coaches", options],
    queryFn: async () => {
      // First, get boosted coach IDs if showing sponsored first
      let boostedCoachIds: string[] = [];
      if (showSponsoredFirst) {
        const { data: boosts } = await supabase
          .from("coach_boosts")
          .select("coach_id")
          .eq("is_active", true);
        
        boostedCoachIds = (boosts || []).map(b => b.coach_id);
      }

      let query = supabase
        .from("coach_profiles")
        .select("*")
        .eq("onboarding_completed", true)
        .eq("marketplace_visible", true)
        .or("status.is.null,status.eq.active");

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

      // Mark sponsored coaches and sort them first
      const coaches = (data || []).map(coach => ({
        ...coach,
        is_sponsored: boostedCoachIds.includes(coach.id),
      })) as MarketplaceCoach[];

      // Sort: sponsored first (randomized among themselves), then non-sponsored
      if (showSponsoredFirst && boostedCoachIds.length > 0) {
        const sponsored = coaches.filter(c => c.is_sponsored);
        const nonSponsored = coaches.filter(c => !c.is_sponsored);
        
        // Randomize sponsored coaches for fair exposure
        for (let i = sponsored.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [sponsored[i], sponsored[j]] = [sponsored[j], sponsored[i]];
        }
        
        return [...sponsored, ...nonSponsored];
      }

      return coaches;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes - marketplace data refreshes frequently
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
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
