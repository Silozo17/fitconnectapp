/**
 * Hook for fetching featured coaches for the homepage
 * 
 * VALIDATION ASSERTIONS:
 * ✅ Uses sortCoachesByUnifiedRanking from unified-coach-ranking.ts (not duplicated)
 * ✅ filterByLocationWithExpansion() runs BEFORE sortCoachesByUnifiedRanking()
 * ✅ No hardcoded coach IDs
 * ✅ Fake coaches filtered via hasBlockedName()
 * 
 * Uses the unified ranking algorithm (single source of truth shared with /coaches page):
 * 1. Boosted + Verified + Highest Rated + Closest
 * 2. Boosted + Verified + Highest Rated
 * 3. Boosted + Verified
 * 4. Verified + Closest + Highest Rated
 * 5. Verified + Highest Rated
 * 6. Verified + Closest
 * 7. Highest Rated + Closest
 * 8. Closest only
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCoachEngagement, createEmptyEngagementMap } from '@/hooks/useCoachEngagement';
import { sortCoachesByUnifiedRanking, extractRankingFactors } from '@/lib/unified-coach-ranking';
import { calculateLocationScore, filterByLocationWithExpansion } from '@/lib/coach-ranking';
import { hasBlockedName } from '@/lib/coach-validation';
import { matchesCountryFilterStrict, getCountryNameFromCode } from '@/lib/location-utils';
import type { LocationData } from '@/types/ranking';
import type { MarketplaceCoach } from '@/hooks/useCoachMarketplace';

const FEATURED_COACH_LIMIT = 4;

interface UseFeaturedCoachesOptions {
  userLocation: LocationData | null;
  /** When provided, strictly filter coaches to this country only */
  countryCode?: string | null;
}

interface UseFeaturedCoachesResult {
  coaches: MarketplaceCoach[];
  isLoading: boolean;
  locationLabel: string;
}

export function useFeaturedCoaches({ userLocation, countryCode }: UseFeaturedCoachesOptions): UseFeaturedCoachesResult {
  // Fetch coaches and boosted IDs
  const coachesQuery = useQuery({
    queryKey: ['featured-coaches', countryCode],
    queryFn: async () => {
      // Get boosted coach IDs
      const now = new Date().toISOString();
      const { data: boosts } = await supabase
        .from('coach_boosts')
        .select('coach_id, boost_end_date, payment_status')
        .eq('is_active', true)
        .in('payment_status', ['succeeded', 'migrated_free'])
        .gt('boost_end_date', now);
      
      const boostedCoachIds = (boosts || [])
        .filter(b => b.boost_end_date !== null)
        .map(b => b.coach_id);

      // Fetch coaches
      const { data, error } = await supabase
        .from('public_coach_profiles')
        .select('*, avatars(slug, rarity, image_url)')
        .order('hourly_rate', { ascending: false, nullsFirst: false });

      if (error) throw error;

      // Filter out only fake/demo/placeholder coaches (allow incomplete profiles)
      let coaches = ((data || []) as unknown as MarketplaceCoach[])
        .filter(coach => !hasBlockedName(coach.display_name));

      // Apply strict country filtering when countryCode is provided
      if (countryCode) {
        coaches = coaches.filter(coach => matchesCountryFilterStrict(coach, countryCode));
      }

      return { coaches, boostedCoachIds };
    },
    staleTime: 1000 * 60 * 2,
  });

  const coaches = coachesQuery.data?.coaches ?? [];
  const boostedCoachIds = coachesQuery.data?.boostedCoachIds ?? [];
  const coachIds = useMemo(() => coaches.map(c => c.id), [coaches]);

  // Fetch engagement data
  const { data: engagementMap, isLoading: engagementLoading } = useCoachEngagement({
    coachIds,
    enabled: coachIds.length > 0,
  });

  // Apply unified ranking
  const rankedCoaches = useMemo(() => {
    if (coaches.length === 0) return [];

    const engagement = engagementMap ?? createEmptyEngagementMap(coachIds);

    // First, calculate location scores and filter by location
    const coachesWithLocation = coaches.map(coach => {
      const { score: locationScore, matchLevel } = calculateLocationScore(userLocation, {
        location_city: coach.location_city,
        location_region: coach.location_region,
        location_country: coach.location_country,
        online_available: coach.online_available,
        in_person_available: coach.in_person_available,
        location: coach.location,
      });
      return { coach, locationScore, matchLevel };
    });

    // Apply location filtering (town → region → country expansion)
    const rankedForFilter = coachesWithLocation.map(({ coach, locationScore, matchLevel }) => ({
      coach,
      ranking: {
        locationScore,
        engagementScore: 0,
        profileScore: 0,
        totalScore: locationScore,
        matchLevel,
        isSponsored: boostedCoachIds.includes(coach.id),
      },
    }));

    const { coaches: filteredByLocation } = filterByLocationWithExpansion(
      rankedForFilter,
      FEATURED_COACH_LIMIT,
      true
    );

    // Apply unified ranking to location-filtered coaches
    const sorted = sortCoachesByUnifiedRanking(
      filteredByLocation.map(r => r.coach),
      (coach) => {
        const locationData = coachesWithLocation.find(c => c.coach.id === coach.id);
        return extractRankingFactors(
          coach.id,
          locationData?.locationScore ?? 0,
          locationData?.matchLevel ?? 'no_match',
          coach.is_verified === true,
          boostedCoachIds.includes(coach.id),
          engagement
        );
      }
    );

    return sorted.slice(0, FEATURED_COACH_LIMIT).map(r => r.coach);
  }, [coaches, boostedCoachIds, coachIds, engagementMap, userLocation]);

  const isLoading = coachesQuery.isLoading || engagementLoading;
  
  // Location label: prefer country name from countryCode when filtering by country
  const locationLabel = countryCode 
    ? (getCountryNameFromCode(countryCode) || userLocation?.country || 'Your Area')
    : (userLocation?.city || userLocation?.region || userLocation?.country || 'Your Area');

  return {
    coaches: rankedCoaches,
    isLoading,
    locationLabel,
  };
}
