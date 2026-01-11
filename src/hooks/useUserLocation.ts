import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CONSENT_STORAGE_KEY, CookieConsent } from "@/types/consent";
import { LocationAccuracyLevel } from "@/types/location";
import { useAuthSafe } from "@/contexts/AuthContext";
import { STORAGE_KEYS, setStorage } from "@/lib/storage-keys";

const MANUAL_LOCATION_KEY = STORAGE_KEYS.MANUAL_LOCATION;
const SESSION_PRECISE_KEY = STORAGE_KEYS.SESSION_PRECISE_LOCATION;
const PROMPT_DISMISSED_KEY = STORAGE_KEYS.LOCATION_PROMPT_DISMISSED;
const IP_LOCATION_CACHE_KEY = STORAGE_KEYS.IP_LOCATION_CACHE;
const LAST_KNOWN_LOCATION_KEY = STORAGE_KEYS.LAST_KNOWN_LOCATION;
const LOCATION_EXPIRY_DAYS = 7;
const IP_CACHE_MINUTES = 30; // Cache IP-based location for 30 minutes
const GEO_TIMEOUT_MS = 10000; // 10 seconds for precise location

interface LocationData {
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  county: string | null;
  displayLocation: string | null;
  accuracyLevel: LocationAccuracyLevel;
  /** Latitude coordinate (for distance-based ranking) */
  lat?: number | null;
  /** Longitude coordinate (for distance-based ranking) */
  lng?: number | null;
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

// Get cached IP location (avoid repeated edge function calls)
interface CachedIPLocation {
  data: {
    region?: string;
    country?: string;
    countryCode?: string;
  };
  timestamp: number;
}

const getCachedIPLocation = (): CachedIPLocation['data'] | null => {
  try {
    const stored = localStorage.getItem(IP_LOCATION_CACHE_KEY);
    if (!stored) return null;
    const parsed: CachedIPLocation = JSON.parse(stored);
    const expiryTime = IP_CACHE_MINUTES * 60 * 1000;
    if (Date.now() - parsed.timestamp < expiryTime) {
      return parsed.data;
    }
    localStorage.removeItem(IP_LOCATION_CACHE_KEY);
    return null;
  } catch {
    return null;
  }
};

const setCachedIPLocation = (data: CachedIPLocation['data']): void => {
  try {
    const cache: CachedIPLocation = { data, timestamp: Date.now() };
    localStorage.setItem(IP_LOCATION_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage errors
  }
};

// Save to last known location for pre-fetch system
const saveLastKnownLocation = (location: LocationData): void => {
  try {
    setStorage(LAST_KNOWN_LOCATION_KEY, {
      city: location.city,
      region: location.region,
      country: location.country,
      countryCode: location.countryCode,
      county: location.county,
      lat: location.lat || null,
      lng: location.lng || null,
      accuracyLevel: location.accuracyLevel,
      savedAt: Date.now(),
    });
  } catch {
    // Ignore storage errors
  }
};

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

// Synchronously initialize location from cache to prevent loading flash
const getInitialLocation = (): LocationData | null => {
  // 1. Check manual location first
  const manual = getStoredManualLocation();
  if (manual) {
    return {
      city: manual.city,
      region: manual.region,
      country: manual.country,
      countryCode: manual.countryCode,
      county: manual.county,
      displayLocation: manual.displayLocation || manual.city,
      accuracyLevel: 'manual',
    };
  }
  
  // 2. Check session precise location
  const sessionPrecise = getSessionPreciseLocation();
  if (sessionPrecise) {
    return sessionPrecise;
  }
  
  // 3. Check cached IP location
  const cachedIP = getCachedIPLocation();
  if (cachedIP) {
    return {
      city: null,
      region: cachedIP.region || null,
      country: cachedIP.country || "United Kingdom",
      countryCode: cachedIP.countryCode || "GB",
      county: null,
      displayLocation: null,
      accuracyLevel: 'approximate',
    };
  }
  
  return null;
};

export const useUserLocation = (): UseUserLocationReturn => {
  const auth = useAuthSafe();
  const user = auth?.user;
  
  // Synchronous initialization from cache - prevents loading flash
  const [location, setLocation] = useState<LocationData | null>(() => getInitialLocation());
  const [isLoading, setIsLoading] = useState(() => !getInitialLocation());
  const [error, setError] = useState<string | null>(null);
  const [isRequestingPrecise, setIsRequestingPrecise] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(() => isPromptDismissed());
  
  // Track if initial fetch is done to prevent duplicate calls
  const initialFetchDoneRef = useRef(false);
  
  // Memory-only precise location for logged-out users (GDPR compliant)
  // Also check sessionStorage for persistence across page navigations
  const [memoryPreciseLocation, setMemoryPreciseLocation] = useState<LocationData | null>(
    () => getSessionPreciseLocation()
  );

  // Initialize location on mount
  useEffect(() => {
    // Prevent duplicate fetches on re-renders
    if (initialFetchDoneRef.current && location) {
      return;
    }
    
    let isMounted = true;

    const initLocation = async () => {
      // 1. Check for manual location first (always respected)
      const manualLocation = getStoredManualLocation();
      if (manualLocation) {
        if (isMounted) {
          const resolvedLocation: LocationData = {
            city: manualLocation.city,
            region: manualLocation.region,
            country: manualLocation.country,
            countryCode: manualLocation.countryCode,
            county: manualLocation.county,
            displayLocation: manualLocation.displayLocation || manualLocation.city,
            accuracyLevel: 'manual',
          };
          setLocation(resolvedLocation);
          saveLastKnownLocation(resolvedLocation);
          setIsLoading(false);
          initialFetchDoneRef.current = true;
        }
        return;
      }

      // 2. Check for memory precise location (logged-out users who granted permission this session)
      if (memoryPreciseLocation) {
        if (isMounted) {
          setLocation(memoryPreciseLocation);
          saveLastKnownLocation(memoryPreciseLocation);
          setIsLoading(false);
          initialFetchDoneRef.current = true;
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
              const resolvedLocation: LocationData = {
                city: profile.city,
                region: null,
                country: profile.country,
                countryCode: null,
                county: profile.county,
                displayLocation: profile.city || profile.county,
                accuracyLevel: 'precise',
                lat: profile.location_lat,
                lng: profile.location_lng,
              };
              setLocation(resolvedLocation);
              saveLastKnownLocation(resolvedLocation);
              setIsLoading(false);
              initialFetchDoneRef.current = true;
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
          initialFetchDoneRef.current = true;
        }
        return;
      }

      // 5. Use IP-based geolocation (country/region only - no city for approximate)
      // OPTIMIZED: Check cache first to avoid repeated edge function calls
      try {
        const cachedIP = getCachedIPLocation();
        if (cachedIP) {
          // Use cached IP location
          if (isMounted) {
            const resolvedLocation: LocationData = {
              city: null,
              region: cachedIP.region || null,
              country: cachedIP.country || "United Kingdom",
              countryCode: cachedIP.countryCode || "GB",
              county: null,
              displayLocation: null,
              accuracyLevel: 'approximate',
            };
            setLocation(resolvedLocation);
            saveLastKnownLocation(resolvedLocation);
            setIsLoading(false);
            initialFetchDoneRef.current = true;
          }
          return;
        }
        
        const { data, error: fetchError } = await supabase.functions.invoke('get-user-location');
        
        if (fetchError) throw fetchError;
        
        // Cache the result
        setCachedIPLocation({
          region: data?.region,
          country: data?.country,
          countryCode: data?.countryCode,
        });
        
        // For IP-based (approximate), we don't show city to avoid inaccuracy
        if (isMounted) {
          const resolvedLocation: LocationData = {
            city: null, // Don't show IP-based city (inaccurate)
            region: data?.region || null,
            country: data?.country || "United Kingdom",
            countryCode: data?.countryCode || "GB",
            county: null,
            displayLocation: null, // No display location for approximate
            accuracyLevel: 'approximate',
          };
          setLocation(resolvedLocation);
          saveLastKnownLocation(resolvedLocation);
          setIsLoading(false);
          initialFetchDoneRef.current = true;
        }
      } catch (err) {
        console.error('IP location detection failed:', err);
        if (isMounted) {
          setLocation(defaultLocation);
          setIsLoading(false);
          initialFetchDoneRef.current = true;
        }
      }
    };

    // Timeout fallback
    const timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        setLocation(defaultLocation);
        setIsLoading(false);
        initialFetchDoneRef.current = true;
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
              lat: latitude,
              lng: longitude,
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
