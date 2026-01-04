/**
 * Canonical Location Types
 * 
 * Consolidates location-related type definitions to eliminate duplicates.
 * Different interfaces serve different purposes:
 * - UserLocationData: For user geolocation (rankings, marketplace filtering)
 * - PlaceLocationData: For Google Places API results (location autocomplete)
 * - CoachLocationFields: For coach location fields stored in database
 */

/**
 * Location accuracy levels (user-friendly labels)
 * - 'approximate': IP-based detection (country/region only, no city)
 * - 'precise': Browser geolocation with reverse geocoding (GPS)
 * - 'manual': User manually selected location
 */
export type LocationAccuracyLevel = 'approximate' | 'precise' | 'manual';

/**
 * User geolocation data for rankings and marketplace filtering.
 * Used by the ranking system and leaderboard.
 */
export interface UserLocationData {
  city: string | null;
  region: string | null;
  county?: string | null;
  country: string | null;
  /** ISO 3166-1 alpha-2 country code (e.g., 'GB', 'PL') */
  countryCode?: string | null;
  /** Location accuracy level */
  accuracyLevel?: LocationAccuracyLevel;
  /** Display location (may be county if city confidence is low) */
  displayLocation?: string | null;
  /** Latitude coordinate (for distance-based ranking) */
  lat?: number | null;
  /** Longitude coordinate (for distance-based ranking) */
  lng?: number | null;
}

/**
 * Google Places API result data.
 * Used by LocationAutocomplete component.
 * Supports both snake_case (API) and camelCase (internal) formats.
 */
export interface PlaceLocationData {
  place_id?: string;
  formatted_address?: string;
  formattedAddress?: string;
  city?: string | null;
  region?: string | null;
  county?: string | null;
  country?: string | null;
  country_code?: string | null;
  countryCode?: string | null;
  lat?: number;
  lng?: number;
}

/**
 * Coach location fields as stored in the database.
 * Matches coach_profiles table columns.
 */
export interface CoachLocationFields {
  location?: string | null;
  location_city?: string | null;
  location_region?: string | null;
  location_country?: string | null;
  location_country_code?: string | null;
}

/**
 * Coach location data for marketplace ranking.
 * Subset of coach profile used by ranking algorithm.
 */
export interface CoachLocationData {
  location_city: string | null;
  location_region: string | null;
  location_country: string | null;
  online_available: boolean | null;
  in_person_available: boolean | null;
}
