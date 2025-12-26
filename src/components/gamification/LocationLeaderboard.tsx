import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ModernLeaderboard, LocationType } from './ModernLeaderboard';
import { XPLeaderboardEntry } from '@/hooks/useGamification';
import { Globe, MapPin, Map, Building, AlertCircle } from 'lucide-react';

interface LocationLeaderboardProps {
  timeFrame?: 'weekly' | 'monthly' | 'alltime';
}

function useUserLocation() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['user-location', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('client_profiles')
        .select('id, city, county, country, leaderboard_visible')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });
}

function useLocationLeaderboard(locationType: LocationType, locationValue: string | null) {
  return useQuery({
    queryKey: ['location-leaderboard', locationType, locationValue],
    queryFn: async () => {
      // Get all client profiles that are visible on leaderboards with avatar data
      const { data: visibleProfiles } = await supabase
        .from('client_profiles')
        .select(`
          id, first_name, leaderboard_display_name, city, county, country, avatar_url,
          selected_avatar_id,
          selected_avatar:avatars!client_profiles_selected_avatar_id_fkey(slug, rarity)
        `)
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

      const { data: xpData } = await supabase
        .from('client_xp')
        .select('client_id, total_xp, current_level')
        .in('client_id', visibleClientIds)
        .order('total_xp', { ascending: false })
        .limit(50);

      if (!xpData) return [];

      // Map to leaderboard entries with privacy-safe data including avatar
      const entries: XPLeaderboardEntry[] = xpData.map((xp, index) => {
        const profile = filteredProfiles.find(p => p.id === xp.client_id);
        const avatarData = profile?.selected_avatar as { slug: string; rarity: string } | null;
        
        return {
          client_id: xp.client_id,
          total_xp: xp.total_xp,
          current_level: xp.current_level,
          rank: index + 1,
          first_name: profile?.leaderboard_display_name || profile?.first_name || 'Anonymous',
          last_name: null,
          avatar_url: profile?.avatar_url || null,
          city: profile?.city || null,
          county: profile?.county || null,
          country: profile?.country || null,
          selected_avatar_slug: avatarData?.slug || null,
          selected_avatar_rarity: avatarData?.rarity || null,
        };
      });

      return entries;
    },
    enabled: locationType === 'global' || !!locationValue,
  });
}

function useMyRank(locationType: LocationType, locationValue: string | null, userProfileId: string | null) {
  return useQuery({
    queryKey: ['my-rank', locationType, locationValue, userProfileId],
    queryFn: async () => {
      if (!userProfileId) return null;

      // Get user's XP
      const { data: myXp } = await supabase
        .from('client_xp')
        .select('total_xp')
        .eq('client_id', userProfileId)
        .maybeSingle();

      if (!myXp) return null;

      // Get visible profiles in the same location
      let profileQuery = supabase
        .from('client_profiles')
        .select('id')
        .eq('leaderboard_visible', true);

      if (locationType !== 'global' && locationValue) {
        switch (locationType) {
          case 'city':
            profileQuery = profileQuery.ilike('city', locationValue);
            break;
          case 'county':
            profileQuery = profileQuery.ilike('county', locationValue);
            break;
          case 'country':
            profileQuery = profileQuery.ilike('country', locationValue);
            break;
        }
      }

      const { data: profiles } = await profileQuery;
      if (!profiles) return null;

      const profileIds = profiles.map(p => p.id);

      // Count how many have more XP
      const { count: higherCount } = await supabase
        .from('client_xp')
        .select('client_id', { count: 'exact', head: true })
        .in('client_id', profileIds)
        .gt('total_xp', myXp.total_xp);

      return {
        rank: (higherCount || 0) + 1,
        total: profileIds.length,
      };
    },
    enabled: !!userProfileId && (locationType === 'global' || !!locationValue),
  });
}

export function LocationLeaderboard({ timeFrame = 'alltime' }: LocationLeaderboardProps) {
  const { data: userLocation, isLoading: locationLoading } = useUserLocation();
  const [selectedLocation, setSelectedLocation] = useState<LocationType>('global');

  // Get location value based on selection
  const locationValue = useMemo(() => {
    switch (selectedLocation) {
      case 'city': return userLocation?.city || null;
      case 'county': return userLocation?.county || null;
      case 'country': return userLocation?.country || null;
      default: return null;
    }
  }, [selectedLocation, userLocation]);

  const { data: entries, isLoading: entriesLoading } = useLocationLeaderboard(selectedLocation, locationValue);
  const { data: myRank } = useMyRank(selectedLocation, locationValue, userLocation?.id || null);

  // Build location options based on user's location data
  const locationOptions = useMemo(() => [
    {
      value: 'global' as LocationType,
      label: 'Global',
      icon: Globe,
    },
    {
      value: 'country' as LocationType,
      label: userLocation?.country || 'Country',
      icon: MapPin,
      disabled: !userLocation?.country,
      sublabel: !userLocation?.country ? 'Set your country' : undefined,
    },
    {
      value: 'county' as LocationType,
      label: userLocation?.county || 'County',
      icon: Map,
      disabled: !userLocation?.county,
      sublabel: !userLocation?.county ? 'Set your county' : undefined,
    },
    {
      value: 'city' as LocationType,
      label: userLocation?.city || 'City',
      icon: Building,
      disabled: !userLocation?.city,
      sublabel: !userLocation?.city ? 'Set your city' : undefined,
    },
  ], [userLocation]);

  // Get dynamic label for selected location
  const locationLabel = useMemo(() => {
    switch (selectedLocation) {
      case 'city': return userLocation?.city || 'City';
      case 'county': return userLocation?.county || 'County';
      case 'country': return userLocation?.country || 'Country';
      default: return 'Global';
    }
  }, [selectedLocation, userLocation]);

  // Get empty message based on location
  const emptyMessage = useMemo(() => {
    switch (selectedLocation) {
      case 'city': return `No one in ${userLocation?.city || 'your city'} has opted into the leaderboard yet`;
      case 'county': return `No one in ${userLocation?.county || 'your county'} has opted into the leaderboard yet`;
      case 'country': return `No one in ${userLocation?.country || 'your country'} has opted into the leaderboard yet`;
      default: return 'No one has opted into the global leaderboard yet';
    }
  }, [selectedLocation, userLocation]);

  return (
    <div className="space-y-4">
      <ModernLeaderboard
        entries={entries || []}
        currentUserId={userLocation?.id}
        currentUserRank={myRank}
        title="Leaderboard"
        subtitle="Compete with members in your area"
        isLoading={locationLoading || entriesLoading}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        locationOptions={locationOptions}
        locationLabel={locationLabel}
        emptyMessage={emptyMessage}
      />

      {/* Visibility Notice */}
      {userLocation && !userLocation.leaderboard_visible && (
        <div className="flex items-center gap-3 p-4 rounded-xl glass-subtle border border-primary/20">
          <AlertCircle className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            You're not visible on leaderboards.{' '}
            <Link to="/dashboard/client/settings?tab=preferences" className="text-primary underline hover:text-primary/80">
              Enable visibility
            </Link>{' '}
            to compete.
          </p>
        </div>
      )}
    </div>
  );
}
