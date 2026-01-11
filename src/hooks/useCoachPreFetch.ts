/**
 * useCoachPreFetch
 * 
 * Pre-fetches coaches in the background when a client enters the dashboard.
 * This ensures the Find Coaches page loads instantly without visible reordering.
 * 
 * Flow:
 * 1. On mount, restore last known location from localStorage
 * 2. If we have a saved location, immediately prefetch coaches
 * 3. In background: check location permission and refresh location
 * 4. If permission not yet asked AND not granted, silently check geolocation status
 * 5. Save updated location for next app open
 * 6. If location changed significantly, re-prefetch coaches
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
      () => resolve(null), // Silently fail if denied
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

  // Prefetch coaches with given location
  const prefetchCoaches = useCallback(async (location: SavedLocation | null, countryCode: string | null) => {
    if (!location) return;
    
    const queryKey = [
      "marketplace-coaches-rpc",
      location.city || null,
      location.region || location.county || null,
      location.countryCode || null,
      location.lat || null,
      location.lng || null,
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
      return; // Already cached
    }

    try {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn: async () => {
          const { data, error } = await supabase.rpc('get_ranked_coaches', {
            p_user_city: location.city || null,
            p_user_region: location.region || location.county || null,
            p_user_country_code: location.countryCode || null,
            p_filter_country_code: countryCode || null,
            p_search_term: null,
            p_coach_types: null,
            p_min_price: null,
            p_max_price: null,
            p_online_only: false,
            p_in_person_only: false,
            p_limit: 50,
            p_user_lat: location.lat || null,
            p_user_lng: location.lng || null,
          });

          if (error) throw error;

          // Map to expected format (simplified - full mapping happens in useCoachMarketplace)
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
            online_available: row.online_available,
            in_person_available: row.in_person_available,
            profile_image_url: row.profile_image_url,
            card_image_url: row.card_image_url,
            is_verified: row.is_verified,
            selected_avatar_id: row.selected_avatar_id,
            visibility_score: row.visibility_score,
            location_tier: row.location_tier,
            review_count: row.review_count,
            avg_rating: row.avg_rating,
            is_sponsored: row.is_sponsored,
            // Add remaining fields for full compatibility
            certifications: row.certifications,
            experience_years: row.experience_years,
            location: row.location,
            location_region: row.location_region,
            location_country_code: row.location_country_code,
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
            verified_qualification_count: row.verified_qualification_count || 0,
            ranking: {
              locationScore: row.location_tier || 0,
              engagementScore: 0,
              profileScore: 0,
              totalScore: row.visibility_score || 0,
              matchLevel: row.location_tier >= 1000 ? 'exact_city' : 
                         row.location_tier >= 700 ? 'same_region' :
                         row.location_tier >= 400 ? 'same_country' :
                         row.location_tier >= 300 ? 'online_only' : 'no_match',
              isSponsored: row.is_sponsored || false,
            },
          }));

          return {
            coaches,
            effectiveMatchLevel: coaches.length > 0 
              ? (coaches[0].location_tier >= 1000 ? 'exact_city' : 
                 coaches[0].location_tier >= 700 ? 'same_region' :
                 coaches[0].location_tier >= 400 ? 'same_country' : 'no_match')
              : 'no_match',
          };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
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
        // 1. Get saved location from localStorage
        const savedLocation = getStorage<SavedLocation>(STORAGE_KEYS.LAST_KNOWN_LOCATION);
        
        // 2. If we have a saved location, immediately prefetch coaches
        if (savedLocation) {
          await prefetchCoaches(savedLocation, contextCountryCode);
        }

        // 3. Check geolocation permission status
        const permissionStatus = await checkGeolocationPermission();
        
        // 4. If permission is granted, silently get fresh location
        if (permissionStatus === 'granted') {
          const position = await getPreciseLocationSilently();
          
          if (position) {
            // Reverse geocode the position
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

                // Save for next time
                saveLocation(freshLocation);

                // If location changed significantly, re-prefetch
                const locationChanged = !savedLocation || 
                  savedLocation.city !== freshLocation.city ||
                  savedLocation.countryCode !== freshLocation.countryCode;

                if (locationChanged) {
                  await prefetchCoaches({ ...freshLocation, savedAt: Date.now() }, contextCountryCode);
                }

                // Also update user profile if logged in
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
        } else if (permissionStatus === 'prompt') {
          // Permission not yet asked - check if we should prompt on first app open
          const hasAskedBefore = localStorage.getItem(STORAGE_KEYS.LOCATION_PERMISSION_ASKED);
          
          if (!hasAskedBefore && !savedLocation) {
            // First time user without saved location - mark as asked but don't block
            // The actual prompt will be shown via shouldShowLocationPrompt in useUserLocation
            localStorage.setItem(STORAGE_KEYS.LOCATION_PERMISSION_ASKED, 'pending');
          }
          
          // Fall back to IP-based location if no saved location
          if (!savedLocation) {
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
                await prefetchCoaches({ ...ipLocation, savedAt: Date.now() }, contextCountryCode);
              }
            } catch (ipErr) {
              console.error('[CoachPreFetch] IP location failed:', ipErr);
            }
          }
        }
        // If 'denied', just use whatever saved location we have

        hasFetchedRef.current = true;
      } catch (err) {
        console.error('[CoachPreFetch] Error:', err);
      } finally {
        isProcessingRef.current = false;
      }
    };

    // Small delay to let the main UI render first
    const timeoutId = setTimeout(runPreFetch, 100);
    return () => clearTimeout(timeoutId);
  }, [contextCountryCode, user, prefetchCoaches, saveLocation]);

  // No return value needed - this is a side-effect only hook
};
