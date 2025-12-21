/**
 * Marketplace Ranking Types
 * 
 * Defines the scoring system for coach marketplace rankings.
 * Location proximity is weighted highest (50%), followed by engagement (30%) and profile completeness (20%).
 */

export type LocationMatchLevel = 
  | 'exact_city'      // Same city (e.g., "Harrow" matches "Harrow")
  | 'same_region'     // Same region/county (e.g., "Greater London", "England")
  | 'same_country'    // Same country (e.g., "United Kingdom")
  | 'online_only'     // Coach only offers online (no location penalty)
  | 'no_match';       // Different country or no location data

export interface LocationData {
  city: string | null;
  region: string | null;
  county?: string | null;
  country: string | null;
  /** ISO 3166-1 alpha-2 country code (e.g., 'GB', 'PL') */
  countryCode?: string | null;
}

export interface CoachLocationData {
  location_city: string | null;
  location_region: string | null;
  location_country: string | null;
  online_available: boolean | null;
  in_person_available: boolean | null;
}

export interface CoachEngagementData {
  coach_id: string;
  review_count: number;
  avg_rating: number | null;
  session_count: number;
  last_session_at: string | null;
}

export interface CoachProfileData {
  bio: string | null;
  profile_image_url: string | null;
  card_image_url: string | null;
  coach_types: string[] | null;
  hourly_rate: number | null;
  location: string | null;
  certifications: unknown | null;
  is_verified: boolean | null;
}

export interface RankingScore {
  /** Location proximity score (0-100) */
  locationScore: number;
  /** Engagement signals score (0-100) */
  engagementScore: number;
  /** Profile completeness score (0-100) */
  profileScore: number;
  /** Weighted combination of all scores */
  totalScore: number;
  /** Human-readable proximity level */
  matchLevel: LocationMatchLevel;
  /** Whether coach is using sponsored placement */
  isSponsored: boolean;
}

export interface RankedCoach<T> {
  coach: T;
  ranking: RankingScore;
}

/**
 * Scoring weights for the ranking algorithm
 * These determine how much each factor contributes to the final score
 */
export const RANKING_WEIGHTS = {
  location: 0.50,    // 50% weight - proximity is most important
  engagement: 0.30,  // 30% weight - social proof
  profile: 0.20,     // 20% weight - completeness
} as const;

/**
 * Location match scores by proximity level
 */
export const LOCATION_SCORES: Record<LocationMatchLevel, number> = {
  exact_city: 100,
  same_region: 70,
  same_country: 40,
  online_only: 30,
  no_match: 10,
} as const;

/**
 * Minimum results before expanding location search radius
 */
export const MIN_RESULTS_BEFORE_EXPANSION = 5;
