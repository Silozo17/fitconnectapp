import { useState, useEffect, useCallback } from "react";
import { LocationData } from "@/types/ranking";

const STORAGE_KEY = "fitconnect_marketplace_location_filter";

interface StoredLocationFilter {
  city: string | null;
  region: string | null;
  county: string | null;
  country: string | null;
}

interface MarketplaceLocationFilter {
  /** The manually selected location (null if using auto-detection) */
  manualLocation: LocationData | null;
  /** Whether a manual location is currently set */
  isManualSelection: boolean;
  /** Set a manual location override */
  setManualLocation: (location: LocationData) => void;
  /** Clear manual selection and revert to auto-detection */
  clearManualLocation: () => void;
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
        return {
          city: parsed.city,
          region: parsed.region,
          county: parsed.county,
          country: parsed.country,
        };
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  });

  // Persist to sessionStorage when manual location changes
  useEffect(() => {
    if (manualLocation) {
      const toStore: StoredLocationFilter = {
        city: manualLocation.city,
        region: manualLocation.region,
        county: manualLocation.county ?? null,
        country: manualLocation.country,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [manualLocation]);

  const setManualLocation = useCallback((location: LocationData) => {
    setManualLocationState(location);
  }, []);

  const clearManualLocation = useCallback(() => {
    setManualLocationState(null);
  }, []);

  return {
    manualLocation,
    isManualSelection: manualLocation !== null,
    setManualLocation,
    clearManualLocation,
  };
}
