import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
}

export interface HabitLog {
  id: string;
  habit_id: string;
  client_id: string;
  logged_at: string;
  completed_count: number;
  notes: string | null;
  created_at: string;
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

const HABIT_CATEGORIES = [
  { value: 'nutrition', label: 'Nutrition', icon: '🥗', color: 'text-green-500' },
  { value: 'exercise', label: 'Exercise', icon: '💪', color: 'text-blue-500' },
  { value: 'sleep', label: 'Sleep', icon: '😴', color: 'text-purple-500' },
  { value: 'mindfulness', label: 'Mindfulness', icon: '🧘', color: 'text-teal-500' },
  { value: 'supplement', label: 'Supplement', icon: '💊', color: 'text-orange-500' },
  { value: 'water', label: 'Water', icon: '💧', color: 'text-cyan-500' },
  { value: 'other', label: 'Other', icon: '✓', color: 'text-muted-foreground' },
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
  if (streak >= 100) return { emoji: '🏆', label: 'Habit Hero!' };
  if (streak >= 30) return { emoji: '⭐', label: 'Monthly Master!' };
  if (streak >= 14) return { emoji: '🔥🔥🔥', label: 'Two Weeks!' };
  if (streak >= 7) return { emoji: '🔥🔥', label: 'One Week Strong!' };
  if (streak >= 3) return { emoji: '🔥', label: 'Getting Started!' };
  return { emoji: '🔥', label: '' };
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
  
  return useQuery({
    queryKey: ['my-habits', user?.id],
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
      
      // Get streaks for these habits
      const habitIds = habits.map(h => h.id);
      const { data: streaks } = await supabase
        .from('habit_streaks')
        .select('*')
        .in('habit_id', habitIds);
      
      // Get today's logs
      const today = new Date().toISOString().split('T')[0];
      const { data: todayLogs } = await supabase
        .from('habit_logs')
        .select('*')
        .in('habit_id', habitIds)
        .eq('logged_at', today);
      
      // Combine data
      return habits.map(habit => ({
        ...habit,
        streak: streaks?.find(s => s.habit_id === habit.id),
        todayLog: todayLogs?.find(l => l.habit_id === habit.id),
      })) as HabitWithStreak[];
    },
    enabled: !!user,
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
    onError: (error) => {
      toast.error('Failed to create habit: ' + error.message);
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
    onError: (error) => {
      toast.error('Failed to update habit: ' + error.message);
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
    onError: (error) => {
      toast.error('Failed to delete habit: ' + error.message);
    },
  });
};

// Mutation to log a habit (client)
export const useLogHabit = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ habitId, notes }: { habitId: string; notes?: string }) => {
      // Get client profile
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();
      
      if (!clientProfile) throw new Error('Client profile not found');
      
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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-habits'] });
      toast.success('Habit completed! 🎉');
    },
    onError: (error) => {
      toast.error('Failed to log habit: ' + error.message);
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
    onError: (error) => {
      toast.error('Failed to undo: ' + error.message);
    },
  });
};
