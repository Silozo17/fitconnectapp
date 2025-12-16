import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Food = Tables<'foods'>;
export type FoodCategory = Tables<'food_categories'>;
export type FoodInsert = TablesInsert<'foods'>;

export interface MealFood {
  id: string;
  food: Food;
  servings: number;
  notes?: string;
}

export interface Meal {
  id: string;
  name: string;
  time?: string;
  foods: MealFood[];
}

export interface NutritionDay {
  id: string;
  name: string;
  meals: Meal[];
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
}

export const useFoodCategories = () => {
  return useQuery({
    queryKey: ['food-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as FoodCategory[];
    },
  });
};

export const useFoods = (categoryId?: string, searchQuery?: string) => {
  return useQuery({
    queryKey: ['foods', categoryId, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('foods')
        .select('*, food_categories(name, icon, color)')
        .order('name');
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as (Food & { food_categories: FoodCategory | null })[];
    },
  });
};

export const useCreateFood = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (food: FoodInsert) => {
      const { data, error } = await supabase
        .from('foods')
        .insert(food)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] });
    },
  });
};

export const useUpdateFood = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Food> & { id: string }) => {
      const { data, error } = await supabase
        .from('foods')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] });
    },
  });
};

export const useDeleteFood = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('foods')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] });
    },
  });
};

// Calculate macros for a meal
export const calculateMealMacros = (foods: MealFood[]) => {
  return foods.reduce(
    (acc, { food, servings }) => {
      const multiplier = (servings * (food.serving_size_g || 100)) / 100;
      return {
        calories: acc.calories + (food.calories_per_100g || 0) * multiplier,
        protein: acc.protein + (food.protein_g || 0) * multiplier,
        carbs: acc.carbs + (food.carbs_g || 0) * multiplier,
        fat: acc.fat + (food.fat_g || 0) * multiplier,
        fiber: acc.fiber + (food.fiber_g || 0) * multiplier,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
};

// Calculate daily macros
export const calculateDayMacros = (meals: Meal[]) => {
  return meals.reduce(
    (acc, meal) => {
      const mealMacros = calculateMealMacros(meal.foods);
      return {
        calories: acc.calories + mealMacros.calories,
        protein: acc.protein + mealMacros.protein,
        carbs: acc.carbs + mealMacros.carbs,
        fat: acc.fat + mealMacros.fat,
        fiber: acc.fiber + mealMacros.fiber,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
};
