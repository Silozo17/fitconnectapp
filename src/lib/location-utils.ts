/**
 * Location utilities for coach profiles
 * Single source of truth: Google Places API-derived structured fields
 * with fallback to legacy freetext location field
 */

interface CoachLocationFields {
  location?: string | null;
  location_city?: string | null;
  location_region?: string | null;
  location_country?: string | null;
  location_country_code?: string | null;
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
    const normalized = coach.location.toLowerCase().trim();
    
    // Common country name to code mappings
    const countryMap: Record<string, string> = {
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
    
    // Check if the location ends with a known country
    for (const [countryName, code] of Object.entries(countryMap)) {
      if (normalized.endsWith(countryName) || normalized.includes(`, ${countryName}`)) {
        return code;
      }
    }
  }
  
  return null;
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
 * - Coach has matching country_code
 * - Coach has no country_code (legacy - include for visibility)
 * - Coach's parsed legacy location matches the country
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
  
  // Prefer structured data
  if (coach.location_country_code) {
    return coach.location_country_code.toUpperCase() === normalizedFilter;
  }
  
  // Legacy coaches without structured data - include them
  // (they may be in the right country, we just don't know)
  // This ensures legacy coaches remain visible
  return true;
}
