/**
 * Coach Marketplace Ranking Algorithm
 * 
 * A deterministic, explainable ranking system that prioritises:
 * 1. Location proximity (50%) - coaches near the user rank higher
 * 2. Engagement signals (30%) - reviews, sessions, verification
 * 3. Profile completeness (20%) - complete profiles rank higher
 * 
 * This module is framework-agnostic and can be reused for web and mobile.
 */

import {
  LocationMatchLevel,
  LocationData,
  CoachLocationData,
  CoachEngagementData,
  CoachProfileData,
  RankingScore,
  RankedCoach,
  RANKING_WEIGHTS,
  LOCATION_SCORES,
  MIN_RESULTS_BEFORE_EXPANSION,
} from '@/types/ranking';
import { getStructuredLocationWithFallbacks, type CoachLocationFields } from '@/lib/location-utils';

/**
 * Normalizes a string for comparison (lowercase, trimmed)
 */
function normalizeString(str: string | null | undefined): string {
  return (str ?? '').toLowerCase().trim();
}

/**
 * Checks if two location strings match (case-insensitive)
 */
function locationsMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const normA = normalizeString(a);
  const normB = normalizeString(b);
  return normA.length > 0 && normB.length > 0 && normA === normB;
}

/**
 * Calculates location proximity score between user and coach
 * Uses structured location data with fallback to parsed legacy location
 * 
 * @param userLocation - User's detected/selected location
 * @param coachLocation - Coach's registered location (may include legacy location field)
 * @returns Score (0-100) and match level
 */
export function calculateLocationScore(
  userLocation: LocationData | null,
  coachLocation: CoachLocationData & CoachLocationFields
): { score: number; matchLevel: LocationMatchLevel } {
  // If user has no location data, give neutral score with online boost
  if (!userLocation || (!userLocation.city && !userLocation.region && !userLocation.country)) {
    const isOnlineAvailable = coachLocation.online_available === true;
    return {
      score: isOnlineAvailable ? 60 : 50,
      matchLevel: isOnlineAvailable ? 'online_only' : 'no_match',
    };
  }

  // Get structured location with fallbacks from legacy data
  const resolvedLocation = getStructuredLocationWithFallbacks(coachLocation);

  // Check for exact city match (highest priority)
  if (locationsMatch(userLocation.city, resolvedLocation.city)) {
    return { score: LOCATION_SCORES.exact_city, matchLevel: 'exact_city' };
  }

  // Check for same region match (county/region level)
  // We check both region and county from user location against coach's region
  const userRegion = userLocation.region || userLocation.county;
  if (locationsMatch(userRegion, resolvedLocation.region)) {
    return { score: LOCATION_SCORES.same_region, matchLevel: 'same_region' };
  }

  // Check for same country match
  if (locationsMatch(userLocation.country, resolvedLocation.country)) {
    // If coach is online-only (no in-person), give them a slight boost within country
    if (coachLocation.online_available && !coachLocation.in_person_available) {
      return { score: LOCATION_SCORES.same_country + 5, matchLevel: 'online_only' };
    }
    return { score: LOCATION_SCORES.same_country, matchLevel: 'same_country' };
  }

  // No location match - check if online available
  if (coachLocation.online_available === true) {
    return { score: LOCATION_SCORES.online_only, matchLevel: 'online_only' };
  }

  // No match at all
  return { score: LOCATION_SCORES.no_match, matchLevel: 'no_match' };
}

/**
 * Calculates engagement score based on reviews, sessions, and verification
 * 
 * Scoring factors:
 * - Has any reviews: +20
 * - Rating >= 4.5: +20 (or >= 4.0: +10)
 * - Is verified: +15
 * - Has completed sessions: +15
 * - Recently active (30 days): +10
 * - Has profile image: +10
 * 
 * @param engagement - Aggregated engagement data
 * @param isVerified - Whether coach is verified
 * @param hasImage - Whether coach has a profile image
 * @returns Score (0-100)
 */
export function calculateEngagementScore(
  engagement: CoachEngagementData | null,
  isVerified: boolean = false,
  hasImage: boolean = false
): number {
  let score = 0;

  // Base points for having engagement data
  if (engagement) {
    // Review-based scoring
    if (engagement.review_count > 0) {
      score += 20; // Has reviews
      
      if (engagement.avg_rating !== null) {
        if (engagement.avg_rating >= 4.5) {
          score += 20; // Excellent rating
        } else if (engagement.avg_rating >= 4.0) {
          score += 10; // Good rating
        }
      }
    }

    // Session-based scoring
    if (engagement.session_count > 0) {
      score += 15; // Has completed sessions
    }

    // Recency scoring
    if (engagement.last_session_at) {
      const lastSession = new Date(engagement.last_session_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (lastSession >= thirtyDaysAgo) {
        score += 10; // Recently active
      }
    }
  }

  // Verification bonus
  if (isVerified) {
    score += 15;
  }

  // Profile image bonus
  if (hasImage) {
    score += 10;
  }

  // Cap at 100
  return Math.min(score, 100);
}

/**
 * Calculates profile completeness score
 * 
 * Checks:
 * - Has bio: +20
 * - Has profile image: +20
 * - Has coach types: +15
 * - Has hourly rate: +15
 * - Has location: +15
 * - Has certifications: +15
 * 
 * @param profile - Coach profile data
 * @returns Score (0-100)
 */
export function calculateProfileScore(profile: CoachProfileData): number {
  let score = 0;

  if (profile.bio && profile.bio.trim().length > 20) {
    score += 20;
  }

  if (profile.profile_image_url || profile.card_image_url) {
    score += 20;
  }

  if (profile.coach_types && profile.coach_types.length > 0) {
    score += 15;
  }

  if (profile.hourly_rate && profile.hourly_rate > 0) {
    score += 15;
  }

  if (profile.location && profile.location.trim().length > 0) {
    score += 15;
  }

  if (profile.certifications && 
      (Array.isArray(profile.certifications) ? profile.certifications.length > 0 : true)) {
    score += 15;
  }

  return Math.min(score, 100);
}

/**
 * Calculates the complete ranking score for a coach
 * 
 * Formula: (location * 0.50) + (engagement * 0.30) + (profile * 0.20)
 * 
 * @param userLocation - User's location data
 * @param coachLocation - Coach's location data
 * @param coachProfile - Coach's profile data
 * @param engagement - Coach's engagement data
 * @param isSponsored - Whether coach has active boost
 * @returns Complete ranking score with breakdown
 */
export function calculateCoachRankingScore(
  userLocation: LocationData | null,
  coachLocation: CoachLocationData,
  coachProfile: CoachProfileData,
  engagement: CoachEngagementData | null,
  isSponsored: boolean = false
): RankingScore {
  const { score: locationScore, matchLevel } = calculateLocationScore(userLocation, coachLocation);
  
  const hasImage = !!(coachProfile.profile_image_url || coachProfile.card_image_url);
  const engagementScore = calculateEngagementScore(
    engagement,
    coachProfile.is_verified ?? false,
    hasImage
  );
  
  const profileScore = calculateProfileScore(coachProfile);

  const totalScore = 
    (locationScore * RANKING_WEIGHTS.location) +
    (engagementScore * RANKING_WEIGHTS.engagement) +
    (profileScore * RANKING_WEIGHTS.profile);

  return {
    locationScore,
    engagementScore,
    profileScore,
    totalScore: Math.round(totalScore * 100) / 100, // Round to 2 decimal places
    matchLevel,
    isSponsored,
  };
}

/**
 * Location match level priority (lower = better/closer)
 */
const LOCATION_LEVEL_PRIORITY: Record<LocationMatchLevel, number> = {
  exact_city: 0,
  same_region: 1,
  same_country: 2,
  online_only: 3,
  no_match: 4,
};

/**
 * Ranks a list of coaches based on the ranking algorithm
 * 
 * Sort order:
 * 1. By location match level (exact_city > same_region > same_country > online_only > no_match)
 * 2. Within same location tier: sponsored coaches first
 * 3. By total score descending
 * 4. By display name alphabetically (deterministic tiebreaker)
 * 
 * This ensures a local non-sponsored coach appears above a distant sponsored coach,
 * while still giving sponsored coaches priority within their location tier.
 * 
 * @param coaches - Array of coaches to rank
 * @param userLocation - User's location data
 * @param engagementMap - Map of coach IDs to engagement data
 * @param getCoachData - Function to extract location/profile/boost data from coach
 * @returns Ranked array with scores
 */
export function rankCoaches<T extends { id: string; display_name: string | null }>(
  coaches: T[],
  userLocation: LocationData | null,
  engagementMap: Map<string, CoachEngagementData>,
  getCoachData: (coach: T) => {
    location: CoachLocationData;
    profile: CoachProfileData;
    isSponsored: boolean;
  }
): RankedCoach<T>[] {
  // Calculate scores for each coach
  const rankedCoaches: RankedCoach<T>[] = coaches.map(coach => {
    const { location, profile, isSponsored } = getCoachData(coach);
    const engagement = engagementMap.get(coach.id) ?? null;
    
    const ranking = calculateCoachRankingScore(
      userLocation,
      location,
      profile,
      engagement,
      isSponsored
    );

    return { coach, ranking };
  });

  // Sort: location tier first, then sponsored within tier, then by score, then alphabetically
  rankedCoaches.sort((a, b) => {
    // First: sort by location match level (closer locations first)
    const locationPriorityA = LOCATION_LEVEL_PRIORITY[a.ranking.matchLevel];
    const locationPriorityB = LOCATION_LEVEL_PRIORITY[b.ranking.matchLevel];
    if (locationPriorityA !== locationPriorityB) {
      return locationPriorityA - locationPriorityB;
    }

    // Within same location tier: sponsored coaches first
    if (a.ranking.isSponsored && !b.ranking.isSponsored) return -1;
    if (!a.ranking.isSponsored && b.ranking.isSponsored) return 1;

    // Within same sponsorship status, sort by total score
    if (a.ranking.totalScore !== b.ranking.totalScore) {
      return b.ranking.totalScore - a.ranking.totalScore;
    }

    // Deterministic tiebreaker: alphabetical by display name
    const nameA = (a.coach.display_name ?? '').toLowerCase();
    const nameB = (b.coach.display_name ?? '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return rankedCoaches;
}

/**
 * Filters coaches by location match level, expanding radius as needed
 * 
 * IMPORTANT: This function now ALWAYS includes all coaches within the same country.
 * The minResults threshold is used to determine the "effective match level" for display
 * purposes only, but coaches are never hidden from the country results.
 * 
 * This ensures that when filtering by country (e.g., Poland), users see ALL Polish coaches,
 * with local/city coaches sorted first and broader country results following.
 * 
 * @param rankedCoaches - Pre-ranked coaches (already sorted by location tier, then score)
 * @param minResults - Minimum results before stopping expansion (for display messaging only)
 * @param strictCountryFilter - If true (default), only include coaches within same_country or closer
 * @returns All coaches within allowed levels, with effective match level for UI messaging
 */
export function filterByLocationWithExpansion<T>(
  rankedCoaches: RankedCoach<T>[],
  minResults: number = MIN_RESULTS_BEFORE_EXPANSION,
  strictCountryFilter: boolean = true
): { 
  coaches: RankedCoach<T>[]; 
  effectiveMatchLevel: LocationMatchLevel;
  expanded: boolean;
} {
  // Define which levels are allowed (in strict mode, never show foreign/unmatched coaches)
  const allowedLevels: LocationMatchLevel[] = strictCountryFilter 
    ? ['exact_city', 'same_region', 'same_country']
    : ['exact_city', 'same_region', 'same_country', 'online_only', 'no_match'];
  
  // Filter to only include coaches within allowed levels
  // This ensures we NEVER hide country-level coaches when user has a city
  const filteredCoaches = rankedCoaches.filter(rc => 
    allowedLevels.includes(rc.ranking.matchLevel)
  );

  // Determine effective match level for UI messaging (based on where most results come from)
  // This is for display only - we still show ALL coaches within the country
  let effectiveMatchLevel: LocationMatchLevel = 'same_country';
  
  for (const level of ['exact_city', 'same_region', 'same_country'] as LocationMatchLevel[]) {
    const countAtLevel = filteredCoaches.filter(rc => {
      const levelIndex = allowedLevels.indexOf(rc.ranking.matchLevel);
      const targetIndex = allowedLevels.indexOf(level);
      return levelIndex !== -1 && levelIndex <= targetIndex;
    }).length;

    if (countAtLevel >= minResults) {
      effectiveMatchLevel = level;
      break;
    }
  }

  return {
    coaches: filteredCoaches,
    effectiveMatchLevel,
    expanded: effectiveMatchLevel !== 'exact_city',
  };
}

/**
 * Gets a human-readable description of the match level
 */
export function getMatchLevelDescription(level: LocationMatchLevel): string {
  switch (level) {
    case 'exact_city':
      return 'In your city';
    case 'same_region':
      return 'In your region';
    case 'same_country':
      return 'In your country';
    case 'online_only':
      return 'Available online';
    case 'no_match':
      return 'All coaches';
    default:
      return 'Nearby';
  }
}
