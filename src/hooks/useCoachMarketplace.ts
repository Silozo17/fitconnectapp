/**
 * Hook for fetching coaches for the marketplace (/coaches and /dashboard/client/find-coaches)
 * 
 * STABILISED VERSION: All ranking, boosting, and scoring logic has been REMOVED.
 * Uses simple country-based filtering with deterministic ordering (created_at DESC).
 */
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

// Type for public coach profile data (GDPR-safe columns only)
export type MarketplaceCoach = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  coach_types: string[] | null;
  certifications: unknown | null;
  experience_years: number | null;
  hourly_rate: number | null;
  currency: string | null;
  location: string | null;
  location_city: string | null;
  location_region: string | null;
  location_country: string | null;
  location_country_code: string | null;
  online_available: boolean | null;
  in_person_available: boolean | null;
  profile_image_url: string | null;
  card_image_url: string | null;
  booking_mode: string | null;
  is_verified: boolean | null;
  verified_at: string | null;
  gym_affiliation: string | null;
  marketplace_visible: boolean | null;
  selected_avatar_id: string | null;
  created_at: string;
  onboarding_completed: boolean;
  // Social links
  who_i_work_with: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  x_url: string | null;
  threads_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  // Joined avatar data
  avatars?: {
    slug: string;
    rarity: string;
    image_url: string | null;
  } | null;
  // Computed/added fields
  rating?: number | null;
  avg_rating?: number | null;
  reviews_count?: number | null;
  review_count?: number | null;
  is_sponsored?: boolean | null;
  tags?: string[] | null;
  // Qualification count
  verified_qualification_count?: number;
};

export interface UseCoachMarketplaceOptions {
  search?: string;
  coachTypes?: string[];
  priceRange?: { min: number; max: number };
  onlineOnly?: boolean;
  inPersonOnly?: boolean;
  limit?: number;
  /** Filter coaches by country code (e.g., 'gb', 'pl') - STRICT filter, case insensitive */
  countryCode?: string;
  /** Whether the query should execute (default: true) */
  enabled?: boolean;
}

export interface UseCoachMarketplaceResult {
  data: MarketplaceCoach[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

// Empty result to prevent stale cache
const EMPTY_RESULT: MarketplaceCoach[] = [];

export const useCoachMarketplace = (options: UseCoachMarketplaceOptions = {}): UseCoachMarketplaceResult => {
  // Create stable query key
  const queryKey = useMemo(() => [
    "marketplace-coaches-simple",
    options.countryCode || null,
    options.search || null,
    options.coachTypes?.join(',') || null,
    options.priceRange?.min ?? null,
    options.priceRange?.max ?? null,
    options.onlineOnly || false,
    options.inPersonOnly || false,
    options.limit || 50,
  ], [
    options.countryCode,
    options.search,
    options.coachTypes,
    options.priceRange?.min,
    options.priceRange?.max,
    options.onlineOnly,
    options.inPersonOnly,
    options.limit,
  ]);
  
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      // Call the simplified function - NO ranking, just country filter
      const { data, error } = await supabase.rpc('get_simple_coaches', {
        p_filter_country_code: options.countryCode || null,
        p_search_term: options.search || null,
        p_coach_types: options.coachTypes && options.coachTypes.length > 0 ? options.coachTypes : null,
        p_min_price: options.priceRange?.min || null,
        p_max_price: options.priceRange?.max || null,
        p_online_only: options.onlineOnly || false,
        p_in_person_only: options.inPersonOnly || false,
        p_limit: options.limit || 50,
      });

      if (error) throw error;

      // Map RPC results to MarketplaceCoach type
      const coaches: MarketplaceCoach[] = (data || []).map((row: any) => ({
        id: row.id,
        username: row.username,
        display_name: row.display_name,
        bio: row.bio,
        coach_types: row.coach_types,
        certifications: row.certifications,
        experience_years: row.experience_years,
        hourly_rate: row.hourly_rate,
        currency: row.currency,
        location: row.location,
        location_city: row.location_city,
        location_region: row.location_region,
        location_country: row.location_country,
        location_country_code: row.location_country_code,
        online_available: row.online_available,
        in_person_available: row.in_person_available,
        profile_image_url: row.profile_image_url,
        card_image_url: row.card_image_url,
        booking_mode: row.booking_mode,
        is_verified: row.is_verified,
        verified_at: row.verified_at,
        gym_affiliation: row.gym_affiliation,
        marketplace_visible: row.marketplace_visible,
        selected_avatar_id: row.selected_avatar_id,
        created_at: row.created_at,
        onboarding_completed: row.onboarding_completed || false,
        who_i_work_with: row.who_i_work_with,
        facebook_url: row.facebook_url,
        instagram_url: row.instagram_url,
        tiktok_url: row.tiktok_url,
        x_url: row.x_url,
        threads_url: row.threads_url,
        linkedin_url: row.linkedin_url,
        youtube_url: row.youtube_url,
        // Map avatar data from RPC flat fields
        avatars: row.avatar_slug ? {
          slug: row.avatar_slug,
          rarity: row.avatar_rarity,
          image_url: null
        } : null,
        // Computed fields (kept for display, NOT used for ordering)
        is_sponsored: row.is_sponsored,
        rating: row.avg_rating,
        avg_rating: row.avg_rating,
        reviews_count: row.review_count,
        review_count: row.review_count,
        verified_qualification_count: row.verified_qualification_count || 0,
        tags: null,
      }));

      return coaches;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes cache
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
  // Check if identifier is a UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

  return useQuery({
    queryKey: ["coach", identifier],
    queryFn: async () => {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      const filterColumn = isUUID ? "id" : "username";
      
      if (session) {
        // Authenticated users: query base table (RLS handles access control)
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
        // Anonymous users: use GDPR-safe public view (marketplace-visible only)
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
