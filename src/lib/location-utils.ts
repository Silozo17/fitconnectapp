/**
 * Location utilities for coach profiles
 * Single source of truth: Google Places API-derived structured fields
 * with fallback to legacy freetext location field
 */

export interface CoachLocationFields {
  location?: string | null;
  location_city?: string | null;
  location_region?: string | null;
  location_country?: string | null;
  location_country_code?: string | null;
}

export interface ParsedLegacyLocation {
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
}

/**
 * Common country name to code mappings for legacy location parsing
 */
const COUNTRY_MAP: Record<string, string> = {
  // UK variations
  'united kingdom': 'GB',
  'uk': 'GB',
  'england': 'GB',
  'scotland': 'GB',
  'wales': 'GB',
  'northern ireland': 'GB',
  'great britain': 'GB',
  // US variations
  'united states': 'US',
  'usa': 'US',
  'us': 'US',
  'america': 'US',
  // European countries
  'poland': 'PL',
  'germany': 'DE',
  'france': 'FR',
  'spain': 'ES',
  'italy': 'IT',
  'netherlands': 'NL',
  'belgium': 'BE',
  'portugal': 'PT',
  'ireland': 'IE',
  'sweden': 'SE',
  'norway': 'NO',
  'denmark': 'DK',
  'finland': 'FI',
  'austria': 'AT',
  'switzerland': 'CH',
  'greece': 'GR',
  'czech republic': 'CZ',
  'czechia': 'CZ',
  'hungary': 'HU',
  'romania': 'RO',
  'bulgaria': 'BG',
  // Other common countries
  'canada': 'CA',
  'australia': 'AU',
  'new zealand': 'NZ',
  'japan': 'JP',
  'china': 'CN',
  'india': 'IN',
  'brazil': 'BR',
  'mexico': 'MX',
  'south africa': 'ZA',
  'uae': 'AE',
  'united arab emirates': 'AE',
  'singapore': 'SG',
};

/**
 * Reverse mapping: country code to full name
 */
const CODE_TO_COUNTRY: Record<string, string> = {
  'GB': 'United Kingdom',
  'US': 'United States',
  'PL': 'Poland',
  'DE': 'Germany',
  'FR': 'France',
  'ES': 'Spain',
  'IT': 'Italy',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'PT': 'Portugal',
  'IE': 'Ireland',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'AT': 'Austria',
  'CH': 'Switzerland',
  'GR': 'Greece',
  'CZ': 'Czech Republic',
  'HU': 'Hungary',
  'RO': 'Romania',
  'BG': 'Bulgaria',
  'CA': 'Canada',
  'AU': 'Australia',
  'NZ': 'New Zealand',
  'JP': 'Japan',
  'CN': 'China',
  'IN': 'India',
  'BR': 'Brazil',
  'MX': 'Mexico',
  'ZA': 'South Africa',
  'AE': 'United Arab Emirates',
  'SG': 'Singapore',
};

/**
 * Parses a legacy freetext location string into structured components
 * Examples:
 *   "High Wycombe" → { city: "High Wycombe", country: null }
 *   "London, United Kingdom" → { city: "London", country: "United Kingdom", countryCode: "GB" }
 *   "Rzeszów, Poland" → { city: "Rzeszów", country: "Poland", countryCode: "PL" }
 */
export function parseLegacyLocation(location: string | null | undefined): ParsedLegacyLocation {
  if (!location || !location.trim()) {
    return { city: null, region: null, country: null, countryCode: null };
  }

  const trimmed = location.trim();
  const parts = trimmed.split(',').map(p => p.trim()).filter(Boolean);
  
  if (parts.length === 0) {
    return { city: null, region: null, country: null, countryCode: null };
  }

  // Single part - assume it's a city
  if (parts.length === 1) {
    // Check if it's actually a country name
    const normalized = parts[0].toLowerCase();
    if (COUNTRY_MAP[normalized]) {
      return {
        city: null,
        region: null,
        country: parts[0],
        countryCode: COUNTRY_MAP[normalized],
      };
    }
    return { city: parts[0], region: null, country: null, countryCode: null };
  }

  // Two or more parts: first is city, last is country, middle might be region
  const city = parts[0];
  const lastPart = parts[parts.length - 1];
  const normalizedLast = lastPart.toLowerCase();
  
  // Check if last part is a known country
  const countryCode = COUNTRY_MAP[normalizedLast] || null;
  const country = countryCode ? lastPart : null;
  
  // If we have 3+ parts and last is country, middle parts are region
  const region = parts.length >= 3 && country ? parts.slice(1, -1).join(', ') : null;

  return {
    city,
    region,
    country,
    countryCode,
  };
}

/**
 * Returns a display-friendly location string for a coach
 * Prefers structured Google Places data, falls back to legacy freetext
 */
export function getDisplayLocation(coach: CoachLocationFields): string {
  // Prefer structured data
  if (coach.location_city) {
    if (coach.location_country) {
      return `${coach.location_city}, ${coach.location_country}`;
    }
    return coach.location_city;
  }
  
  // Fall back to legacy freetext
  return coach.location || "Location not set";
}

/**
 * Returns the country code for a coach, with fallback parsing from legacy location
 * Used for country filtering in marketplace
 */
export function getCountryCode(coach: CoachLocationFields): string | null {
  // Prefer structured country code
  if (coach.location_country_code) {
    return coach.location_country_code.toUpperCase();
  }
  
  // Attempt to parse from legacy location string
  if (coach.location) {
    const parsed = parseLegacyLocation(coach.location);
    return parsed.countryCode;
  }
  
  return null;
}

/**
 * Returns the city from structured data or parsed legacy location
 */
export function getLocationCity(coach: CoachLocationFields): string | null {
  if (coach.location_city) {
    return coach.location_city;
  }
  
  if (coach.location) {
    const parsed = parseLegacyLocation(coach.location);
    return parsed.city;
  }
  
  return null;
}

/**
 * Returns the region from structured data or parsed legacy location
 */
export function getLocationRegion(coach: CoachLocationFields): string | null {
  if (coach.location_region) {
    return coach.location_region;
  }
  
  if (coach.location) {
    const parsed = parseLegacyLocation(coach.location);
    return parsed.region;
  }
  
  return null;
}

/**
 * Returns the country from structured data or parsed legacy location
 */
export function getLocationCountry(coach: CoachLocationFields): string | null {
  if (coach.location_country) {
    return coach.location_country;
  }
  
  // Try to derive from country code
  if (coach.location_country_code) {
    return CODE_TO_COUNTRY[coach.location_country_code.toUpperCase()] || null;
  }
  
  if (coach.location) {
    const parsed = parseLegacyLocation(coach.location);
    return parsed.country;
  }
  
  return null;
}

/**
 * Returns a complete structured location object with fallbacks from legacy data
 * Useful for ranking algorithm and display
 */
export function getStructuredLocationWithFallbacks(coach: CoachLocationFields): {
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  hasStructuredData: boolean;
} {
  // If we have structured data, use it
  if (coach.location_city || coach.location_country_code) {
    return {
      city: coach.location_city || null,
      region: coach.location_region || null,
      country: coach.location_country || (coach.location_country_code ? CODE_TO_COUNTRY[coach.location_country_code.toUpperCase()] : null) || null,
      countryCode: coach.location_country_code?.toUpperCase() || null,
      hasStructuredData: true,
    };
  }
  
  // Parse from legacy location
  const parsed = parseLegacyLocation(coach.location);
  return {
    city: parsed.city,
    region: parsed.region,
    country: parsed.country,
    countryCode: parsed.countryCode,
    hasStructuredData: false,
  };
}

/**
 * Checks if a coach has structured location data (from Google Places)
 */
export function hasStructuredLocation(coach: CoachLocationFields): boolean {
  return !!(coach.location_city || coach.location_country_code);
}

/**
 * Checks if a coach matches a country filter
 * Returns true if:
 * - Coach has matching country_code (structured or parsed from legacy)
 * - Coach has no determinable country (legacy - include for visibility)
 */
export function matchesCountryFilter(
  coach: CoachLocationFields,
  countryCode: string | null | undefined
): boolean {
  // No filter = all coaches match
  if (!countryCode) {
    return true;
  }
  
  const normalizedFilter = countryCode.toUpperCase();
  
  // Get country code from structured or parsed legacy
  const coachCountryCode = getCountryCode(coach);
  
  if (coachCountryCode) {
    return coachCountryCode === normalizedFilter;
  }
  
  // Legacy coaches without determinable country - include them
  // (they may be in the right country, we just don't know)
  // This ensures legacy coaches remain visible
  return true;
}
