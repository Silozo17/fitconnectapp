/**
 * Hook for fetching featured coaches for the homepage
 * 
 * Wraps useCoachMarketplace and applies quality-based sorting:
 * 1. Highest rated AND verified
 * 2. Highest rated (not verified)
 * 3. Verified (not highest rated)
 * 4. All others
 */

import { useMemo } from 'react';
import { useCoachMarketplace, MarketplaceCoach } from '@/hooks/useCoachMarketplace';
import { useCoachEngagement } from '@/hooks/useCoachEngagement';
import type { LocationData } from '@/types/ranking';

const HIGH_RATING_THRESHOLD = 4.5;
const FEATURED_COACH_LIMIT = 4;

interface UseFeaturedCoachesOptions {
  userLocation: LocationData | null;
}

interface UseFeaturedCoachesResult {
  coaches: MarketplaceCoach[];
  isLoading: boolean;
  locationLabel: string;
}

/**
 * Sorts coaches by quality priority:
 * 1. High rated (4.5+) AND verified
 * 2. High rated (4.5+) only
 * 3. Verified only
 * 4. All others
 * Within each bucket, sort by rating descending
 */
function sortByQualityPriority(
  coaches: MarketplaceCoach[],
  engagementMap: Map<string, { avg_rating: number | null }>
): MarketplaceCoach[] {
  return [...coaches].sort((a, b) => {
    const aRating = engagementMap.get(a.id)?.avg_rating ?? 0;
    const bRating = engagementMap.get(b.id)?.avg_rating ?? 0;
    const aVerified = a.is_verified === true;
    const bVerified = b.is_verified === true;
    const aHighRated = aRating >= HIGH_RATING_THRESHOLD;
    const bHighRated = bRating >= HIGH_RATING_THRESHOLD;

    // Calculate priority bucket (lower = higher priority)
    // 1 = high rated + verified
    // 2 = high rated only
    // 3 = verified only
    // 4 = other
    const aPriority = aHighRated && aVerified ? 1 : aHighRated ? 2 : aVerified ? 3 : 4;
    const bPriority = bHighRated && bVerified ? 1 : bHighRated ? 2 : bVerified ? 3 : 4;

    // Sort by priority first
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // Within same priority bucket, sort by rating descending
    return bRating - aRating;
  });
}

export function useFeaturedCoaches({ userLocation }: UseFeaturedCoachesOptions): UseFeaturedCoachesResult {
  // Build location search string from user location
  const locationSearch = userLocation?.city || userLocation?.region || userLocation?.country || '';

  // Fetch coaches with location filter
  const { data: localCoaches, isLoading: localLoading } = useCoachMarketplace({
    location: locationSearch,
    limit: FEATURED_COACH_LIMIT,
    featured: true,
    realCoachesOnly: true,
  });

  // Fallback to all coaches if no local coaches found
  const { data: fallbackCoaches, isLoading: fallbackLoading } = useCoachMarketplace({
    limit: FEATURED_COACH_LIMIT,
    featured: true,
    realCoachesOnly: true,
  });

  // Determine which coaches to use
  const baseCoaches = localCoaches?.length ? localCoaches : fallbackCoaches;
  const coachIds = useMemo(() => (baseCoaches || []).map(c => c.id), [baseCoaches]);

  // Fetch engagement data for quality sorting
  const { data: engagementMap, isLoading: engagementLoading } = useCoachEngagement({
    coachIds,
    enabled: coachIds.length > 0,
  });

  // Apply quality-based sorting after location filtering
  const sortedCoaches = useMemo(() => {
    if (!baseCoaches || baseCoaches.length === 0) {
      return [];
    }

    // If engagement data not ready, return unsorted
    if (!engagementMap) {
      return baseCoaches;
    }

    return sortByQualityPriority(baseCoaches, engagementMap);
  }, [baseCoaches, engagementMap]);

  const isLoading = localLoading || (localCoaches?.length === 0 && fallbackLoading) || engagementLoading;
  const locationLabel = userLocation?.city || userLocation?.region || userLocation?.country || 'Your Area';

  return {
    coaches: sortedCoaches,
    isLoading,
    locationLabel,
  };
}
