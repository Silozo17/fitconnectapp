import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useDiscoverModal(role: 'client' | 'coach') {
  const [hasSeen, setHasSeen] = useState(true); // Default to true to prevent flash
  const [isLoading, setIsLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);

  // Fetch the discovery tour seen status from the database
  useEffect(() => {
    const fetchDiscoveryStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const table = role === 'client' ? 'client_profiles' : 'coach_profiles';
        const { data, error } = await supabase
          .from(table)
          .select('id, discovery_tour_seen')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching discovery status:', error);
          setIsLoading(false);
          return;
        }

        if (data) {
          setProfileId(data.id);
          setHasSeen(data.discovery_tour_seen ?? false);
        }
      } catch (error) {
        console.error('Error fetching discovery status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscoveryStatus();
  }, [role]);

  const markAsSeen = useCallback(async () => {
    if (!profileId) return;

    try {
      const table = role === 'client' ? 'client_profiles' : 'coach_profiles';
      const { error } = await supabase
        .from(table)
        .update({ discovery_tour_seen: true })
        .eq('id', profileId);

      if (error) {
        console.error('Error marking discovery as seen:', error);
        return;
      }

      setHasSeen(true);
    } catch (error) {
      console.error('Error marking discovery as seen:', error);
    }
  }, [profileId, role]);

  const resetSeen = useCallback(async () => {
    if (!profileId) return;

    try {
      const table = role === 'client' ? 'client_profiles' : 'coach_profiles';
      const { error } = await supabase
        .from(table)
        .update({ discovery_tour_seen: false })
        .eq('id', profileId);

      if (error) {
        console.error('Error resetting discovery:', error);
        return;
      }

      setHasSeen(false);
    } catch (error) {
      console.error('Error resetting discovery:', error);
    }
  }, [profileId, role]);

  return { 
    shouldShow: !isLoading && !hasSeen, 
    markAsSeen,
    resetSeen,
    isLoading
  };
}
