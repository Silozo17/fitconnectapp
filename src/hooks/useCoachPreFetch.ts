/**
 * useCoachPreFetch
 * 
 * STABILISATION: Pre-fetches coaches using get_simple_coaches (country filter only).
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

// Check if browser supports permissions API
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

// Get precise location silently (only works if permission already granted)
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

  // Prefetch coaches with country code only (simplified)
  const prefetchCoaches = useCallback(async (countryCode: string | null) => {
    const queryKey = [
      "marketplace-coaches-simple",
      countryCode || null,
      null, // search
      null, // coachTypes
      null, // minPrice
      null, // maxPrice
      false, // onlineOnly
      false, // inPersonOnly
      50, // limit
    ];

    // Check if we already have fresh data
    const existingData = queryClient.getQueryData(queryKey);
    if (existingData) {
      return;
    }

    try {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn: async () => {
          const { data, error } = await supabase.rpc('get_simple_coaches', {
            p_filter_country_code: countryCode || null,
            p_search_term: null,
            p_coach_types: null,
            p_min_price: null,
            p_max_price: null,
            p_online_only: false,
            p_in_person_only: false,
            p_limit: 50,
          });

          if (error) throw error;

          // Map to expected format (simplified - no ranking)
          const coaches = (data || []).map((row: any) => ({
            id: row.id,
            username: row.username,
            display_name: row.display_name,
            bio: row.bio,
            coach_types: row.coach_types,
            hourly_rate: row.hourly_rate,
            currency: row.currency,
            location_city: row.location_city,
            location_country: row.location_country,
            location_country_code: row.location_country_code,
            online_available: row.online_available,
            in_person_available: row.in_person_available,
            profile_image_url: row.profile_image_url,
            card_image_url: row.card_image_url,
            is_verified: row.is_verified,
            selected_avatar_id: row.selected_avatar_id,
            review_count: row.review_count,
            avg_rating: row.avg_rating,
            is_sponsored: row.is_sponsored,
            certifications: row.certifications,
            experience_years: row.experience_years,
            location: row.location,
            location_region: row.location_region,
            booking_mode: row.booking_mode,
            verified_at: row.verified_at,
            gym_affiliation: row.gym_affiliation,
            marketplace_visible: row.marketplace_visible,
            created_at: row.created_at,
            onboarding_completed: row.onboarding_completed || false,
            who_i_work_with: row.who_i_work_with,
            facebook_url: row.facebook_url,
            instagram_url: row.instagram_url,
            tiktok_url: row.tiktok_url,
            x_url: row.x_url,
            threads_url: row.threads_url,
            linkedin_url: row.linkedin_url,
            youtube_url: row.youtube_url,
            avatars: row.avatar_slug ? {
              slug: row.avatar_slug,
              rarity: row.avatar_rarity,
              image_url: null
            } : null,
            rating: row.avg_rating,
            reviews_count: row.review_count,
            tags: row.tags,
          }));

          return coaches;
        },
        staleTime: 1000 * 60 * 5,
      });
    } catch (err) {
      console.error('[CoachPreFetch] Failed to prefetch coaches:', err);
    }
  }, [queryClient]);

  // Save location to localStorage
  const saveLocation = useCallback((location: Omit<SavedLocation, 'savedAt'>) => {
    const toSave: SavedLocation = {
      ...location,
      savedAt: Date.now(),
    };
    setStorage(STORAGE_KEYS.LAST_KNOWN_LOCATION, toSave);
  }, []);

  // Main effect: runs once on mount
  useEffect(() => {
    if (hasFetchedRef.current || isProcessingRef.current) return;
    isProcessingRef.current = true;

    const runPreFetch = async () => {
      try {
        // Get saved location from localStorage
        const savedLocation = getStorage<SavedLocation>(STORAGE_KEYS.LAST_KNOWN_LOCATION);
        
        // Use context country code or saved location country code
        const effectiveCountryCode = contextCountryCode || savedLocation?.countryCode || null;
        
        // Immediately prefetch coaches with country code
        await prefetchCoaches(effectiveCountryCode);

        // Check geolocation permission status for location updates
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

                // Update user profile if logged in
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
          // Fall back to IP-based location
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