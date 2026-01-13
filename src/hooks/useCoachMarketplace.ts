/**
 * Hook for fetching coaches for the marketplace (/coaches and /dashboard/client/find-coaches)
 * 
 * STABILISATION: Uses get_simple_coaches with 2 parameters only.
 * Returns minimal fields: id, username, display_name, profile_image_url, location_country, location_country_code, created_at
 * 
 * DO NOT add joins, ranking, boost logic, or any complexity.
 * This is Layer 0: Visibility only.
 */
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isDespia } from "@/lib/despia";

// Minimal coach type matching exactly what get_simple_coaches returns
export type MarketplaceCoach = {
  id: string;
  username: string | null;
  display_name: string | null;
  profile_image_url: string | null;
  location_country: string | null;
  location_country_code: string | null;
  created_at: string;
  // Fields NOT returned by get_simple_coaches - kept for type compatibility
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
  // Remaining options kept for interface compatibility but NOT USED
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

      // Direct mapping - get_simple_coaches returns minimal fields
      const coaches: MarketplaceCoach[] = (data || []).map((row: any) => ({
        id: row.id,
        username: row.username,
        display_name: row.display_name,
        profile_image_url: row.profile_image_url,
        location_country: row.location_country,
        location_country_code: row.location_country_code,
        created_at: row.created_at,
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
