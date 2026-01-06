import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, startOfDay, endOfDay } from "date-fns";
import { checkCoachDataAccess } from "./useCoachDataAccess";

export interface FoodDiaryEntry {
  id: string;
  client_id: string;
  logged_at: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_id: string | null;
  external_id: string | null;
  food_name: string;
  serving_size_g: number | null;
  servings: number;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  sugar_g: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FoodDiaryInsert {
  client_id: string;
  logged_at?: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_id?: string | null;
  external_id?: string | null;
  food_name: string;
  serving_size_g?: number | null;
  servings?: number;
  calories?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
  fiber_g?: number | null;
  sugar_g?: number | null;
  sodium_mg?: number | null;
  notes?: string | null;
  source?: 'manual' | 'openfoodfacts' | 'calorieninjas' | 'custom';
  food_type?: 'product' | 'generic' | 'recipe' | 'custom';
}

export interface DailyMacros {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

// Fetch food diary entries for a specific date
export const useFoodDiary = (clientId: string | undefined, date: Date) => {
  return useQuery({
    queryKey: ['food-diary', clientId, format(date, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!clientId) return [];
      
      const { data, error } = await supabase
        .from('food_diary')
        .select('*')
        .eq('client_id', clientId)
        .gte('logged_at', startOfDay(date).toISOString())
        .lte('logged_at', endOfDay(date).toISOString())
        .order('logged_at', { ascending: true });

      if (error) throw error;
      return data as FoodDiaryEntry[];
    },
    enabled: !!clientId,
  });
};

// Fetch food diary entries for a date range (for coach viewing)
// Food logs are ALWAYS accessible to connected coaches (no sharing preference check needed)
export const useFoodDiaryRange = (
  clientId: string | undefined, 
  startDate: Date, 
  endDate: Date,
  _coachId?: string // Kept for API compatibility but not used - food logs always accessible
) => {
  return useQuery({
    queryKey: ['food-diary-range', clientId, format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!clientId) return [];
      
      // Food logs are always accessible to connected coaches
      // RLS policies on food_diary table handle actual authorization
      
      const { data, error } = await supabase
        .from('food_diary')
        .select('*')
        .eq('client_id', clientId)
        .gte('logged_at', startOfDay(startDate).toISOString())
        .lte('logged_at', endOfDay(endDate).toISOString())
        .order('logged_at', { ascending: true });

      if (error) throw error;
      return data as FoodDiaryEntry[];
    },
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000,
  });
};

// Add a food diary entry
export const useAddFoodDiaryEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: FoodDiaryInsert) => {
      const { data, error } = await supabase
        .from('food_diary')
        .insert(entry)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['food-diary'] });
      toast.success('Food logged successfully');
    },
    onError: (error) => {
      console.error('Error adding food diary entry:', error);
      toast.error('Failed to log food');
    },
  });
};

// Update a food diary entry
export const useUpdateFoodDiaryEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FoodDiaryEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from('food_diary')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-diary'] });
      toast.success('Entry updated');
    },
    onError: (error) => {
      console.error('Error updating food diary entry:', error);
      toast.error('Failed to update entry');
    },
  });
};

// Delete a food diary entry
export const useDeleteFoodDiaryEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('food_diary')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-diary'] });
      toast.success('Entry deleted');
    },
    onError: (error) => {
      console.error('Error deleting food diary entry:', error);
      toast.error('Failed to delete entry');
    },
  });
};

// Calculate daily macros from entries
export const calculateDailyMacros = (entries: FoodDiaryEntry[]): DailyMacros => {
  return entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + (entry.calories || 0) * (entry.servings || 1),
      protein_g: acc.protein_g + (entry.protein_g || 0) * (entry.servings || 1),
      carbs_g: acc.carbs_g + (entry.carbs_g || 0) * (entry.servings || 1),
      fat_g: acc.fat_g + (entry.fat_g || 0) * (entry.servings || 1),
      fiber_g: acc.fiber_g + (entry.fiber_g || 0) * (entry.servings || 1),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 }
  );
};

// Group entries by meal type
export const groupEntriesByMeal = (entries: FoodDiaryEntry[]) => {
  const grouped: Record<string, FoodDiaryEntry[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };

  entries.forEach(entry => {
    if (grouped[entry.meal_type]) {
      grouped[entry.meal_type].push(entry);
    }
  });

  return grouped;
};
