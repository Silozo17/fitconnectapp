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

const fetchLeaderboardData = async (
  locationType: 'global' | 'city' | 'county' | 'country',
  locationValue?: string,
  limit: number = 10
): Promise<LeaderboardResult> => {
  // First get total count of opted-in users
  let countQuery = supabase
    .from('client_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('leaderboard_visible', true);

  if (locationType !== 'global' && locationValue) {
    countQuery = countQuery.eq(locationType, locationValue);
  }

  const { count } = await countQuery;

  // Get XP data for opted-in profiles
  let profilesQuery = supabase
    .from('client_profiles')
    .select('id, first_name, leaderboard_display_name, city, county, country')
    .eq('leaderboard_visible', true);

  if (locationType !== 'global' && locationValue) {
    profilesQuery = profilesQuery.eq(locationType, locationValue);
  }

  const { data: profiles, error: profilesError } = await profilesQuery;

  if (profilesError || !profiles?.length) {
    return { entries: [], totalParticipants: count || 0 };
  }

  const profileIds = profiles.map(p => p.id);
  
  const { data: xpData, error: xpError } = await supabase
    .from('client_xp')
    .select('client_id, total_xp, current_level')
    .in('client_id', profileIds)
    .order('total_xp', { ascending: false })
    .limit(limit);

  if (xpError || !xpData?.length) {
    return { entries: [], totalParticipants: count || 0 };
  }

  const profileMap = new Map(profiles.map(p => [p.id, p]));

  const entries: PublicLeaderboardEntry[] = xpData.map((xp, index) => {
    const profile = profileMap.get(xp.client_id);
    return {
      rank: index + 1,
      displayName: profile?.leaderboard_display_name || profile?.first_name || 'Anonymous',
      city: profile?.city || null,
      county: profile?.county || null,
      country: profile?.country || null,
      level: xp.current_level,
      totalXp: xp.total_xp,
    };
  });

  return { entries, totalParticipants: count || 0 };
};

export function useGlobalLeaderboard(limit: number = 10) {
  return useQuery({
    queryKey: ['public-leaderboard', 'global', limit],
    queryFn: () => fetchLeaderboardData('global', undefined, limit),
    staleTime: 60 * 1000, // 1 minute
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
