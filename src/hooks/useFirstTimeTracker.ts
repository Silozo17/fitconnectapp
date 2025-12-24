import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Helper hook to check if certain actions are being performed for the first time.
 * Used to trigger first-time achievement celebrations.
 */
export function useFirstTimeTracker() {
  const { user } = useAuth();

  // Get client profile ID
  const { data: clientProfile } = useQuery({
    queryKey: ['first-time-client-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
    staleTime: Infinity,
  });

  // Check if user has any habit logs
  const { data: habitLogCount } = useQuery({
    queryKey: ['first-time-habit-logs', clientProfile?.id],
    queryFn: async () => {
      if (!clientProfile?.id) return 0;
      const { count } = await supabase
        .from('habit_logs')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', clientProfile.id);
      return count || 0;
    },
    enabled: !!clientProfile?.id,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Check if user has any progress photos
  const { data: progressPhotoCount } = useQuery({
    queryKey: ['first-time-progress-photos', clientProfile?.id],
    queryFn: async () => {
      if (!clientProfile?.id) return 0;
      const { data } = await supabase
        .from('client_progress')
        .select('photo_urls')
        .eq('client_id', clientProfile.id)
        .not('photo_urls', 'is', null);
      
      // Count entries with non-empty photo arrays
      const withPhotos = (data || []).filter(
        (p) => p.photo_urls && Array.isArray(p.photo_urls) && p.photo_urls.length > 0
      );
      return withPhotos.length;
    },
    enabled: !!clientProfile?.id,
    staleTime: 30000,
  });

  // Check if user has any accepted connections
  const { data: connectionCount } = useQuery({
    queryKey: ['first-time-connections', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from('user_connections')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'accepted')
        .or(`requester_user_id.eq.${user.id},addressee_user_id.eq.${user.id}`);
      return count || 0;
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  // Check if user has any workouts logged
  const { data: workoutCount } = useQuery({
    queryKey: ['first-time-workouts', clientProfile?.id],
    queryFn: async () => {
      if (!clientProfile?.id) return 0;
      const { count } = await supabase
        .from('xp_transactions')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', clientProfile.id)
        .eq('source', 'workout_logged');
      return count || 0;
    },
    enabled: !!clientProfile?.id,
    staleTime: 30000,
  });

  return {
    isFirstHabit: habitLogCount === 0,
    isFirstProgressPhoto: progressPhotoCount === 0,
    isFirstConnection: connectionCount === 0,
    isFirstWorkout: workoutCount === 0,
    clientProfileId: clientProfile?.id,
    isLoading: !clientProfile,
  };
}

/**
 * Standalone check functions for use in mutation callbacks
 * These bypass React Query for immediate checks during mutations
 */
export async function checkIsFirstHabitLog(clientId: string): Promise<boolean> {
  const { count } = await supabase
    .from('habit_logs')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', clientId);
  return (count || 0) === 0;
}

export async function checkIsFirstProgressPhoto(clientId: string): Promise<boolean> {
  const { data } = await supabase
    .from('client_progress')
    .select('photo_urls')
    .eq('client_id', clientId)
    .not('photo_urls', 'is', null);
  
  const withPhotos = (data || []).filter(
    (p) => p.photo_urls && Array.isArray(p.photo_urls) && p.photo_urls.length > 0
  );
  return withPhotos.length === 0;
}

export async function checkIsFirstConnection(userId: string): Promise<boolean> {
  const { count } = await supabase
    .from('user_connections')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'accepted')
    .or(`requester_user_id.eq.${userId},addressee_user_id.eq.${userId}`);
  return (count || 0) === 0;
}

export async function checkIsFirstWorkout(clientId: string): Promise<boolean> {
  const { count } = await supabase
    .from('xp_transactions')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .eq('source', 'workout_logged');
  return (count || 0) === 0;
}
