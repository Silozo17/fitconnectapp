import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicLeaderboardEntry {
  rank: number;
  displayName: string;
  city: string | null;
  county: string | null;
  country: string | null;
  level: number;
  totalXp: number;
}

interface LeaderboardResult {
  entries: PublicLeaderboardEntry[];
  totalParticipants: number;
}

interface LocationOption {
  value: string;
  label: string;
  count: number;
}

// RPC response types
interface LeaderboardRpcRow {
  rank: number;
  display_name: string;
  city: string | null;
  county: string | null;
  country: string | null;
  level: number;
  total_xp: number;
}

interface LocationRpcRow {
  location_value: string;
  user_count: number;
}

const fetchLeaderboardData = async (
  locationType: 'global' | 'city' | 'county' | 'country',
  locationValue?: string,
  limit: number = 10,
  offset: number = 0
): Promise<LeaderboardResult> => {
  // Use SECURITY DEFINER RPC functions that bypass RLS
  // These functions only return GDPR-safe data (no user IDs, emails, etc.)
  
  const { data: countData, error: countError } = await supabase.rpc('get_public_leaderboard_count', {
    p_location_type: locationType,
    p_location_value: locationValue || null
  });

  if (countError) {
    console.error('Error fetching leaderboard count:', countError);
  }

  const { data, error } = await supabase.rpc('get_public_leaderboard', {
    p_location_type: locationType,
    p_location_value: locationValue || null,
    p_limit: limit,
    p_offset: offset
  });

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return { entries: [], totalParticipants: countData || 0 };
  }

  if (!data || !Array.isArray(data)) {
    return { entries: [], totalParticipants: countData || 0 };
  }

  const entries: PublicLeaderboardEntry[] = (data as LeaderboardRpcRow[]).map((row) => ({
    rank: row.rank,
    displayName: row.display_name || 'Anonymous',
    city: row.city,
    county: row.county,
    country: row.country,
    level: row.level,
    totalXp: row.total_xp,
  }));

  return { entries, totalParticipants: countData || 0 };
};

const fetchLocationOptions = async (
  locationType: 'city' | 'county' | 'country'
): Promise<LocationOption[]> => {
  const { data, error } = await supabase.rpc('get_leaderboard_locations', {
    p_location_type: locationType
  });

  if (error) {
    console.error('Error fetching location options:', error);
    return [];
  }

  if (!data || !Array.isArray(data)) {
    return [];
  }

  return (data as LocationRpcRow[]).map((row) => ({
    value: row.location_value,
    label: row.location_value,
    count: row.user_count
  }));
};

export function useGlobalLeaderboard(limit: number = 10) {
  return useQuery({
    queryKey: ['public-leaderboard', 'global', limit],
    queryFn: () => fetchLeaderboardData('global', undefined, limit),
    staleTime: 60 * 1000,
  });
}

export function useLocalLeaderboard(
  locationType: 'city' | 'county' | 'country',
  locationValue: string | null,
  limit: number = 10
) {
  return useQuery({
    queryKey: ['public-leaderboard', locationType, locationValue, limit],
    queryFn: () => fetchLeaderboardData(locationType, locationValue || undefined, limit),
    enabled: !!locationValue,
    staleTime: 60 * 1000,
  });
}

export function usePaginatedLeaderboard(
  locationType: 'global' | 'city' | 'county' | 'country',
  locationValue: string | null,
  limit: number = 25,
  page: number = 1
) {
  const offset = (page - 1) * limit;
  
  return useQuery({
    queryKey: ['public-leaderboard', 'paginated', locationType, locationValue, limit, page],
    queryFn: () => fetchLeaderboardData(
      locationType,
      locationType === 'global' ? undefined : (locationValue || undefined),
      limit,
      offset
    ),
    enabled: locationType === 'global' || !!locationValue,
    staleTime: 60 * 1000,
  });
}

export function useLocationOptions(locationType: 'city' | 'county' | 'country') {
  return useQuery({
    queryKey: ['leaderboard-locations', locationType],
    queryFn: () => fetchLocationOptions(locationType),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
