import { useState, useEffect, useCallback } from "react";
import { LocationData } from "@/types/ranking";
import { RouteLocationCode, SUPPORTED_LOCATIONS } from "@/lib/locale-routing";
import { getCountryCodeFromName } from "@/lib/location-utils";

const STORAGE_KEY = "fitconnect_marketplace_location_filter";

interface StoredLocationFilter {
  city: string | null;
  region: string | null;
  county: string | null;
  country: string | null;
  countryCode: RouteLocationCode | null;
  displayLocation?: string | null;
  lat?: number | null;
  lng?: number | null;
}

interface MarketplaceLocationFilter {
  /** The manually selected location (null if using auto-detection) */
  manualLocation: LocationData | null;
  /** The country code from manual selection */
  manualCountryCode: RouteLocationCode | null;
  /** Whether a manual location is currently set */
  isManualSelection: boolean;
  /** Set a manual location override */
  setManualLocation: (location: LocationData) => void;
  /** Set just the country code (for country-only filter) */
  setManualCountryCode: (code: RouteLocationCode) => void;
  /** Clear manual selection and revert to auto-detection */
  clearManualLocation: () => void;
}

/**
 * Derives country code from a country name or returns null
 */
function deriveCountryCode(country: string | null): RouteLocationCode | null {
  if (!country) return null;
  const code = getCountryCodeFromName(country);
  if (code && SUPPORTED_LOCATIONS.includes(code as RouteLocationCode)) {
    return code as RouteLocationCode;
  }
  return null;
}

/**
 * Hook to manage manual location filter for the marketplace.
 * Persists selection in sessionStorage (clears when browser closes).
 * Works independently of cookie consent since it's an explicit user action.
 */
export function useMarketplaceLocationFilter(): MarketplaceLocationFilter {
  const [manualLocation, setManualLocationState] = useState<LocationData | null>(() => {
    // Initialize from sessionStorage
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredLocationFilter = JSON.parse(stored);
        // Only restore if there's meaningful location data (city or region)
        if (parsed.city || parsed.region) {
          return {
            city: parsed.city,
            region: parsed.region,
            county: parsed.county,
            country: parsed.country,
            countryCode: parsed.countryCode ?? undefined,
            displayLocation: parsed.displayLocation ?? undefined,
            lat: parsed.lat ?? undefined,
            lng: parsed.lng ?? undefined,
          };
        }
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  });

  const [manualCountryCode, setManualCountryCodeState] = useState<RouteLocationCode | null>(() => {
    // Initialize from sessionStorage
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredLocationFilter = JSON.parse(stored);
        return parsed.countryCode ?? deriveCountryCode(parsed.country);
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  });

  // Persist to sessionStorage when manual location changes
  useEffect(() => {
    if (manualLocation || manualCountryCode) {
      const toStore: StoredLocationFilter = {
        city: manualLocation?.city ?? null,
        region: manualLocation?.region ?? null,
        county: manualLocation?.county ?? null,
        country: manualLocation?.country ?? null,
        countryCode: manualCountryCode ?? deriveCountryCode(manualLocation?.country ?? null),
        displayLocation: manualLocation?.displayLocation ?? null,
        lat: manualLocation?.lat ?? null,
        lng: manualLocation?.lng ?? null,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [manualLocation, manualCountryCode]);

  const setManualLocation = useCallback((location: LocationData) => {
    setManualLocationState(location);
    // Use explicit countryCode if available, otherwise derive from country name
    const explicitCode = location.countryCode?.toUpperCase() as RouteLocationCode | undefined;
    if (explicitCode && SUPPORTED_LOCATIONS.includes(explicitCode)) {
      setManualCountryCodeState(explicitCode);
    } else {
      const derivedCode = deriveCountryCode(location.country);
      if (derivedCode) {
        setManualCountryCodeState(derivedCode);
      }
    }
  }, []);

  const setManualCountryCode = useCallback((code: RouteLocationCode) => {
    setManualCountryCodeState(code);
    // Don't clear location - allows for city within country filtering
  }, []);

  const clearManualLocation = useCallback(() => {
    setManualLocationState(null);
    setManualCountryCodeState(null);
  }, []);

  return {
    manualLocation,
    manualCountryCode,
    isManualSelection: manualLocation !== null || manualCountryCode !== null,
    setManualLocation,
    setManualCountryCode,
    clearManualLocation,
  };
}
