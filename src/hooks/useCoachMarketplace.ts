// ⚠️ STABILITY LOCK
// This function/hook must NOT include ranking, boost ordering, or distance logic.
// Sorting here is intentionally deterministic to prevent UI reshuffle.
// Any ranking must be implemented in a NEW function.

/**
 * Hook for fetching coaches for the marketplace (/coaches and /dashboard/client/find-coaches)
 * 
 * STABILISATION: Uses get_simple_coaches when NO filters are active.
 * FILTERS: Uses get_filtered_coaches_v1 when ANY filter is active.
 * 
 * Query key remains STABLE to prevent reshuffling.
 * Order is always created_at DESC - NO client-side sorting.
 */
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isDespia } from "@/lib/despia";
import { MARKETPLACE_RANKING_ENABLED } from "@/config/marketplace";

// Coach type matching what RPC functions return
export type MarketplaceCoach = {
  id: string;
  username: string | null;
  display_name: string | null;
  profile_image_url: string | null;
  location_country: string | null;
  location_country_code: string | null;
  created_at: string;
  bio?: string | null;
  coach_types?: string[] | null;
  hourly_rate?: number | null;
  currency?: string | null;
  online_available?: boolean | null;
  in_person_available?: boolean | null;
  location?: string | null;
  location_city?: string | null;
  location_region?: string | null;
  card_image_url?: string | null;
  is_verified?: boolean | null;
  verified_at?: string | null;
  gym_affiliation?: string | null;
  avg_rating?: number | null;
  review_count?: number | null;
  is_sponsored?: boolean | null;
  verified_qualification_count?: number;
  // Backwards compatibility aliases
  rating?: number | null;
  reviews_count?: number | null;
  is_boosted?: boolean | null;
  // Type compatibility fields (not from RPC)
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
  // Filter options
  coachTypes?: string[];
  priceRange?: { min?: number; max?: number };
  onlineOnly?: boolean;
  inPersonOnly?: boolean;
  verifiedOnly?: boolean;
  qualifiedOnly?: boolean;
  /** City from Google Places API */
  userCity?: string;
  /** Region from Google Places API */
  userRegion?: string;
  // Unused but kept for interface compatibility
  offset?: number;
  search?: string;
  userLat?: number;
  userLng?: number;
  /** 
   * ⚠️ OPT-IN RANKING: When true AND location is available, uses get_ranked_coaches_v1.
   * This must be explicitly set by user action (e.g., "Best match" toggle).
   * Default: false - uses stable ordering.
   */
  useRanking?: boolean;
}

export interface UseCoachMarketplaceResult {
  data: MarketplaceCoach[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

const EMPTY_RESULT: MarketplaceCoach[] = [];

/**
 * Determines if any filter is active (beyond country code)
 */
function hasActiveFilters(options: UseCoachMarketplaceOptions): boolean {
  return !!(
    options.userCity ||
    options.userRegion ||
    (options.coachTypes && options.coachTypes.length > 0) ||
    options.priceRange?.min !== undefined ||
    options.priceRange?.max !== undefined ||
    options.onlineOnly ||
    options.inPersonOnly ||
    options.verifiedOnly ||
    options.qualifiedOnly
  );
}

export const useCoachMarketplace = (options: UseCoachMarketplaceOptions = {}): UseCoachMarketplaceResult => {
  const filtersActive = hasActiveFilters(options);
  
  // ⚠️ RANKING ACTIVATION RULES (CRITICAL):
  // Ranking is used ONLY when ALL conditions are met:
  // 1. MARKETPLACE_RANKING_ENABLED === true (system flag)
  // 2. options.useRanking === true (user explicitly opted in via "Best match" toggle)
  // 3. Location is available (userCity OR userLat+userLng)
  //
  // If ANY condition is false, ranking is NOT used.
  const shouldUseRanking =
    (MARKETPLACE_RANKING_ENABLED as boolean) === true &&
    options.useRanking === true &&
    !!(
      options.userCity ||
      (options.userLat && options.userLng)
    );
  
  // Query key includes filter state and ranking state to ensure proper cache invalidation
  // But uses a stable structure to minimize unnecessary refetches
  // ⚠️ CRITICAL: Query key must include shouldUseRanking to ensure cache separation
  const queryKey = useMemo(() => [
    "marketplace-coaches-stable",
    options.countryCode || null,
    options.limit ?? 50,
    // Ranking state (separate cache for ranked vs unranked)
    shouldUseRanking ? 'ranked' : 'stable',
    // Filter params included for cache invalidation
    filtersActive ? {
      city: options.userCity || null,
      region: options.userRegion || null,
      types: options.coachTypes || null,
      minPrice: options.priceRange?.min ?? null,
      maxPrice: options.priceRange?.max ?? null,
      online: options.onlineOnly || false,
      inPerson: options.inPersonOnly || false,
      verified: options.verifiedOnly || false,
      qualified: options.qualifiedOnly || false,
    } : null,
    // Location for ranking (only included when ranking is active)
    shouldUseRanking ? {
      lat: options.userLat ?? null,
      lng: options.userLng ?? null,
    } : null,
  ], [
    options.countryCode,
    options.limit,
    shouldUseRanking,
    filtersActive,
    options.userCity,
    options.userRegion,
    options.coachTypes,
    options.priceRange?.min,
    options.priceRange?.max,
    options.onlineOnly,
    options.inPersonOnly,
    options.verifiedOnly,
    options.qualifiedOnly,
    options.userLat,
    options.userLng,
  ]);
  
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      let data: any[] | null = null;
      let error: any = null;

      // PATH 1: Ranking (NOT ACTIVE - requires MARKETPLACE_RANKING_ENABLED = true)
      if (shouldUseRanking) {
        const result = await supabase.rpc('get_ranked_coaches_v1', {
          p_country_code: options.countryCode || null,
          p_city: options.userCity || null,
          p_region: options.userRegion || null,
          p_user_lat: options.userLat ?? null,
          p_user_lng: options.userLng ?? null,
          p_limit: options.limit ?? 50,
          p_offset: options.offset ?? 0,
        });
        data = result.data;
        error = result.error;
      }
      // PATH 2: Filters active (uses get_filtered_coaches_v1)
      else if (filtersActive) {
        const result = await supabase.rpc('get_filtered_coaches_v1', {
          p_country_code: options.countryCode || null,
          p_city: options.userCity || null,
          p_region: options.userRegion || null,
          p_coach_types: options.coachTypes && options.coachTypes.length > 0 
            ? options.coachTypes 
            : null,
          p_min_price: options.priceRange?.min ?? null,
          p_max_price: options.priceRange?.max ?? null,
          p_online_only: options.onlineOnly ?? false,
          p_in_person_only: options.inPersonOnly ?? false,
          p_verified_only: options.verifiedOnly ?? false,
          p_qualified_only: options.qualifiedOnly ?? false,
          p_limit: options.limit ?? 50,
        });
        data = result.data;
        error = result.error;
      }
      // PATH 3: Default - no filters, no ranking (uses get_simple_coaches)
      else {
        const result = await supabase.rpc('get_simple_coaches', {
          p_filter_country_code: options.countryCode || null,
          p_limit: options.limit ?? 50,
        });
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('[useCoachMarketplace] RPC error:', error);
        throw error;
      }

      // Map ALL fields returned by RPC for coach card display
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
        location_region: row.location_region,
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
