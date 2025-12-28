/**
 * Hook for fetching coaches for the marketplace (/coaches and /dashboard/client/find-coaches)
 * 
 * Uses SQL-first ranking via get_ranked_coaches RPC:
 * - Location tier is primary factor (city > region > country > online)
 * - Boost only reorders within the same location tier
 * - Verified, profile completeness, and engagement are secondary factors
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LocationData, RankingScore, LocationMatchLevel } from "@/types/ranking";

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
  // Profile completeness (from database computed column)
  is_complete_profile?: boolean | null;
  // Computed/added fields
  rating?: number | null;
  reviews_count?: number | null;
  is_sponsored?: boolean | null;
  tags?: string[] | null;
  // Ranking data (added after ranking)
  ranking?: RankingScore;
  // From RPC
  visibility_score?: number;
  location_tier?: number;
  review_count?: number;
  avg_rating?: number | null;
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
  featured?: boolean;
  location?: string;
  showSponsoredFirst?: boolean;
  /** User's detected location for proximity ranking */
  userLocation?: LocationData | null;
  /** Enable location-based ranking (default: true) */
  enableLocationRanking?: boolean;
  /** Minimum results before expanding location radius (default: 5) - not used in SQL version */
  minResultsBeforeExpansion?: number;
  /** Filter coaches by country code (e.g., 'gb', 'pl') - case insensitive */
  countryCode?: string;
  /** Only show coaches with complete profiles (real coaches, not test/placeholder) - handled by RPC */
  realCoachesOnly?: boolean;
}

export interface UseCoachMarketplaceResult {
  data: MarketplaceCoach[] | undefined;
  isLoading: boolean;
  error: Error | null;
  /** Whether location radius was expanded to get more results */
  locationExpanded?: boolean;
  /** The effective match level used after any expansion */
  effectiveMatchLevel?: string;
}

/**
 * Determines the match level based on location tier score from RPC
 */
function getMatchLevelFromTier(locationTier: number): LocationMatchLevel {
  if (locationTier >= 1000) return 'exact_city';
  if (locationTier >= 700) return 'same_region';
  if (locationTier >= 400) return 'same_country';
  if (locationTier >= 300) return 'online_only';
  return 'no_match';
}

export const useCoachMarketplace = (options: UseCoachMarketplaceOptions = {}): UseCoachMarketplaceResult => {
  const query = useQuery({
    queryKey: ["marketplace-coaches-rpc", options],
    queryFn: async () => {
      // Call the SQL ranking function
      const { data, error } = await supabase.rpc('get_ranked_coaches', {
        p_user_city: options.userLocation?.city || null,
        p_user_region: options.userLocation?.region || options.userLocation?.county || null,
        p_user_country_code: options.userLocation?.countryCode || null,
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

      // Map RPC results to MarketplaceCoach type with ranking data
      const coaches: MarketplaceCoach[] = (data || []).map((row: any) => {
        const locationTier = row.location_tier || 0;
        const matchLevel = getMatchLevelFromTier(locationTier);
        
        return {
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
          // Map avatar data from RPC flat fields to nested avatars object
          avatars: row.avatar_slug ? {
            slug: row.avatar_slug,
            rarity: row.avatar_rarity,
            image_url: null
          } : null,
          // Computed fields from RPC
          is_sponsored: row.is_sponsored,
          visibility_score: row.visibility_score,
          location_tier: locationTier,
          review_count: row.review_count,
          avg_rating: row.avg_rating,
          rating: row.avg_rating,
          reviews_count: row.review_count,
          // Ranking data for components that need it
          ranking: {
            locationScore: locationTier,
            engagementScore: 0,
            profileScore: 0,
            totalScore: row.visibility_score || 0,
            matchLevel,
            isSponsored: row.is_sponsored || false,
          },
          // Qualification count
          verified_qualification_count: row.verified_qualification_count || 0,
        };
      });

      // Determine effective match level from first coach (already sorted by tier)
      const effectiveMatchLevel = coaches.length > 0 
        ? getMatchLevelFromTier(coaches[0].location_tier || 0)
        : 'no_match';

      return {
        coaches,
        effectiveMatchLevel,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return {
    data: query.data?.coaches,
    isLoading: query.isLoading,
    error: query.error ?? null,
    locationExpanded: false, // SQL handles this internally
    effectiveMatchLevel: query.data?.effectiveMatchLevel,
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
