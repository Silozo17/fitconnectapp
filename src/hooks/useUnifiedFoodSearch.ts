import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

export interface UnifiedFoodResult {
  external_id: string;
  barcode: string | null;
  product_name: string;
  brand: string | null;
  calories_per_100g: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g?: number | null;
  sugar_g?: number | null;
  sodium_mg?: number | null;
  serving_size_g?: number | null;
  food_type: 'product' | 'generic';
  source: 'openfoodfacts' | 'calorieninjas';
  allergens: string[];
  image_url: string | null;
  score?: number;
}

interface UnifiedSearchResponse {
  results: UnifiedFoodResult[];
  total: number;
  hasMore: boolean;
  isGenericQuery?: boolean;
}

interface PageData {
  results: UnifiedFoodResult[];
  nextOffset: number;
  hasMore: boolean;
  total: number;
}

/**
 * Unified food search hook that combines CalorieNinjas (generic foods)
 * and Open Food Facts (branded products) into a single search experience.
 * 
 * Features:
 * - Automatic prioritization of generic vs branded results based on query
 * - Infinite scroll pagination
 * - Debounced queries
 * - Deduplication
 */
export const useUnifiedFoodSearch = (
  query: string,
  enabled: boolean,
  country: string = 'GB',
  pageSize: number = 10
) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return useInfiniteQuery<PageData, Error>({
    queryKey: ['unified-food-search', debouncedQuery, country],
    queryFn: async ({ pageParam }): Promise<PageData> => {
      const offset = pageParam as number;
      
      const { data, error } = await supabase.functions.invoke<UnifiedSearchResponse>(
        'unified-food-search',
        {
          body: { 
            query: debouncedQuery, 
            country, 
            limit: pageSize, 
            offset 
          },
        }
      );

      if (error) {
        console.error('[useUnifiedFoodSearch] Error:', error);
        throw error;
      }

      return {
        results: data?.results || [],
        nextOffset: offset + pageSize,
        hasMore: data?.hasMore ?? false,
        total: data?.total ?? 0,
      };
    },
    getNextPageParam: (lastPage) => 
      lastPage.hasMore ? lastPage.nextOffset : undefined,
    initialPageParam: 0,
    enabled: enabled && debouncedQuery.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Convert a UnifiedFoodResult to the format expected by FoodDiaryInsert
 */
export const unifiedResultToFoodEntry = (
  result: UnifiedFoodResult,
  servings: number = 1,
  servingSizeG: number = 100
) => {
  const factor = servingSizeG / 100;
  
  return {
    external_id: result.external_id,
    food_name: result.product_name,
    serving_size_g: servingSizeG,
    servings,
    calories: result.calories_per_100g ? Math.round(result.calories_per_100g * factor) : null,
    protein_g: result.protein_g ? Math.round(result.protein_g * factor * 10) / 10 : null,
    carbs_g: result.carbs_g ? Math.round(result.carbs_g * factor * 10) / 10 : null,
    fat_g: result.fat_g ? Math.round(result.fat_g * factor * 10) / 10 : null,
    fiber_g: result.fiber_g ? Math.round(result.fiber_g * factor * 10) / 10 : null,
    sugar_g: result.sugar_g ? Math.round(result.sugar_g * factor * 10) / 10 : null,
    source: result.source,
    food_type: result.food_type,
  };
};
