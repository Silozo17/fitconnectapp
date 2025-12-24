import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActiveProfile } from '@/hooks/useActiveProfile';

export interface DashboardStats {
  coachCount: number;
  upcomingSessions: number;
  activePlans: number;
  unreadMessages: number;
  firstName: string;
}

export function useClientDashboardStats() {
  const { profileId, isRoleSwitching, userId } = useActiveProfile();

  return useQuery({
    queryKey: ['client-dashboard-stats', userId, profileId, isRoleSwitching],
    queryFn: async (): Promise<DashboardStats> => {
      // Determine which profile ID to use
      let profileIdToUse: string | null = null;
      let firstName = '';

      // If we're role switching as admin, use the active profile ID directly
      if (isRoleSwitching && profileId) {
        profileIdToUse = profileId;
        
        // Fetch first name for role-switching scenario
        const { data: profile } = await supabase
          .from('client_profiles')
          .select('first_name')
          .eq('id', profileId)
          .maybeSingle();
        
        firstName = profile?.first_name || '';
      } else if (userId) {
        // Fetch profile by user_id
        const { data: profile, error } = await supabase
          .from('client_profiles')
          .select('id, first_name')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) throw error;
        if (!profile) {
          return {
            coachCount: 0,
            upcomingSessions: 0,
            activePlans: 0,
            unreadMessages: 0,
            firstName: '',
          };
        }

        profileIdToUse = profile.id;
        firstName = profile.first_name || '';
      }

      if (!profileIdToUse) {
        return {
          coachCount: 0,
          upcomingSessions: 0,
          activePlans: 0,
          unreadMessages: 0,
          firstName: '',
        };
      }

      // Fetch all stats in parallel
      const [coaches, sessions, plans, messages] = await Promise.all([
        supabase
          .from('coach_clients')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', profileIdToUse)
          .eq('status', 'active'),
        supabase
          .from('coaching_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', profileIdToUse)
          .eq('status', 'scheduled')
          .gte('scheduled_at', new Date().toISOString()),
        supabase
          .from('plan_assignments')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', profileIdToUse)
          .eq('status', 'active'),
        supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('receiver_id', profileIdToUse)
          .is('read_at', null),
      ]);

      return {
        coachCount: coaches.count || 0,
        upcomingSessions: sessions.count || 0,
        activePlans: plans.count || 0,
        unreadMessages: messages.count || 0,
        firstName,
      };
    },
    enabled: !!(userId || (isRoleSwitching && profileId)),
    staleTime: 60000, // 1 minute cache
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
