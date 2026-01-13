/**
 * useCoachPreFetch
 * 
 * STABILISATION: Pre-fetches coaches using get_simple_coaches(country, limit).
 * No ranking logic.
 */
import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSafe } from "@/contexts/AuthContext";
import { STORAGE_KEYS, getStorage, setStorage } from "@/lib/storage-keys";
import { useCountry } from "@/hooks/useCountry";

interface SavedLocation {
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  county: string | null;
  lat?: number | null;
  lng?: number | null;
  accuracyLevel: 'approximate' | 'precise' | 'manual';
  savedAt: number;
}

const checkGeolocationPermission = async (): Promise<'granted' | 'denied' | 'prompt'> => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) return 'prompt';
  
  if (!navigator.permissions) return 'prompt';
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state;
  } catch {
    return 'prompt';
  }
};

const getPreciseLocationSilently = (): Promise<GeolocationPosition | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  });
};

export const useCoachPreFetch = () => {
  const queryClient = useQueryClient();
  const auth = useAuthSafe();
  const user = auth?.user;
  const { countryCode: contextCountryCode } = useCountry();
  const hasFetchedRef = useRef(false);
  const isProcessingRef = useRef(false);

  const prefetchCoaches = useCallback(async (countryCode: string | null) => {
    const queryKey = [
      "marketplace-coaches-stable",
      countryCode || null,
      50, // limit
    ];

    const existingData = queryClient.getQueryData(queryKey);
    if (existingData) {
      return;
    }

    try {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn: async () => {
          // Call the minimal 2-parameter function
          const { data, error } = await supabase.rpc('get_simple_coaches', {
            p_filter_country_code: countryCode || null,
            p_limit: 50,
          });

          if (error) throw error;

          // Map to minimal format
          return (data || []).map((row: any) => ({
            id: row.id,
            username: row.username,
            display_name: row.display_name,
            profile_image_url: row.profile_image_url,
            location_country: row.location_country,
            location_country_code: row.location_country_code,
            created_at: row.created_at,
          }));
        },
        staleTime: 1000 * 60 * 5,
      });
    } catch (err) {
      console.error('[CoachPreFetch] Failed to prefetch coaches:', err);
    }
  }, [queryClient]);

  const saveLocation = useCallback((location: Omit<SavedLocation, 'savedAt'>) => {
    const toSave: SavedLocation = {
      ...location,
      savedAt: Date.now(),
    };
    setStorage(STORAGE_KEYS.LAST_KNOWN_LOCATION, toSave);
  }, []);

  useEffect(() => {
    if (hasFetchedRef.current || isProcessingRef.current) return;
    isProcessingRef.current = true;

    const runPreFetch = async () => {
      try {
        const savedLocation = getStorage<SavedLocation>(STORAGE_KEYS.LAST_KNOWN_LOCATION);
        const effectiveCountryCode = contextCountryCode || savedLocation?.countryCode || null;
        
        await prefetchCoaches(effectiveCountryCode);

        const permissionStatus = await checkGeolocationPermission();
        
        if (permissionStatus === 'granted') {
          const position = await getPreciseLocationSilently();
          
          if (position) {
            try {
              const { data: geoData } = await supabase.functions.invoke('reverse-geocode', {
                body: { lat: position.coords.latitude, lng: position.coords.longitude }
              });

              if (geoData) {
                const freshLocation: Omit<SavedLocation, 'savedAt'> = {
                  city: geoData.city || null,
                  region: null,
                  country: geoData.country || null,
                  countryCode: geoData.countryCode || null,
                  county: geoData.county || null,
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                  accuracyLevel: 'precise',
                };

                saveLocation(freshLocation);

                if (user) {
                  await supabase
                    .from('client_profiles')
                    .update({
                      city: freshLocation.city,
                      county: freshLocation.county,
                      country: freshLocation.country,
                      location_lat: freshLocation.lat,
                      location_lng: freshLocation.lng,
                      location_accuracy: 'precise',
                    })
                    .eq('user_id', user.id);
                }
              }
            } catch (geocodeErr) {
              console.error('[CoachPreFetch] Reverse geocode failed:', geocodeErr);
            }
          }
        } else if (permissionStatus === 'prompt' && !savedLocation) {
          try {
            const { data: ipData } = await supabase.functions.invoke('get-user-location');
            if (ipData) {
              const ipLocation: Omit<SavedLocation, 'savedAt'> = {
                city: null,
                region: ipData.region || null,
                country: ipData.country || 'United Kingdom',
                countryCode: ipData.countryCode || 'GB',
                county: null,
                lat: null,
                lng: null,
                accuracyLevel: 'approximate',
              };
              saveLocation(ipLocation);
            }
          } catch (ipErr) {
            console.error('[CoachPreFetch] IP location failed:', ipErr);
          }
        }

        hasFetchedRef.current = true;
      } catch (err) {
        console.error('[CoachPreFetch] Pre-fetch error (non-fatal):', err);
        hasFetchedRef.current = true;
      } finally {
        isProcessingRef.current = false;
      }
    };

    const isNative = typeof navigator !== 'undefined' && /Despia/.test(navigator.userAgent);
    const delay = isNative ? 300 : 100;
    const timeoutId = setTimeout(runPreFetch, delay);
    return () => clearTimeout(timeoutId);
  }, [contextCountryCode, user, prefetchCoaches, saveLocation]);
};
