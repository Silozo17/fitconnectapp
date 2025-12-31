import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { triggerConfetti, confettiPresets } from '@/lib/confetti';
import { triggerHaptic } from '@/lib/despia';
import { toast } from 'sonner';
import { startOfWeek, startOfDay, subDays } from 'date-fns';

export type MicroWinType =
  | 'first_habit_week'
  | 'streak_milestone'
  | 'progress_logged'
  | 'welcome';

interface MicroWin {
  type: MicroWinType;
  message: string;
}

/**
 * Detects and celebrates micro-wins for clients.
 * Checks for: first habit of the week, streak milestones, progress logged.
 */
export function useMicroWinDetection() {
  const { user } = useAuth();
  const celebratedRef = useRef<Set<string>>(new Set());

  const { data: wins = [], isLoading } = useQuery({
    queryKey: ['micro-wins', user?.id],
    queryFn: async (): Promise<MicroWin[]> => {
      if (!user?.id) return [];

      const microWins: MicroWin[] = [];
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
      const today = startOfDay(now);
      const todayStr = today.toISOString().split('T')[0];

      // Get client profile
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!clientProfile) return [];

      // Check for first habit completion of the week (using logged_at)
      const { data: weekHabits } = await supabase
        .from('habit_logs')
        .select('id, logged_at, completed_count')
        .eq('client_id', clientProfile.id)
        .gte('logged_at', weekStart.toISOString())
        .gt('completed_count', 0)
        .order('logged_at', { ascending: true })
        .limit(1);

      if (weekHabits && weekHabits.length > 0) {
        const firstLog = weekHabits[0];
        const logDate = new Date(firstLog.logged_at).toISOString().split('T')[0];
        if (logDate === todayStr) {
          microWins.push({
            type: 'first_habit_week',
            message: 'First habit of the week completed! 🌟',
          });
        }
      }

      // Check for streak milestones by counting consecutive days with habit completions
      const { data: recentLogs } = await supabase
        .from('habit_logs')
        .select('logged_at, completed_count')
        .eq('client_id', clientProfile.id)
        .gte('logged_at', subDays(now, 90).toISOString())
        .gt('completed_count', 0)
        .order('logged_at', { ascending: false });

      if (recentLogs && recentLogs.length > 0) {
        // Count consecutive days with completed habits
        let streakDays = 0;
        const uniqueDates = [...new Set(recentLogs.map(l => 
          new Date(l.logged_at).toISOString().split('T')[0]
        ))].sort().reverse();
        
        for (let i = 0; i < Math.min(uniqueDates.length, 90); i++) {
          const expectedDate = subDays(today, i).toISOString().split('T')[0];
          if (uniqueDates.includes(expectedDate)) {
            streakDays++;
          } else {
            break;
          }
        }

        const milestones = [7, 14, 30, 60, 90];
        if (milestones.includes(streakDays)) {
          microWins.push({
            type: 'streak_milestone',
            message: `${streakDays}-day streak achieved! 🔥`,
          });
        }
      }

      // Check for progress logged today
      const { data: todayProgress } = await supabase
        .from('client_progress')
        .select('id')
        .eq('client_id', clientProfile.id)
        .gte('recorded_at', today.toISOString())
        .limit(1);

      if (todayProgress && todayProgress.length > 0) {
        // Check if this is the first progress log this week
        const { count: weekProgressCount } = await supabase
          .from('client_progress')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', clientProfile.id)
          .gte('recorded_at', weekStart.toISOString());

        if (weekProgressCount === 1) {
          microWins.push({
            type: 'progress_logged',
            message: 'Progress tracked this week! 📈',
          });
        }
      }

      return microWins;
    },
    enabled: !!user?.id,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });

  // Celebrate wins that haven't been celebrated yet
  useEffect(() => {
    if (!wins || wins.length === 0) return;

    // Check session storage for today's celebrations
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `microwin-celebrated-${today}`;
    const celebrated = new Set<string>(
      JSON.parse(sessionStorage.getItem(storageKey) || '[]')
    );

    for (const win of wins) {
      const winKey = `${win.type}-${today}`;
      
      if (!celebrated.has(winKey) && !celebratedRef.current.has(winKey)) {
        celebratedRef.current.add(winKey);
        celebrated.add(winKey);
        
        // Delay celebration for visual effect
        setTimeout(() => {
          triggerConfetti(confettiPresets.achievement);
          triggerHaptic('success');
          toast.success(win.message, {
            duration: 4000,
          });
        }, 1500);
      }
    }

    sessionStorage.setItem(storageKey, JSON.stringify([...celebrated]));
  }, [wins]);

  return { wins, isLoading };
}
