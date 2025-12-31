/**
 * Hook for fetching featured coaches for the homepage
 * 
 * Uses SQL-first ranking via get_ranked_coaches RPC:
 * - Location tier is primary factor (city > region > country > online)
 * - Boost only reorders within the same location tier
 * - Verified, profile completeness, and engagement are secondary factors
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCountryNameFromCode } from '@/lib/location-utils';
import { isDespia } from '@/lib/despia';
import type { LocationData, LocationMatchLevel } from '@/types/ranking';
import type { MarketplaceCoach } from '@/hooks/useCoachMarketplace';

const FEATURED_COACH_LIMIT = 4;
const EMPTY_COACHES: MarketplaceCoach[] = [];

interface UseFeaturedCoachesOptions {
  userLocation: LocationData | null;
  /** When provided, strictly filter coaches to this country only */
  countryCode?: string | null;
  /** Whether the query should execute (default: true) - use to defer until location is ready */
  enabled?: boolean;
}

interface UseFeaturedCoachesResult {
  coaches: MarketplaceCoach[];
  isLoading: boolean;
  locationLabel: string;
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

export function useFeaturedCoaches({ userLocation, countryCode, enabled = true }: UseFeaturedCoachesOptions): UseFeaturedCoachesResult {
  const query = useQuery({
    queryKey: ['featured-coaches-rpc', userLocation?.city, userLocation?.region, userLocation?.countryCode, countryCode],
    enabled, // Defer query until location is ready
    queryFn: async () => {
      // Call the SQL ranking function with a limit of 4 for featured
      const { data, error } = await supabase.rpc('get_ranked_coaches', {
        p_user_city: userLocation?.city || null,
        p_user_region: userLocation?.region || userLocation?.county || null,
        p_user_country_code: userLocation?.countryCode || null,
        p_filter_country_code: countryCode || null,
        p_search_term: null,
        p_coach_types: null,
        p_min_price: null,
        p_max_price: null,
        p_online_only: false,
        p_in_person_only: false,
        p_limit: FEATURED_COACH_LIMIT,
      });

      if (error) throw error;

      // Map RPC results to MarketplaceCoach type
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
        };
      });

      return coaches;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    // OPTIMIZED: Reduce refetching in native apps
    refetchOnWindowFocus: !isDespia(),
    placeholderData: EMPTY_COACHES, // Prevents loading flash
  });

  // Location label: prefer country name from countryCode when filtering by country
  const locationLabel = countryCode 
    ? (getCountryNameFromCode(countryCode) || userLocation?.country || 'Your Area')
    : (userLocation?.city || userLocation?.region || userLocation?.country || 'Your Area');

  return {
    coaches: query.data || [],
    isLoading: query.isLoading,
    locationLabel,
  };
}
