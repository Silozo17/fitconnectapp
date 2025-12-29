import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FatSecretFood } from './useFatSecretSearch';
import { OpenFoodFactsFood } from './useOpenFoodFacts';
import { Food } from './useFoods';

// Support both FatSecret and Open Food Facts food types
type SaveableFoodType = (FatSecretFood & { external_id?: string }) | OpenFoodFactsFood;

interface SaveFoodParams {
  food: SaveableFoodType;
  coachId: string;
}

export const useSaveFood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ food, coachId }: SaveFoodParams): Promise<Food> => {
      // Get the external ID - support both old and new formats
      const externalId = 'external_id' in food ? food.external_id : 
                         'fatsecret_id' in food ? (food as FatSecretFood).fatsecret_id : null;
      
      // Determine source
      const source = 'food_type' in food ? 'openfoodfacts' : 'fatsecret';
      
      // Get name with brand
      const brandName = food.brand_name;
      const fullName = brandName ? `${food.name} (${brandName})` : food.name;

      // First check if this food already exists for this coach
      if (externalId) {
        const { data: existingFood } = await supabase
          .from('foods')
          .select('*')
          .eq('external_id', externalId)
          .eq('coach_id', coachId)
          .maybeSingle();

        if (existingFood) {
          // Increment popularity for cached autocomplete
          incrementPopularity(externalId);
          return existingFood as Food;
        }
      }

      // Insert new food
      const { data, error } = await supabase
        .from('foods')
        .insert({
          name: fullName,
          external_id: externalId,
          source: source,
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

      // Increment popularity for cached autocomplete
      if (externalId) {
        incrementPopularity(externalId);
      }

      return data as Food;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] });
      queryClient.invalidateQueries({ queryKey: ['saved-foods'] });
    },
  });
};

// Helper to increment popularity (fire and forget)
async function incrementPopularity(externalId: string, country: string = 'GB') {
  try {
    await supabase.rpc('increment_food_popularity', {
      p_external_id: externalId,
      p_country: country,
    });
  } catch (e) {
    console.warn('[useSaveFood] Failed to increment popularity:', e);
  }
}

// Hook to get saved foods for a coach (supports both sources)
export const useSavedFoods = (coachId: string | undefined, searchQuery?: string) => {
  return useQueryClient().fetchQuery({
    queryKey: ['saved-foods', coachId, searchQuery],
    queryFn: async () => {
      if (!coachId) return [];

      let query = supabase
        .from('foods')
        .select('*')
        .eq('coach_id', coachId)
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
