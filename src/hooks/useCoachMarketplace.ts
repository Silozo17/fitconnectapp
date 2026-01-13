/**
 * Hook for fetching coaches for the marketplace (/coaches and /dashboard/client/find-coaches)
 * 
 * STABILISATION: Uses get_simple_coaches with 2 parameters only.
 * Maps ALL fields returned by the RPC for coach card display.
 * 
 * DO NOT add joins, ranking, boost logic, or any complexity.
 * This is Layer 0: Visibility only.
 */
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isDespia } from "@/lib/despia";

// Coach type matching what get_simple_coaches returns
// Core fields required, aggregated fields optional for compatibility with direct table queries
export type MarketplaceCoach = {
  id: string;
  username: string | null;
  display_name: string | null;
  profile_image_url: string | null;
  location_country: string | null;
  location_country_code: string | null;
  created_at: string;
  // Display fields from RPC
  bio?: string | null;
  coach_types?: string[] | null;
  hourly_rate?: number | null;
  currency?: string | null;
  online_available?: boolean | null;
  in_person_available?: boolean | null;
  location?: string | null;
  location_city?: string | null;
  card_image_url?: string | null;
  is_verified?: boolean | null;
  verified_at?: string | null;
  gym_affiliation?: string | null;
  // Aggregated fields from RPC (optional for direct table queries)
  avg_rating?: number | null;
  review_count?: number | null;
  is_sponsored?: boolean | null;
  verified_qualification_count?: number;
  // Backwards compatibility aliases
  rating?: number | null;
  reviews_count?: number | null;
  is_boosted?: boolean | null;
  // Type compatibility fields (not from RPC)
  location_region?: string | null;
  certifications?: unknown | null;
  experience_years?: number | null;
  booking_mode?: string | null;
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
  tags?: string[] | null;
  location_bucket?: number;
  platform_score?: number;
};

export interface UseCoachMarketplaceOptions {
  /** Filter coaches by country code (e.g., 'gb', 'pl') - STRICT filter */
  countryCode?: string;
  /** Maximum number of coaches to return */
  limit?: number;
  /** Whether the query should execute (default: true) */
  enabled?: boolean;
  // Remaining options kept for interface compatibility but NOT USED by get_simple_coaches
  offset?: number;
  search?: string;
  coachTypes?: string[];
  priceRange?: { min?: number; max?: number };
  onlineOnly?: boolean;
  inPersonOnly?: boolean;
  verifiedOnly?: boolean;
  qualifiedOnly?: boolean;
  userLat?: number;
  userLng?: number;
  userCity?: string;
  userRegion?: string;
}

export interface UseCoachMarketplaceResult {
  data: MarketplaceCoach[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

const EMPTY_RESULT: MarketplaceCoach[] = [];

export const useCoachMarketplace = (options: UseCoachMarketplaceOptions = {}): UseCoachMarketplaceResult => {
  // Stable query key - ONLY uses the 2 params passed to get_simple_coaches
  const queryKey = useMemo(() => [
    "marketplace-coaches-stable",
    options.countryCode || null,
    options.limit ?? 50,
  ], [options.countryCode, options.limit]);
  
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      // STABILISATION: Call get_simple_coaches with 2 parameters ONLY
      const { data, error } = await supabase.rpc('get_simple_coaches', {
        p_filter_country_code: options.countryCode || null,
        p_limit: options.limit ?? 50,
      });

      if (error) {
        console.error('[useCoachMarketplace] RPC error:', error);
        throw error;
      }

      // Map ALL fields returned by get_simple_coaches for coach card display
      const coaches: MarketplaceCoach[] = (data || []).map((row: any) => ({
        // Core identity
        id: row.id,
        username: row.username,
        display_name: row.display_name,
        profile_image_url: row.profile_image_url,
        created_at: row.created_at,
        // Location
        location: row.location,
        location_city: row.location_city,
        location_country: row.location_country,
        location_country_code: row.location_country_code,
        // Display fields
        bio: row.bio,
        coach_types: row.coach_types,
        hourly_rate: row.hourly_rate,
        currency: row.currency,
        online_available: row.online_available,
        in_person_available: row.in_person_available,
        card_image_url: row.card_image_url,
        is_verified: row.is_verified,
        verified_at: row.verified_at,
        gym_affiliation: row.gym_affiliation,
        // Aggregated fields
        avg_rating: row.avg_rating ?? 0,
        review_count: row.review_count ?? 0,
        is_sponsored: row.is_sponsored ?? false,
        verified_qualification_count: row.verified_qualification_count ?? 0,
        // Backwards compatibility aliases
        rating: row.avg_rating ?? 0,
        reviews_count: row.review_count ?? 0,
        is_boosted: row.is_sponsored ?? false,
      }));

      return coaches;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - stable results
    gcTime: 1000 * 60 * 15, // 15 minutes
    enabled: options.enabled !== false,
    placeholderData: EMPTY_RESULT,
    refetchOnWindowFocus: !isDespia(), // Prevent reshuffling in native
    refetchOnReconnect: false, // Prevent reshuffling on reconnect
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
