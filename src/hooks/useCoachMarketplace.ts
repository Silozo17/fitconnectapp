/**
 * Hook for fetching coaches for the marketplace (/coaches and /dashboard/client/find-coaches)
 * 
 * V1 RANKING: Uses get_marketplace_coaches_v1 with two-layer deterministic ranking:
 * - Layer 1: Location buckets (user-visible ordering)
 * - Layer 2: Platform score (internal quality ranking within buckets)
 * 
 * Fallback: get_simple_coaches remains untouched as safety net.
 */
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

// Coach type matching the RPC return
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
  is_boosted?: boolean | null;
  tags?: string[] | null;
  verified_qualification_count?: number;
  // Ranking fields (for debugging/transparency)
  location_bucket?: number;
  platform_score?: number;
};

export interface UseCoachMarketplaceOptions {
  /** Filter coaches by country code (e.g., 'gb', 'pl') - STRICT filter */
  countryCode?: string;
  /** Maximum number of coaches to return */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Whether the query should execute (default: true) */
  enabled?: boolean;
  /** Search term for filtering by name/bio */
  search?: string;
  /** Filter by specific coach types */
  coachTypes?: string[];
  /** Filter by price range */
  priceRange?: { min: number; max: number };
  /** Show only online-available coaches */
  onlineOnly?: boolean;
  /** Show only in-person-available coaches */
  inPersonOnly?: boolean;
  /** User latitude for distance-based bucketing */
  userLat?: number;
  /** User longitude for distance-based bucketing */
  userLng?: number;
  /** User city for city-match bucketing */
  userCity?: string;
  /** User region for region-match bucketing */
  userRegion?: string;
}

export interface UseCoachMarketplaceResult {
  data: MarketplaceCoach[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

const EMPTY_RESULT: MarketplaceCoach[] = [];

export const useCoachMarketplace = (options: UseCoachMarketplaceOptions = {}): UseCoachMarketplaceResult => {
  // Stable query key - includes ALL filter parameters to prevent unnecessary refetches
  const queryKey = useMemo(() => [
    "marketplace-coaches-v1",
    options.countryCode || null,
    options.search || null,
    options.coachTypes?.sort().join(',') || null,
    options.priceRange?.min ?? null,
    options.priceRange?.max ?? null,
    options.onlineOnly ?? false,
    options.inPersonOnly ?? false,
    options.userLat ?? null,
    options.userLng ?? null,
    options.userCity ?? null,
    options.userRegion ?? null,
    options.limit ?? 50,
    options.offset ?? 0,
  ], [
    options.countryCode,
    options.search,
    options.coachTypes,
    options.priceRange?.min,
    options.priceRange?.max,
    options.onlineOnly,
    options.inPersonOnly,
    options.userLat,
    options.userLng,
    options.userCity,
    options.userRegion,
    options.limit,
    options.offset,
  ]);
  
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      // Call the new ranking function with all parameters
      const { data, error } = await supabase.rpc('get_marketplace_coaches_v1', {
        p_filter_country_code: options.countryCode || null,
        p_search_term: options.search || null,
        p_coach_types: options.coachTypes && options.coachTypes.length > 0 ? options.coachTypes : null,
        p_min_price: options.priceRange?.min ?? null,
        p_max_price: options.priceRange?.max ?? null,
        p_online_only: options.onlineOnly ?? false,
        p_in_person_only: options.inPersonOnly ?? false,
        p_user_lat: options.userLat ?? null,
        p_user_lng: options.userLng ?? null,
        p_user_city: options.userCity ?? null,
        p_user_region: options.userRegion ?? null,
        p_limit: options.limit ?? 50,
        p_offset: options.offset ?? 0,
      });

      if (error) {
        console.error('[useCoachMarketplace] RPC error:', error);
        throw error;
      }

      // Map all fields from RPC - render in server-provided order (NO client-side sorting)
      const coaches: MarketplaceCoach[] = (data || []).map((row: any) => ({
        id: row.id,
        username: row.username,
        display_name: row.display_name,
        profile_image_url: row.profile_image_url,
        location_country: row.location_country,
        location_country_code: row.location_country_code,
        created_at: row.created_at,
        // Display fields from RPC
        bio: row.bio,
        coach_types: row.coach_types,
        hourly_rate: row.hourly_rate,
        currency: row.currency,
        online_available: row.online_available,
        in_person_available: row.in_person_available,
        location: row.location,
        location_city: row.location_city,
        location_region: row.location_region,
        card_image_url: row.card_image_url,
        is_verified: row.is_verified,
        verified_at: row.verified_at,
        gym_affiliation: row.gym_affiliation,
        experience_years: row.experience_years,
        // Aggregated fields from RPC
        avg_rating: row.avg_rating,
        review_count: row.review_count,
        rating: row.avg_rating, // Alias for backwards compatibility
        reviews_count: row.review_count, // Alias for backwards compatibility
        is_boosted: row.is_boosted,
        is_sponsored: row.is_boosted, // Alias for backwards compatibility
        verified_qualification_count: row.verified_qualification_count,
        // Ranking fields (for debugging/transparency)
        location_bucket: row.location_bucket,
        platform_score: row.platform_score,
        // Remaining fields not in RPC - null/defaults
        certifications: null,
        booking_mode: null,
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
        tags: null,
      }));

      return coaches;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - stable results
    gcTime: 1000 * 60 * 15, // 15 minutes
    enabled: options.enabled !== false,
    placeholderData: EMPTY_RESULT,
    refetchOnWindowFocus: false, // CRITICAL: Prevent reshuffling on focus
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
