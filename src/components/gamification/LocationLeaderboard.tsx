import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LeaderboardTable } from './LeaderboardTable';
import { XPLeaderboardEntry, getLevelTitle } from '@/hooks/useGamification';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe, Building, Map } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type LocationType = 'city' | 'county' | 'country' | 'global';
type TimeFrame = 'weekly' | 'monthly' | 'alltime';

interface LocationLeaderboardProps {
  timeFrame?: TimeFrame;
}

function useUserLocation() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['user-location', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('client_profiles')
        .select('city, county, country, leaderboard_visible')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });
}

function useLocationLeaderboard(locationType: LocationType, locationValue: string | null, timeFrame: TimeFrame) {
  return useQuery({
    queryKey: ['location-leaderboard', locationType, locationValue, timeFrame],
    queryFn: async () => {
      // Build the query based on location type
      let query = supabase
        .from('client_xp')
        .select(`
          client_id,
          total_xp,
          current_level
        `)
        .order('total_xp', { ascending: false })
        .limit(50);

      // Get all client profiles that are visible on leaderboards
      const { data: visibleProfiles } = await supabase
        .from('client_profiles')
        .select('id, first_name, leaderboard_display_name, city, county, country, avatar_url')
        .eq('leaderboard_visible', true);

      if (!visibleProfiles || visibleProfiles.length === 0) {
        return [];
      }

      // Filter by location if not global
      let filteredProfiles = visibleProfiles;
      if (locationType !== 'global' && locationValue) {
        filteredProfiles = visibleProfiles.filter(p => {
          switch (locationType) {
            case 'city': return p.city?.toLowerCase() === locationValue.toLowerCase();
            case 'county': return p.county?.toLowerCase() === locationValue.toLowerCase();
            case 'country': return p.country?.toLowerCase() === locationValue.toLowerCase();
            default: return true;
          }
        });
      }

      const visibleClientIds = filteredProfiles.map(p => p.id);

      if (visibleClientIds.length === 0) {
        return [];
      }

      // For weekly/monthly, we'd need to aggregate XP transactions
      // For simplicity, using total_xp for all timeframes
      const { data: xpData } = await supabase
        .from('client_xp')
        .select('client_id, total_xp, current_level')
        .in('client_id', visibleClientIds)
        .order('total_xp', { ascending: false })
        .limit(50);

      if (!xpData) return [];

      // Map to leaderboard entries with privacy-safe data
      const entries: XPLeaderboardEntry[] = xpData.map((xp, index) => {
        const profile = filteredProfiles.find(p => p.id === xp.client_id);
        return {
          client_id: xp.client_id,
          total_xp: xp.total_xp,
          current_level: xp.current_level,
          rank: index + 1,
          first_name: profile?.leaderboard_display_name || profile?.first_name || 'Anonymous',
          last_name: null, // Never expose last name
          avatar_url: null, // Never expose avatar for privacy
          city: profile?.city || null,
          county: profile?.county || null,
          country: profile?.country || null,
        };
      });

      return entries;
    },
    enabled: locationType === 'global' || !!locationValue,
  });
}

function useMyRanks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-ranks', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get user's profile
      const { data: profile } = await supabase
        .from('client_profiles')
        .select('id, city, county, country, leaderboard_visible')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile) return null;

      // Get user's XP
      const { data: myXp } = await supabase
        .from('client_xp')
        .select('total_xp')
        .eq('client_id', profile.id)
        .maybeSingle();

      if (!myXp) return null;

      // Calculate ranks in each category
      const ranks: Record<string, { rank: number; total: number }> = {};

      // Global rank
      const { count: globalHigher } = await supabase
        .from('client_xp')
        .select('client_id', { count: 'exact', head: true })
        .gt('total_xp', myXp.total_xp);
      
      const { count: globalTotal } = await supabase
        .from('client_xp')
        .select('client_id', { count: 'exact', head: true });

      ranks.global = { rank: (globalHigher || 0) + 1, total: globalTotal || 0 };

      // Location-based ranks (only for users with location set)
      if (profile.country) {
        const { data: countryProfiles } = await supabase
          .from('client_profiles')
          .select('id')
          .eq('country', profile.country)
          .eq('leaderboard_visible', true);

        if (countryProfiles) {
          const countryIds = countryProfiles.map(p => p.id);
          const { count: countryHigher } = await supabase
            .from('client_xp')
            .select('client_id', { count: 'exact', head: true })
            .in('client_id', countryIds)
            .gt('total_xp', myXp.total_xp);

          ranks.country = { rank: (countryHigher || 0) + 1, total: countryIds.length };
        }
      }

      if (profile.county) {
        const { data: countyProfiles } = await supabase
          .from('client_profiles')
          .select('id')
          .eq('county', profile.county)
          .eq('leaderboard_visible', true);

        if (countyProfiles) {
          const countyIds = countyProfiles.map(p => p.id);
          const { count: countyHigher } = await supabase
            .from('client_xp')
            .select('client_id', { count: 'exact', head: true })
            .in('client_id', countyIds)
            .gt('total_xp', myXp.total_xp);

          ranks.county = { rank: (countyHigher || 0) + 1, total: countyIds.length };
        }
      }

      if (profile.city) {
        const { data: cityProfiles } = await supabase
          .from('client_profiles')
          .select('id')
          .eq('city', profile.city)
          .eq('leaderboard_visible', true);

        if (cityProfiles) {
          const cityIds = cityProfiles.map(p => p.id);
          const { count: cityHigher } = await supabase
            .from('client_xp')
            .select('client_id', { count: 'exact', head: true })
            .in('client_id', cityIds)
            .gt('total_xp', myXp.total_xp);

          ranks.city = { rank: (cityHigher || 0) + 1, total: cityIds.length };
        }
      }

      return { profile, ranks };
    },
    enabled: !!user?.id,
  });
}

export function LocationLeaderboard({ timeFrame = 'alltime' }: LocationLeaderboardProps) {
  const { data: userLocation, isLoading: locationLoading } = useUserLocation();
  const { data: myRanks, isLoading: ranksLoading } = useMyRanks();

  const { data: globalData, isLoading: globalLoading } = useLocationLeaderboard('global', null, timeFrame);
  const { data: countryData, isLoading: countryLoading } = useLocationLeaderboard('country', userLocation?.country || null, timeFrame);
  const { data: countyData, isLoading: countyLoading } = useLocationLeaderboard('county', userLocation?.county || null, timeFrame);
  const { data: cityData, isLoading: cityLoading } = useLocationLeaderboard('city', userLocation?.city || null, timeFrame);

  if (locationLoading || ranksLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6">
      {/* My Ranks Summary */}
      {myRanks && myRanks.profile.leaderboard_visible && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {myRanks.ranks.city && myRanks.profile.city && (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Building className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-bold text-primary">#{myRanks.ranks.city.rank}</div>
                    <div className="text-xs text-muted-foreground">{myRanks.profile.city}</div>
                  </div>
                </div>
              )}
              {myRanks.ranks.county && myRanks.profile.county && (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Map className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-bold text-primary">#{myRanks.ranks.county.rank}</div>
                    <div className="text-xs text-muted-foreground">{myRanks.profile.county}</div>
                  </div>
                </div>
              )}
              {myRanks.ranks.country && myRanks.profile.country && (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-bold text-primary">#{myRanks.ranks.country.rank}</div>
                    <div className="text-xs text-muted-foreground">{myRanks.profile.country}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Globe className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-bold text-primary">#{myRanks.ranks.global.rank}</div>
                  <div className="text-xs text-muted-foreground">Global</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Tabs */}
      <Tabs defaultValue="global" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="city" disabled={!userLocation?.city}>
            <Building className="h-4 w-4 mr-1 hidden sm:inline" />
            {userLocation?.city || 'City'}
          </TabsTrigger>
          <TabsTrigger value="county" disabled={!userLocation?.county}>
            <Map className="h-4 w-4 mr-1 hidden sm:inline" />
            {userLocation?.county || 'County'}
          </TabsTrigger>
          <TabsTrigger value="country" disabled={!userLocation?.country}>
            <MapPin className="h-4 w-4 mr-1 hidden sm:inline" />
            {userLocation?.country || 'Country'}
          </TabsTrigger>
          <TabsTrigger value="global">
            <Globe className="h-4 w-4 mr-1 hidden sm:inline" />
            Global
          </TabsTrigger>
        </TabsList>

        <TabsContent value="city">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {userLocation?.city} Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardTable
                entries={cityData || []}
                isLoading={cityLoading}
                emptyMessage={`No one in ${userLocation?.city || 'your city'} has opted into the leaderboard yet`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="county">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                {userLocation?.county} Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardTable
                entries={countyData || []}
                isLoading={countyLoading}
                emptyMessage={`No one in ${userLocation?.county || 'your county'} has opted into the leaderboard yet`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="country">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {userLocation?.country} Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardTable
                entries={countryData || []}
                isLoading={countryLoading}
                emptyMessage={`No one in ${userLocation?.country || 'your country'} has opted into the leaderboard yet`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="global">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Global Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardTable
                entries={globalData || []}
                isLoading={globalLoading}
                emptyMessage="No one has opted into the global leaderboard yet"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Visibility Notice */}
      {userLocation && !userLocation.leaderboard_visible && (
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            You're not visible on leaderboards.{' '}
            <Link to="/dashboard/client/settings?tab=preferences" className="text-primary underline hover:text-primary/80">
              Go to Leaderboard Settings
            </Link>{' '}
            to opt in.
          </p>
        </div>
      )}
    </div>
  );
}
