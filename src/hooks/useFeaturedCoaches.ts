/**
 * Hook for fetching featured coaches for the homepage
 * 
 * STABILISATION: Uses get_simple_coaches RPC with 2 parameters only.
 * Returns minimal fields: id, username, display_name, profile_image_url, location_country, location_country_code, created_at
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCountryNameFromCode } from '@/lib/location-utils';
import { isDespia } from '@/lib/despia';
import type { LocationData } from '@/types/ranking';

const FEATURED_COACH_LIMIT = 4;

// Minimal coach type matching exactly what the RPC returns
export interface SimplifiedCoach {
  id: string;
  username: string | null;
  display_name: string | null;
  profile_image_url: string | null;
  card_image_url: string | null;
  location_country: string | null;
  location_country_code: string | null;
  created_at: string;
}

interface UseFeaturedCoachesOptions {
  userLocation: LocationData | null;
  countryCode?: string | null;
  enabled?: boolean;
}

interface UseFeaturedCoachesResult {
  coaches: SimplifiedCoach[];
  isLoading: boolean;
  locationLabel: string;
}

const EMPTY_COACHES: SimplifiedCoach[] = [];

export function useFeaturedCoaches({ userLocation, countryCode, enabled = true }: UseFeaturedCoachesOptions): UseFeaturedCoachesResult {
  const filterCountry = countryCode || userLocation?.countryCode || null;

  const query = useQuery({
    queryKey: ['featured-coaches-stable', filterCountry],
    enabled,
    queryFn: async () => {
      // Call the minimal 2-parameter function
      const { data, error } = await supabase.rpc('get_simple_coaches', {
        p_filter_country_code: filterCountry,
        p_limit: FEATURED_COACH_LIMIT,
      });

      if (error) {
        console.error('[useFeaturedCoaches] RPC error:', error);
        throw error;
      }

      // Direct mapping - no transformation needed, RPC returns exact shape
      return (data || []) as SimplifiedCoach[];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: !isDespia(),
    placeholderData: EMPTY_COACHES,
    refetchOnMount: false,
  });

  const locationLabel = countryCode 
    ? (getCountryNameFromCode(countryCode) || userLocation?.country || 'Your Area')
    : (userLocation?.city || userLocation?.region || userLocation?.country || 'Your Area');

  return {
    coaches: query.data || EMPTY_COACHES,
    isLoading: query.isLoading,
    locationLabel,
  };
}
