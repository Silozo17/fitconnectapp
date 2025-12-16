import { useState, useEffect } from "react";

interface LocationData {
  city: string | null;
  region: string | null;
  country: string | null;
  isLoading: boolean;
  error: string | null;
}

const LOCATION_STORAGE_KEY = "fitconnect_user_location";
const LOCATION_EXPIRY_DAYS = 7;

interface StoredLocation {
  city: string | null;
  region: string | null;
  country: string | null;
  timestamp: number;
}

export const useUserLocation = () => {
  const [location, setLocation] = useState<LocationData>({
    city: null,
    region: null,
    country: null,
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
              isLoading: false,
              error: null,
            });
            return;
          }
        } catch {
          localStorage.removeItem(LOCATION_STORAGE_KEY);
        }
      }

      // Try IP-based geolocation
      try {
        const response = await fetch("https://ip-api.com/json/?fields=city,regionName,country");
        if (!response.ok) throw new Error("Failed to fetch location");
        
        const data = await response.json();
        const locationData = {
          city: data.city || null,
          region: data.regionName || null,
          country: data.country || null,
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
        // Default to UK if detection fails
        setLocation({
          city: null,
          region: null,
          country: "United Kingdom",
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
      isLoading: false,
      error: null,
    });
  };

  return { ...location, clearLocation };
};
