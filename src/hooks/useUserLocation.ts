import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LocationData {
  city: string | null;
  region: string | null;
  country: string | null;
  county: string | null;
  isLoading: boolean;
  error: string | null;
}

const LOCATION_STORAGE_KEY = "fitconnect_user_location";
const LOCATION_EXPIRY_DAYS = 7;

interface StoredLocation {
  city: string | null;
  region: string | null;
  country: string | null;
  county: string | null;
  timestamp: number;
}

export const useUserLocation = () => {
  const [location, setLocation] = useState<LocationData>({
    city: null,
    region: null,
    country: null,
    county: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const detectLocation = async () => {
      // Check localStorage first
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
              county: parsed.county,
              isLoading: false,
              error: null,
            });
            return;
          }
        } catch {
          localStorage.removeItem(LOCATION_STORAGE_KEY);
        }
      }

      // Use edge function for geolocation
      try {
        const { data, error } = await supabase.functions.invoke('get-user-location');
        
        if (error) throw error;
        
        const locationData = {
          city: data?.city || null,
          region: data?.region || null,
          country: data?.country || null,
          county: data?.county || null,
        };

        // Store in localStorage
        const toStore: StoredLocation = {
          ...locationData,
          timestamp: Date.now(),
        };
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(toStore));

        setLocation({
          ...locationData,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Location detection failed:', error);
        // Default to UK if detection fails
        setLocation({
          city: null,
          region: null,
          country: "United Kingdom",
          county: null,
          isLoading: false,
          error: null,
        });
      }
    };

    detectLocation();
  }, []);

  const clearLocation = () => {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
    setLocation({
      city: null,
      region: null,
      country: null,
      county: null,
      isLoading: false,
      error: null,
    });
  };

  return { ...location, clearLocation };
};
