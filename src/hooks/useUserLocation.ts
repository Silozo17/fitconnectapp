import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CONSENT_STORAGE_KEY, CookieConsent } from "@/types/consent";
import { LocationData } from "@/types/ranking";

const LOCATION_STORAGE_KEY = "fitconnect_user_location";
const LOCATION_EXPIRY_DAYS = 7;

interface StoredLocation {
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  county: string | null;
  timestamp: number;
}

interface UseUserLocationReturn {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  clearLocation: () => void;
}

// Helper to check if location consent is granted
const hasLocationConsent = (): boolean => {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return false;
    const consent = JSON.parse(stored) as CookieConsent;
    return consent.location === true;
  } catch {
    return false;
  }
};

export const useUserLocation = (): UseUserLocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectLocation = async () => {
      // Check if user has given consent for location cookies
      if (!hasLocationConsent()) {
        // No consent - return without location data
        setLocation(null);
        setIsLoading(false);
        setError(null);
        return;
      }

      // Check localStorage first (only if consent granted)
      const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (stored) {
        try {
          const parsed: StoredLocation = JSON.parse(stored);
          const expiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
          if (Date.now() - parsed.timestamp < expiryTime) {
            setLocation({
              city: parsed.city,
              region: parsed.region,
              country: parsed.country,
              countryCode: parsed.countryCode,
              county: parsed.county,
            });
            setIsLoading(false);
            setError(null);
            return;
          }
        } catch {
          localStorage.removeItem(LOCATION_STORAGE_KEY);
        }
      }

      // Use edge function for geolocation
      try {
        const { data, error: fetchError } = await supabase.functions.invoke('get-user-location');
        
        if (fetchError) throw fetchError;
        
        const locationData: LocationData = {
          city: data?.city || null,
          region: data?.region || null,
          country: data?.country || null,
          countryCode: data?.countryCode || null,
          county: data?.county || null,
        };

        // Store in localStorage
        const toStore: StoredLocation = {
          city: locationData.city,
          region: locationData.region,
          country: locationData.country,
          countryCode: locationData.countryCode ?? null,
          county: locationData.county ?? null,
          timestamp: Date.now(),
        };
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(toStore));

        setLocation(locationData);
        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error('Location detection failed:', err);
        // Default to UK if detection fails
        setLocation({
          city: null,
          region: null,
          country: "United Kingdom",
          countryCode: "GB",
          county: null,
        });
        setIsLoading(false);
        setError(null);
      }
    };

    detectLocation();
  }, []);

  const clearLocation = () => {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
    setLocation(null);
    setIsLoading(false);
    setError(null);
  };

  return { location, isLoading, error, clearLocation };
};
