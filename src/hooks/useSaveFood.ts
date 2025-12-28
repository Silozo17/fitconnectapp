import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FatSecretFood } from './useFatSecretSearch';
import { Food } from './useFoods';

interface SaveFoodParams {
  food: FatSecretFood;
  coachId: string;
}

export const useSaveFood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ food, coachId }: SaveFoodParams): Promise<Food> => {
      // First check if this food already exists for this coach
      const { data: existingFood } = await supabase
        .from('foods')
        .select('*')
        .eq('fatsecret_id', food.fatsecret_id)
        .eq('coach_id', coachId)
        .maybeSingle();

      if (existingFood) {
        // Return existing food if already saved
        return existingFood as Food;
      }

      // Insert new food
      const { data, error } = await supabase
        .from('foods')
        .insert({
          name: food.brand_name ? `${food.name} (${food.brand_name})` : food.name,
          fatsecret_id: food.fatsecret_id,
          source: 'fatsecret',
          calories_per_100g: food.calories_per_100g,
          protein_g: food.protein_g,
          carbs_g: food.carbs_g,
          fat_g: food.fat_g,
          fiber_g: food.fiber_g,
          serving_size_g: food.serving_size_g,
          serving_description: food.serving_description,
          coach_id: coachId,
          is_custom: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving food:', error);
        throw new Error('Failed to save food');
      }

      return data as Food;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] });
      queryClient.invalidateQueries({ queryKey: ['saved-foods'] });
    },
  });
};

// Hook to get saved FatSecret foods for a coach
export const useSavedFoods = (coachId: string | undefined, searchQuery?: string) => {
  return useQueryClient().fetchQuery({
    queryKey: ['saved-foods', coachId, searchQuery],
    queryFn: async () => {
      if (!coachId) return [];

      let query = supabase
        .from('foods')
        .select('*')
        .eq('coach_id', coachId)
        .eq('source', 'fatsecret')
        .order('name');

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Food[];
    },
  });
};
