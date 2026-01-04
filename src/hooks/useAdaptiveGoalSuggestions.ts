import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { subDays, format } from 'date-fns';

export interface GoalSuggestion {
  id: string;
  type: 'calorie_adjustment' | 'weight_plateau' | 'rapid_loss' | 'overperformance' | 'underperformance';
  title: string;
  description: string;
  suggestion: string;
  severity: 'info' | 'warning' | 'success';
  actionLabel?: string;
  dismissLabel?: string;
}

/**
 * Detects progress patterns and suggests goal adjustments.
 */
export function useAdaptiveGoalSuggestions() {
  const { user } = useAuth();

  // Track dismissed suggestions in localStorage with expiry (2 weeks)
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('dismissed-goal-suggestions');
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      // Filter out expired dismissals
      const valid = parsed.filter((item: { id: string; dismissedAt: number }) => 
        item.dismissedAt > twoWeeksAgo
      );
      return valid.map((item: { id: string }) => item.id);
    } catch {
      return [];
    }
  });

  const { data: suggestions, isLoading } = useQuery<GoalSuggestion[]>({
    queryKey: ['adaptive-goal-suggestions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get client profile
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id, weight_kg, fitness_goals')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!clientProfile) return [];

      // Get weight progress for last 3 weeks
      const threeWeeksAgo = format(subDays(new Date(), 21), 'yyyy-MM-dd');
      const { data: progressData } = await supabase
        .from('client_progress')
        .select('weight_kg, recorded_at')
        .eq('client_id', clientProfile.id)
        .gte('recorded_at', threeWeeksAgo)
        .order('recorded_at', { ascending: true });

      const result: GoalSuggestion[] = [];

      if (progressData && progressData.length >= 2) {
        const weights = progressData
          .filter(p => p.weight_kg)
          .map(p => ({ weight: p.weight_kg!, date: p.recorded_at }));

        if (weights.length >= 2) {
          const firstWeight = weights[0].weight;
          const lastWeight = weights[weights.length - 1].weight;
          const weightChange = lastWeight - firstWeight;
          const daysDiff = Math.max(1, (new Date(weights[weights.length - 1].date).getTime() - new Date(weights[0].date).getTime()) / (1000 * 60 * 60 * 24));
          const weeklyChange = (weightChange / daysDiff) * 7;

          // Check for weight plateau (less than 0.2kg change in 2+ weeks)
          if (daysDiff >= 14 && Math.abs(weightChange) < 0.2) {
            result.push({
              id: 'weight-plateau',
              type: 'weight_plateau',
              title: 'Progress has stalled',
              description: 'Your weight has been stable for over 2 weeks.',
              suggestion: 'Consider adjusting your calorie targets or adding variety to your workouts.',
              severity: 'info',
              actionLabel: 'View nutrition settings',
              dismissLabel: 'Dismiss',
            });
          }

          // Check for rapid weight loss (more than 1kg/week)
          if (weeklyChange < -1) {
            result.push({
              id: 'rapid-loss',
              type: 'rapid_loss',
              title: 'Rapid weight change detected',
              description: `You're losing about ${Math.abs(weeklyChange).toFixed(1)}kg per week.`,
              suggestion: 'This pace may be too fast. Consider slowing down for sustainable results.',
              severity: 'warning',
              actionLabel: 'Adjust targets',
              dismissLabel: 'I understand',
            });
          }

          // Check for consistent progress (positive reinforcement)
          if (weeklyChange >= -0.75 && weeklyChange <= -0.25 && daysDiff >= 14) {
            result.push({
              id: 'good-progress',
              type: 'overperformance',
              title: 'Great progress!',
              description: 'You\'re losing weight at a healthy, sustainable pace.',
              suggestion: 'Keep up the great work! Your current plan is working well.',
              severity: 'success',
              dismissLabel: 'Thanks!',
            });
          }
        }
      }

      // Get habit completion rate
      const twoWeeksAgo = format(subDays(new Date(), 14), 'yyyy-MM-dd');
      const { data: habitLogs } = await supabase
        .from('habit_logs')
        .select('completed_count')
        .eq('client_id', clientProfile.id)
        .gte('logged_at', twoWeeksAgo);

      if (habitLogs && habitLogs.length >= 10) {
        // Count entries with completed_count > 0 as completed
        const completedCount = habitLogs.filter(h => (h.completed_count ?? 0) > 0).length;
        const completionRate = completedCount / habitLogs.length;
        
        if (completionRate >= 0.9) {
          result.push({
            id: 'habit-master',
            type: 'overperformance',
            title: 'Habit Champion!',
            description: `${Math.round(completionRate * 100)}% completion rate over 2 weeks.`,
            suggestion: 'You\'re building strong habits. Consider adding a new challenge!',
            severity: 'success',
            actionLabel: 'View challenges',
            dismissLabel: 'Keep going',
          });
        } else if (completionRate < 0.5) {
          result.push({
            id: 'habit-struggle',
            type: 'underperformance',
            title: 'Habits need attention',
            description: 'Completion rate has dropped below 50%.',
            suggestion: 'Consider simplifying your habits or adjusting timing.',
            severity: 'info',
            actionLabel: 'Manage habits',
            dismissLabel: 'Dismiss',
          });
        }
      }

      return result;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Filter out dismissed suggestions
  const activeSuggestions = suggestions?.filter(s => !dismissedIds.includes(s.id)) || [];

  // Dismiss a suggestion - persists with expiry timestamp
  const dismissSuggestion = useCallback((id: string) => {
    setDismissedIds(prev => {
      const updated = [...prev, id];
      // Store with timestamps for expiry
      try {
        const stored = localStorage.getItem('dismissed-goal-suggestions');
        const existing = stored ? JSON.parse(stored) : [];
        const newEntry = { id, dismissedAt: Date.now() };
        const filtered = existing.filter((item: { id: string }) => item.id !== id);
        localStorage.setItem('dismissed-goal-suggestions', JSON.stringify([...filtered, newEntry]));
      } catch {
        // Fallback silently
      }
      return updated;
    });
  }, []);

  return {
    suggestions: activeSuggestions,
    allSuggestions: suggestions || [],
    isLoading,
    hasSuggestions: activeSuggestions.length > 0,
    dismissSuggestion,
  };
}
