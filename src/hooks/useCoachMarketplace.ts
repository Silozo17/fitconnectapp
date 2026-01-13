/**
 * Hook for fetching coaches for the marketplace (/coaches and /dashboard/client/find-coaches)
 * 
 * STABILISED VERSION: Uses minimal get_simple_coaches(country, limit) function.
 * No ranking, no boosting, no scoring.
 */
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

// Minimal coach type matching the RPC return + placeholders for UI
export type MarketplaceCoach = {
  id: string;
  username: string | null;
  display_name: string | null;
  profile_image_url: string | null;
  location_country: string | null;
  location_country_code: string | null;
  created_at: string;
  // Optional fields for backwards compatibility - will be null
  bio?: string | null;
  coach_types?: string[] | null;
  certifications?: unknown | null;
  experience_years?: number | null;
  hourly_rate?: number | null;
  currency?: string | null;
  location?: string | null;
  location_city?: string | null;
  location_region?: string | null;
  online_available?: boolean | null;
  in_person_available?: boolean | null;
  card_image_url?: string | null;
  booking_mode?: string | null;
  is_verified?: boolean | null;
  verified_at?: string | null;
  gym_affiliation?: string | null;
  marketplace_visible?: boolean | null;
  selected_avatar_id?: string | null;
  onboarding_completed?: boolean;
  who_i_work_with?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  x_url?: string | null;
  threads_url?: string | null;
  linkedin_url?: string | null;
  youtube_url?: string | null;
  avatars?: {
    slug: string;
    rarity: string;
    image_url: string | null;
  } | null;
  rating?: number | null;
  avg_rating?: number | null;
  reviews_count?: number | null;
  review_count?: number | null;
  is_sponsored?: boolean | null;
  tags?: string[] | null;
  verified_qualification_count?: number;
};

export interface UseCoachMarketplaceOptions {
  /** Filter coaches by country code (e.g., 'gb', 'pl') - STRICT filter, case insensitive */
  countryCode?: string;
  /** Maximum number of coaches to return */
  limit?: number;
  /** Whether the query should execute (default: true) */
  enabled?: boolean;
  // TEMPORARILY ACCEPTED BUT IGNORED - will be re-added after stabilisation
  search?: string;
  coachTypes?: string[];
  priceRange?: { min: number; max: number };
  onlineOnly?: boolean;
  inPersonOnly?: boolean;
}

export interface UseCoachMarketplaceResult {
  data: MarketplaceCoach[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

const EMPTY_RESULT: MarketplaceCoach[] = [];

export const useCoachMarketplace = (options: UseCoachMarketplaceOptions = {}): UseCoachMarketplaceResult => {
  const queryKey = useMemo(() => [
    "marketplace-coaches-stable",
    options.countryCode || null,
    options.limit || 50,
  ], [options.countryCode, options.limit]);
  
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      // Call the minimal 2-parameter function
      const { data, error } = await supabase.rpc('get_simple_coaches', {
        p_filter_country_code: options.countryCode || null,
        p_limit: options.limit || 50,
      });

      if (error) {
        console.error('[useCoachMarketplace] RPC error:', error);
        throw error;
      }

      // Map RPC results - only 7 fields returned, rest are null/defaults
      const coaches: MarketplaceCoach[] = (data || []).map((row: any) => ({
        id: row.id,
        username: row.username,
        display_name: row.display_name,
        profile_image_url: row.profile_image_url,
        location_country: row.location_country,
        location_country_code: row.location_country_code,
        created_at: row.created_at,
        // All other fields are null/defaults for now
        bio: null,
        coach_types: null,
        certifications: null,
        experience_years: null,
        hourly_rate: null,
        currency: null,
        location: null,
        location_city: null,
        location_region: null,
        online_available: null,
        in_person_available: null,
        card_image_url: null,
        booking_mode: null,
        is_verified: null,
        verified_at: null,
        gym_affiliation: null,
        marketplace_visible: true,
        selected_avatar_id: null,
        onboarding_completed: true,
        who_i_work_with: null,
        facebook_url: null,
        instagram_url: null,
        tiktok_url: null,
        x_url: null,
        threads_url: null,
        linkedin_url: null,
        youtube_url: null,
        avatars: null,
        is_sponsored: false,
        rating: null,
        avg_rating: null,
        reviews_count: null,
        review_count: null,
        verified_qualification_count: 0,
        tags: null,
      }));

      return coaches;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: options.enabled !== false,
    placeholderData: EMPTY_RESULT,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error ?? null,
  };
};

export const useCoachById = (identifier: string) => {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

  return useQuery({
    queryKey: ["coach", identifier],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const filterColumn = isUUID ? "id" : "username";
      
      if (session) {
        const { data, error } = await supabase
          .from("coach_profiles")
          .select(`
            id, username, display_name, bio, coach_types, certifications,
            experience_years, hourly_rate, currency, location,
            location_city, location_region, location_country,
            online_available, in_person_available, profile_image_url,
            card_image_url, booking_mode, is_verified, verified_at,
            gym_affiliation, marketplace_visible, selected_avatar_id,
            created_at, onboarding_completed, who_i_work_with,
            facebook_url, instagram_url, tiktok_url, x_url,
            threads_url, linkedin_url, youtube_url,
            avatars(slug, rarity, image_url)
          `)
          .eq(filterColumn, identifier)
          .maybeSingle();

        if (error) throw error;
        return (data as unknown as MarketplaceCoach) || null;
      } else {
        const { data, error } = await supabase
          .from("public_coach_profiles")
          .select("*, avatars(slug, rarity, image_url)")
          .eq(filterColumn as "id", identifier)
          .maybeSingle();

        if (error) throw error;
        return (data as unknown as MarketplaceCoach) || null;
      }
    },
    enabled: !!identifier,
    staleTime: 1000 * 60 * 5,
  });
};
