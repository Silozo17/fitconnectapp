/**
 * Hook for fetching featured coaches for the homepage
 * 
 * STABILISATION: Uses get_simple_coaches RPC with country filter only.
 * No ranking, no boost ordering.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCountryNameFromCode } from '@/lib/location-utils';
import { isDespia } from '@/lib/despia';
import type { LocationData } from '@/types/ranking';
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

// Ranking helper removed - no ranking logic in stabilisation phase

export function useFeaturedCoaches({ userLocation, countryCode, enabled = true }: UseFeaturedCoachesOptions): UseFeaturedCoachesResult {
  const query = useQuery({
    // Stabilized query key - only use country code
    queryKey: ['featured-coaches-simple', countryCode || userLocation?.countryCode || 'global'],
    enabled,
    queryFn: async () => {
      // Call simplified function - no ranking, country filter only
      const { data, error } = await supabase.rpc('get_simple_coaches', {
        p_filter_country_code: countryCode || userLocation?.countryCode || null,
        p_search_term: null,
        p_coach_types: null,
        p_min_price: null,
        p_max_price: null,
        p_online_only: false,
        p_in_person_only: false,
        p_limit: FEATURED_COACH_LIMIT,
      });

      if (error) throw error;

      // Map RPC results to MarketplaceCoach type (simplified - no ranking)
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
        avatars: row.avatar_slug ? {
          slug: row.avatar_slug,
          rarity: row.avatar_rarity,
          image_url: null
        } : null,
        is_sponsored: row.is_sponsored,
        avg_rating: row.avg_rating,
        review_count: row.review_count,
        rating: row.avg_rating,
        reviews_count: row.review_count,
        tags: row.tags,
      }));

      return coaches;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: !isDespia(),
    placeholderData: EMPTY_COACHES,
    refetchOnMount: false,
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
