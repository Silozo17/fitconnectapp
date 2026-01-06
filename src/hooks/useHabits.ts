import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { triggerHaptic } from "@/lib/despia";
import { useCelebration, StreakMilestone } from "@/contexts/CelebrationContext";
import { checkIsFirstHabitLog } from "@/hooks/useFirstTimeTracker";
import { format, startOfDay } from "date-fns";

// Streak milestones that trigger celebrations
const STREAK_MILESTONES = [7, 30, 100] as const;

export interface Habit {
  id: string;
  coach_id: string;
  client_id: string;
  name: string;
  description: string | null;
  category: string;
  frequency: string;
  specific_days: number[];
  target_count: number;
  reminder_time: string | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  // Wearable linking fields
  wearable_target_type: string | null;
  wearable_target_value: number | null;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  client_id: string;
  logged_at: string;
  completed_count: number;
  notes: string | null;
  created_at: string;
  // Verification fields
  verification_type: 'manual' | 'wearable_auto' | 'coach_verified';
  health_data_id: string | null;
}

export interface HabitStreak {
  id: string;
  habit_id: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  total_completions: number;
  updated_at: string;
}

export interface HabitWithStreak extends Habit {
  streak?: HabitStreak;
  todayLog?: HabitLog;
}

// Wearable target types for habits
export const WEARABLE_HABIT_TARGETS = [
  { value: 'steps', label: 'Steps', unit: 'steps', defaultValue: 10000, icon: 'Footprints' },
  { value: 'calories', label: 'Calories Burned', unit: 'kcal', defaultValue: 500, icon: 'Flame' },
  { value: 'active_minutes', label: 'Active Minutes', unit: 'min', defaultValue: 30, icon: 'Timer' },
  { value: 'sleep', label: 'Sleep Hours', unit: 'hours', defaultValue: 8, icon: 'Moon' },
  { value: 'distance', label: 'Distance', unit: 'km', defaultValue: 5, icon: 'MapPin' },
];

const HABIT_CATEGORIES = [
  { value: 'nutrition', label: 'Nutrition', icon: 'Salad', color: 'text-green-500' },
  { value: 'exercise', label: 'Exercise', icon: 'Dumbbell', color: 'text-blue-500' },
  { value: 'sleep', label: 'Sleep', icon: 'Moon', color: 'text-purple-500' },
  { value: 'mindfulness', label: 'Mindfulness', icon: 'Flower2', color: 'text-teal-500' },
  { value: 'supplement', label: 'Supplement', icon: 'Pill', color: 'text-orange-500' },
  { value: 'water', label: 'Water', icon: 'Droplet', color: 'text-cyan-500' },
  { value: 'other', label: 'Other', icon: 'Check', color: 'text-muted-foreground' },
];

export const getHabitCategory = (category: string) => {
  return HABIT_CATEGORIES.find(c => c.value === category) || HABIT_CATEGORIES[6];
};

export const HABIT_CATEGORIES_LIST = HABIT_CATEGORIES;

// Check if habit is due today based on frequency
export const isHabitDueToday = (habit: Habit): boolean => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  if (habit.frequency === 'daily') return true;
  if (habit.frequency === 'specific_days') {
    return habit.specific_days?.includes(dayOfWeek) || false;
  }
  return true;
};

// Get streak milestone info
export const getStreakMilestone = (streak: number) => {
  if (streak >= 100) return { icon: 'Trophy', label: 'Habit Hero!' };
  if (streak >= 30) return { icon: 'Star', label: 'Monthly Master!' };
  if (streak >= 14) return { icon: 'Flame', label: 'Two Weeks!' };
  if (streak >= 7) return { icon: 'Flame', label: 'One Week Strong!' };
  if (streak >= 3) return { icon: 'Flame', label: 'Getting Started!' };
  return { icon: 'Flame', label: '' };
};

// Hook for coaches to get client habits
export const useClientHabits = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['client-habits', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      
      const { data, error } = await supabase
        .from('client_habits')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Habit[];
    },
    enabled: !!clientId,
  });
};

// Hook for clients to get their own habits with streaks
export const useMyHabits = () => {
  const { user } = useAuth();
  const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
  
  return useQuery({
    queryKey: ['my-habits', user?.id, todayStr], // Include date to bust cache at midnight
    queryFn: async () => {
      if (!user) return [];
      
      // First get client profile
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!clientProfile) return [];
      
      // Get habits
      const { data: habits, error } = await supabase
        .from('client_habits')
        .select('*')
        .eq('client_id', clientProfile.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (!habits || habits.length === 0) return [];
      
      // EMPTY ARRAY GUARD: Only query if we have habit IDs
      const habitIds = habits.map(h => h.id);
      
      // Get streaks and today's logs in parallel - use local date for consistency
      const today = todayStr;
      const [streaksResult, todayLogsResult] = await Promise.all([
        supabase.from('habit_streaks').select('*').in('habit_id', habitIds),
        supabase.from('habit_logs').select('*').in('habit_id', habitIds).eq('logged_at', today),
      ]);
      
      const streaks = streaksResult.data || [];
      const todayLogs = todayLogsResult.data || [];
      
      // Combine data
      return habits.map(habit => ({
        ...habit,
        streak: streaks.find(s => s.habit_id === habit.id),
        todayLog: todayLogs.find(l => l.habit_id === habit.id),
      })) as HabitWithStreak[];
    },
    enabled: !!user,
    refetchOnMount: 'always', // Always refetch when component mounts
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook to get today's habits for client
export const useTodaysHabits = () => {
  const { data: habits, ...rest } = useMyHabits();
  
  const todaysHabits = habits?.filter(isHabitDueToday) || [];
  const completedCount = todaysHabits.filter(h => h.todayLog).length;
  
  return {
    ...rest,
    data: todaysHabits,
    completedCount,
    totalCount: todaysHabits.length,
  };
};

// Hook to get habit logs for a specific habit
export const useHabitLogs = (habitId: string | undefined, days: number = 30) => {
  return useQuery({
    queryKey: ['habit-logs', habitId, days],
    queryFn: async () => {
      if (!habitId) return [];
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('habit_id', habitId)
        .gte('logged_at', startDate.toISOString().split('T')[0])
        .order('logged_at', { ascending: false });
      
      if (error) throw error;
      return data as HabitLog[];
    },
    enabled: !!habitId,
  });
};

// Mutation to create a habit (coach)
export const useCreateHabit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('client_habits')
        .insert(habit)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client-habits', variables.client_id] });
      toast.success('Habit created successfully');
    },
    onError: () => {
      toast.error('Failed to create habit. Please try again.');
    },
  });
};

// Mutation to update a habit (coach)
export const useUpdateHabit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Habit> & { id: string }) => {
      const { data, error } = await supabase
        .from('client_habits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['client-habits', data.client_id] });
      toast.success('Habit updated');
    },
    onError: () => {
      toast.error('Failed to update habit. Please try again.');
    },
  });
};

// Mutation to delete a habit (coach)
export const useDeleteHabit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, clientId }: { id: string; clientId: string }) => {
      const { error } = await supabase
        .from('client_habits')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, clientId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client-habits', variables.clientId] });
      toast.success('Habit deleted');
    },
    onError: () => {
      toast.error('Failed to delete habit. Please try again.');
    },
  });
};

// Helper to check if streak hits a milestone
const checkStreakMilestone = (newStreak: number): StreakMilestone | null => {
  if (STREAK_MILESTONES.includes(newStreak as StreakMilestone)) {
    return newStreak as StreakMilestone;
  }
  return null;
};

// Mutation to log a habit (client)
// Pass celebration callbacks from component that has access to useCelebration
export const useLogHabit = (callbacks?: {
  onFirstHabit?: () => void;
  onStreakMilestone?: (days: StreakMilestone, habitName: string) => void;
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ habitId, habitName, notes, previousStreak = 0 }: { 
      habitId: string; 
      habitName?: string;
      notes?: string;
      previousStreak?: number;
    }) => {
      // Get client profile
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();
      
      if (!clientProfile) throw new Error('Client profile not found');
      
      // Check if this is the first habit BEFORE logging
      const isFirst = await checkIsFirstHabitLog(clientProfile.id);
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('habit_logs')
        .upsert({
          habit_id: habitId,
          client_id: clientProfile.id,
          logged_at: today,
          completed_count: 1,
          notes,
        }, {
          onConflict: 'habit_id,logged_at',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Return data with streak info and first-time flag
      return { ...data, previousStreak, isFirst, habitName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-habits'] });
      queryClient.invalidateQueries({ queryKey: ['first-time-habit-logs'] });
      
      // Haptic feedback for every habit completion
      triggerHaptic('light');
      
      // Check for first-time achievement
      if (data.isFirst && callbacks?.onFirstHabit) {
        callbacks.onFirstHabit();
        return; // Don't show other toasts for first habit
      }
      
      // Check for streak milestone celebration
      const newStreak = (data.previousStreak || 0) + 1;
      const milestone = checkStreakMilestone(newStreak);
      
      if (milestone && callbacks?.onStreakMilestone) {
        callbacks.onStreakMilestone(milestone, data.habitName || 'Daily Habit');
      } else if (milestone) {
        // Fallback toast if no celebration callback
        toast.success(`${milestone}-day streak! 🔥`, {
          description: 'Keep up the amazing work!',
        });
      } else {
        toast.success('Habit completed! 🎉');
      }
    },
    onError: () => {
      toast.error('Failed to log habit. Please try again.');
    },
  });
};

// Mutation to unlog a habit (client - undo)
export const useUnlogHabit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (logId: string) => {
      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .eq('id', logId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-habits'] });
      toast.success('Habit unmarked');
    },
    onError: () => {
      toast.error('Failed to undo. Please try again.');
    },
  });
};
