/**
 * Unified Coach Ranking Algorithm
 * 
 * VALIDATION RULES - DO NOT REMOVE:
 * ✅ This is the SINGLE SOURCE OF TRUTH for coach ranking
 * ✅ All ranking MUST go through sortCoachesByUnifiedRanking()
 * ✅ No hardcoded coach IDs are permitted
 * ✅ Location filtering MUST execute BEFORE this function is called
 * ✅ Fake coaches MUST be filtered via hasBlockedName() or isRealCoach()
 * 
 * Priority buckets (lower = higher priority):
 * 1. Boosted + Verified + Highest Rated + Closest
 * 2. Boosted + Verified + Highest Rated
 * 3. Boosted + Verified
 * 4. Verified + Closest + Highest Rated
 * 5. Verified + Highest Rated
 * 6. Verified + Closest
 * 7. Highest Rated + Closest
 * 8. Closest only (catch-all)
 * 
 * Within each bucket: sort by rating descending, then by location score
 */

import type { LocationMatchLevel, CoachEngagementData } from '@/types/ranking';
import { LOCATION_SCORES } from '@/types/ranking';

/** What counts as "highest rated" (rating threshold) */
export const HIGH_RATING_THRESHOLD = 4.0;

/** What counts as "closest" - same_region or better location score */
export const CLOSE_LOCATION_THRESHOLD = LOCATION_SCORES.same_region; // 70

export type RankingBucket = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface CoachRankingFactors {
  isBoosted: boolean;
  isVerified: boolean;
  avgRating: number;
  locationScore: number;
  matchLevel: LocationMatchLevel;
}

/**
 * Determines which ranking bucket a coach belongs to based on their factors
 * 
 * Priority:
 * 1. Boosted + Verified + Highest Rated + Closest
 * 2. Boosted + Verified + Highest Rated
 * 3. Boosted + Verified
 * 4. Verified + Closest + Highest Rated
 * 5. Verified + Highest Rated
 * 6. Verified + Closest
 * 7. Highest Rated + Closest
 * 8. Closest only (catch-all)
 */
export function calculateRankingBucket(factors: CoachRankingFactors): RankingBucket {
  const isHighRated = factors.avgRating >= HIGH_RATING_THRESHOLD;
  const isClose = factors.locationScore >= CLOSE_LOCATION_THRESHOLD;

  // Bucket 1: Boosted + Verified + Highest Rated + Closest
  if (factors.isBoosted && factors.isVerified && isHighRated && isClose) return 1;
  
  // Bucket 2: Boosted + Verified + Highest Rated
  if (factors.isBoosted && factors.isVerified && isHighRated) return 2;
  
  // Bucket 3: Boosted + Verified
  if (factors.isBoosted && factors.isVerified) return 3;
  
  // Bucket 4: Verified + Closest + Highest Rated
  if (factors.isVerified && isClose && isHighRated) return 4;
  
  // Bucket 5: Verified + Highest Rated
  if (factors.isVerified && isHighRated) return 5;
  
  // Bucket 6: Verified + Closest
  if (factors.isVerified && isClose) return 6;
  
  // Bucket 7: Highest Rated + Closest
  if (isHighRated && isClose) return 7;
  
  // Bucket 8: Catch-all (closest only or no special criteria)
  return 8;
}

export interface RankedCoachWithBucket<T> {
  coach: T;
  factors: CoachRankingFactors;
  bucket: RankingBucket;
}

/**
 * Sorts coaches using the unified ranking algorithm
 * 
 * This is the single source of truth for coach ranking used by:
 * - Homepage Featured Coaches
 * - /coaches marketplace page
 * 
 * @param coaches - Array of coaches to sort
 * @param getFactors - Function to extract ranking factors from each coach
 * @returns Sorted array of coaches with ranking metadata
 */
export function sortCoachesByUnifiedRanking<T extends { id: string; display_name: string | null }>(
  coaches: T[],
  getFactors: (coach: T) => CoachRankingFactors
): RankedCoachWithBucket<T>[] {
  // Calculate factors and bucket for each coach
  const rankedCoaches: RankedCoachWithBucket<T>[] = coaches.map(coach => {
    const factors = getFactors(coach);
    const bucket = calculateRankingBucket(factors);
    return { coach, factors, bucket };
  });

  // Sort by bucket first, then by rating, then by location score
  rankedCoaches.sort((a, b) => {
    // 1. Sort by bucket (lower = higher priority)
    if (a.bucket !== b.bucket) {
      return a.bucket - b.bucket;
    }

    // 2. Within bucket: rating descending
    if (a.factors.avgRating !== b.factors.avgRating) {
      return b.factors.avgRating - a.factors.avgRating;
    }

    // 3. Tiebreaker: location score descending (closer first)
    if (a.factors.locationScore !== b.factors.locationScore) {
      return b.factors.locationScore - a.factors.locationScore;
    }

    // 4. Final tiebreaker: alphabetical by display name
    const nameA = (a.coach.display_name ?? '').toLowerCase();
    const nameB = (b.coach.display_name ?? '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return rankedCoaches;
}

/**
 * Helper to extract ranking factors from coach data and engagement map
 */
export function extractRankingFactors(
  coachId: string,
  locationScore: number,
  matchLevel: LocationMatchLevel,
  isVerified: boolean,
  isBoosted: boolean,
  engagementMap: Map<string, CoachEngagementData>
): CoachRankingFactors {
  const engagement = engagementMap.get(coachId);
  return {
    isBoosted,
    isVerified,
    avgRating: engagement?.avg_rating ?? 0,
    locationScore,
    matchLevel,
  };
}

/**
 * DEV-ONLY: Validates ranking invariants at runtime
 * Logs warnings if any violations are detected
 */
export function validateRankingInvariants<T extends { id: string }>(
  coaches: T[],
  context: string = 'unknown'
): void {
  if (import.meta.env.PROD) return;
  
  const ids = coaches.map(c => c.id);
  
  // Check for duplicate IDs
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (duplicates.length > 0) {
    console.warn(`[Ranking:${context}] Duplicate coach IDs detected:`, duplicates);
  }
  
  // Check for empty/invalid IDs (would indicate hardcoded data)
  const invalidIds = ids.filter(id => !id || typeof id !== 'string' || id.length < 10);
  if (invalidIds.length > 0) {
    console.warn(`[Ranking:${context}] Invalid coach IDs detected:`, invalidIds);
  }
}
