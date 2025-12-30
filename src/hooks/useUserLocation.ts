import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CONSENT_STORAGE_KEY, CookieConsent } from "@/types/consent";
import { LocationAccuracyLevel } from "@/types/location";
import { useAuth } from "@/contexts/AuthContext";

const MANUAL_LOCATION_KEY = "fitconnect_manual_location";
const SESSION_PRECISE_KEY = "fitconnect_session_precise_location";
const PROMPT_DISMISSED_KEY = "fitconnect_location_prompt_dismissed";
const LOCATION_EXPIRY_DAYS = 7;
const GEO_TIMEOUT_MS = 10000; // 10 seconds for precise location

interface LocationData {
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  county: string | null;
  displayLocation: string | null;
  accuracyLevel: LocationAccuracyLevel;
}

interface StoredManualLocation {
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  county: string | null;
  displayLocation: string | null;
  timestamp: number;
}

interface UseUserLocationReturn {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  accuracyLevel: LocationAccuracyLevel | null;
  isRequestingPrecise: boolean;
  shouldShowLocationPrompt: boolean;
  requestPreciseLocation: () => Promise<boolean>;
  setManualLocation: (location: Partial<LocationData>) => void;
  clearLocation: () => void;
  dismissLocationPrompt: () => void;
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

// Get stored manual location
const getStoredManualLocation = (): StoredManualLocation | null => {
  try {
    const stored = localStorage.getItem(MANUAL_LOCATION_KEY);
    if (!stored) return null;
    const parsed: StoredManualLocation = JSON.parse(stored);
    const expiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.timestamp < expiryTime) {
      return parsed;
    }
    localStorage.removeItem(MANUAL_LOCATION_KEY);
    return null;
  } catch {
    localStorage.removeItem(MANUAL_LOCATION_KEY);
    return null;
  }
};

// Get session-stored precise location (survives page navigations but clears on browser close)
const getSessionPreciseLocation = (): LocationData | null => {
  try {
    const stored = sessionStorage.getItem(SESSION_PRECISE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as LocationData;
  } catch {
    return null;
  }
};

// Check if location prompt was dismissed this session
const isPromptDismissed = (): boolean => {
  return sessionStorage.getItem(PROMPT_DISMISSED_KEY) === 'true';
};

export const useUserLocation = (): UseUserLocationReturn => {
  const { user } = useAuth();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequestingPrecise, setIsRequestingPrecise] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(() => isPromptDismissed());
  
  // Memory-only precise location for logged-out users (GDPR compliant)
  // Also check sessionStorage for persistence across page navigations
  const [memoryPreciseLocation, setMemoryPreciseLocation] = useState<LocationData | null>(
    () => getSessionPreciseLocation()
  );

  // Default UK location (approximate - no city shown)
  const defaultLocation: LocationData = {
    city: null,
    region: null,
    country: "United Kingdom",
    countryCode: "GB",
    county: null,
    displayLocation: null,
    accuracyLevel: 'approximate',
  };

  // Initialize location on mount
  useEffect(() => {
    let isMounted = true;

    const initLocation = async () => {
      // 1. Check for manual location first (always respected)
      const manualLocation = getStoredManualLocation();
      if (manualLocation) {
        if (isMounted) {
          setLocation({
            city: manualLocation.city,
            region: manualLocation.region,
            country: manualLocation.country,
            countryCode: manualLocation.countryCode,
            county: manualLocation.county,
            displayLocation: manualLocation.displayLocation || manualLocation.city,
            accuracyLevel: 'manual',
          });
          setIsLoading(false);
        }
        return;
      }

      // 2. Check for memory precise location (logged-out users who granted permission this session)
      if (memoryPreciseLocation) {
        if (isMounted) {
          setLocation(memoryPreciseLocation);
          setIsLoading(false);
        }
        return;
      }

      // 3. For logged-in users, check their profile for stored precise location
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('client_profiles')
            .select('city, county, country, location_accuracy, location_lat, location_lng')
            .eq('user_id', user.id)
            .maybeSingle();

          if (profile?.location_accuracy === 'precise' && profile.city) {
            if (isMounted) {
              setLocation({
                city: profile.city,
                region: null,
                country: profile.country,
                countryCode: null,
                county: profile.county,
                displayLocation: profile.city || profile.county,
                accuracyLevel: 'precise',
              });
              setIsLoading(false);
            }
            return;
          }
        } catch (err) {
          console.error('Error fetching user profile location:', err);
        }
      }

      // 4. Check consent for IP-based detection
      if (!hasLocationConsent()) {
        if (isMounted) {
          setLocation(defaultLocation);
          setIsLoading(false);
        }
        return;
      }

      // 5. Use IP-based geolocation (country/region only - no city for approximate)
      try {
        const { data, error: fetchError } = await supabase.functions.invoke('get-user-location');
        
        if (fetchError) throw fetchError;
        
        // For IP-based (approximate), we don't show city to avoid inaccuracy
        if (isMounted) {
          setLocation({
            city: null, // Don't show IP-based city (inaccurate)
            region: data?.region || null,
            country: data?.country || "United Kingdom",
            countryCode: data?.countryCode || "GB",
            county: null,
            displayLocation: null, // No display location for approximate
            accuracyLevel: 'approximate',
          });
          setIsLoading(false);
        }
      } catch (err) {
        console.error('IP location detection failed:', err);
        if (isMounted) {
          setLocation(defaultLocation);
          setIsLoading(false);
        }
      }
    };

    // Timeout fallback
    const timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        setLocation(defaultLocation);
        setIsLoading(false);
      }
    }, GEO_TIMEOUT_MS);

    initLocation();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [user, memoryPreciseLocation]);

  /**
   * Request precise location using browser geolocation API
   * Only called on explicit user action (GDPR compliant)
   */
  const requestPreciseLocation = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return false;
    }

    setIsRequestingPrecise(true);
    setError(null);

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        setIsRequestingPrecise(false);
        setError('Location request timed out');
        resolve(false);
      }, GEO_TIMEOUT_MS);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(timeoutId);
          
          try {
            const { latitude, longitude } = position.coords;
            
            // Call reverse geocode edge function
            const { data, error: geocodeError } = await supabase.functions.invoke('reverse-geocode', {
              body: { lat: latitude, lng: longitude }
            });

            if (geocodeError) throw geocodeError;

            const preciseLocation: LocationData = {
              city: data?.city || null,
              region: null,
              country: data?.country || null,
              countryCode: data?.countryCode || null,
              county: data?.county || null,
              displayLocation: data?.displayLocation || data?.city || data?.county,
              accuracyLevel: 'precise',
            };

            // If logged in, save to profile (private columns)
            if (user) {
              await supabase
                .from('client_profiles')
                .update({
                  city: preciseLocation.city,
                  county: preciseLocation.county,
                  country: preciseLocation.country,
                  location_lat: latitude,
                  location_lng: longitude,
                  location_accuracy: 'precise',
                  location_confidence: data?.locationType || null,
                })
                .eq('user_id', user.id);
            } else {
              // For logged-out users, store in memory and sessionStorage (GDPR compliant)
              setMemoryPreciseLocation(preciseLocation);
              sessionStorage.setItem(SESSION_PRECISE_KEY, JSON.stringify(preciseLocation));
            }

            setLocation(preciseLocation);
            setIsRequestingPrecise(false);
            resolve(true);
          } catch (err) {
            console.error('Reverse geocoding failed:', err);
            setIsRequestingPrecise(false);
            setError('Could not determine your location');
            resolve(false);
          }
        },
        (positionError) => {
          clearTimeout(timeoutId);
          setIsRequestingPrecise(false);
          
          switch (positionError.code) {
            case positionError.PERMISSION_DENIED:
              setError('Location permission denied');
              break;
            case positionError.POSITION_UNAVAILABLE:
              setError('Location unavailable');
              break;
            case positionError.TIMEOUT:
              setError('Location request timed out');
              break;
            default:
              setError('Could not get your location');
          }
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: GEO_TIMEOUT_MS,
          maximumAge: 0,
        }
      );
    });
  }, [user]);

  /**
   * Set manual location (always persists to localStorage)
   */
  const setManualLocation = useCallback((newLocation: Partial<LocationData>) => {
    const manualLocation: LocationData = {
      city: newLocation.city || null,
      region: newLocation.region || null,
      country: newLocation.country || null,
      countryCode: newLocation.countryCode || null,
      county: newLocation.county || null,
      displayLocation: newLocation.displayLocation || newLocation.city || newLocation.county,
      accuracyLevel: 'manual',
    };

    // Store in localStorage
    const toStore: StoredManualLocation = {
      ...manualLocation,
      timestamp: Date.now(),
    };
    localStorage.setItem(MANUAL_LOCATION_KEY, JSON.stringify(toStore));

    // Also update profile if logged in
    if (user) {
      supabase
        .from('client_profiles')
        .update({
          city: manualLocation.city,
          county: manualLocation.county,
          country: manualLocation.country,
          location_accuracy: 'manual',
        })
        .eq('user_id', user.id)
        .then(() => {});
    }

    setLocation(manualLocation);
    setMemoryPreciseLocation(null); // Clear memory precise location
    setError(null);
  }, [user]);

  /**
   * Clear stored location
   */
  const clearLocation = useCallback(() => {
    localStorage.removeItem(MANUAL_LOCATION_KEY);
    sessionStorage.removeItem(SESSION_PRECISE_KEY);
    setMemoryPreciseLocation(null);
    setLocation(defaultLocation);
    setError(null);
  }, []);

  /**
   * Dismiss location prompt for this session
   */
  const dismissLocationPrompt = useCallback(() => {
    sessionStorage.setItem(PROMPT_DISMISSED_KEY, 'true');
    setPromptDismissed(true);
  }, []);

  // Show prompt when: has approximate location, not dismissed, and not loading
  const shouldShowLocationPrompt = 
    !isLoading && 
    !promptDismissed && 
    location?.accuracyLevel === 'approximate';

  return {
    location,
    isLoading,
    error,
    accuracyLevel: location?.accuracyLevel || null,
    isRequestingPrecise,
    shouldShowLocationPrompt,
    requestPreciseLocation,
    setManualLocation,
    clearLocation,
    dismissLocationPrompt,
  };
};
