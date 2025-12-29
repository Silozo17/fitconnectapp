import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { validateBarcode } from '@/lib/barcodeValidator';

// Normalized food interface matching Open Food Facts data
export interface OpenFoodFactsFood {
  external_id: string;
  barcode: string | null;
  name: string;
  brand_name: string | null;
  serving_description: string;
  serving_size_g: number;
  calories_per_100g: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g?: number | null;
  sodium_mg?: number | null;
  saturated_fat_g?: number | null;
  image_url?: string | null;
  allergens: string[];
  dietary_preferences: string[];
  food_type: 'product' | 'generic';
}

// Autocomplete suggestion interface
export interface AutocompleteSuggestion {
  external_id: string;
  barcode: string | null;
  product_name: string;
  brand: string | null;
  calories_per_100g: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  image_url: string | null;
  food_type: 'product' | 'generic';
  allergens: string[];
  score?: number;
}

interface SearchResponse {
  foods: OpenFoodFactsFood[];
  meta?: {
    region: string;
    total_results: number;
    source: string;
  };
  error?: string;
}

interface AutocompleteResponse {
  suggestions: AutocompleteSuggestion[];
  source: 'cache' | 'openfoodfacts' | 'error' | 'none';
  total?: number;
  error?: string;
}

interface BarcodeResponse {
  found: boolean;
  food?: OpenFoodFactsFood;
  source?: string;
  error?: string;
}

/**
 * Hook for Open Food Facts autocomplete with local cache
 * Uses debounced queries and cached results for fast UX
 */
export const useOpenFoodFactsAutocomplete = (
  query: string,
  enabled: boolean = true,
  country: string = 'GB',
  debounceMs: number = 300
) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return useQuery({
    queryKey: ['openfoodfacts-autocomplete', debouncedQuery, country],
    queryFn: async (): Promise<AutocompleteSuggestion[]> => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return [];
      }

      const { data, error } = await supabase.functions.invoke<AutocompleteResponse>(
        'openfoodfacts-autocomplete',
        {
          body: { query: debouncedQuery, country, limit: 10 },
        }
      );

      if (error) {
        console.error('[OFF Autocomplete] Error:', error);
        throw new Error('Failed to fetch autocomplete suggestions');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.suggestions || [];
    },
    enabled: enabled && debouncedQuery.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook for full Open Food Facts search
 * Use this for comprehensive search results (not autocomplete)
 */
export const useOpenFoodFactsSearch = (
  query: string,
  enabled: boolean = true,
  region: string = 'GB'
) => {
  return useQuery({
    queryKey: ['openfoodfacts-search', query, region],
    queryFn: async (): Promise<OpenFoodFactsFood[]> => {
      if (!query || query.length < 2) {
        return [];
      }

      const { data, error } = await supabase.functions.invoke<SearchResponse>(
        'openfoodfacts-search',
        {
          body: { query, maxResults: 25, region },
        }
      );

      if (error) {
        console.error('[OFF Search] Error:', error);
        throw new Error('Failed to search foods');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.foods || [];
    },
    enabled: enabled && query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
};

/**
 * Hook for barcode lookup via Open Food Facts
 */
export const useOpenFoodFactsBarcode = () => {
  return useMutation({
    mutationFn: async ({
      barcode,
      region = 'GB',
    }: {
      barcode: string;
      region?: string;
    }): Promise<BarcodeResponse> => {
      // Validate barcode format
      const validation = validateBarcode(barcode);
      if (!validation.isValid) {
        console.warn('[OFF Barcode] Invalid barcode:', validation.error);
        // Still try to look it up - OFF might have it
      }

      const { data, error } = await supabase.functions.invoke<BarcodeResponse>(
        'openfoodfacts-barcode',
        {
          body: { barcode: validation.normalized || barcode, region },
        }
      );

      if (error) {
        console.error('[OFF Barcode] Error:', error);
        throw new Error('Failed to lookup barcode');
      }

      return data || { found: false, error: 'No response' };
    },
  });
};

/**
 * Hook to increment popularity score when a food is selected
 */
export const useIncrementPopularity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      externalId,
      country = 'GB',
    }: {
      externalId: string;
      country?: string;
    }) => {
      const { error } = await supabase.rpc('increment_food_popularity', {
        p_external_id: externalId,
        p_country: country,
      });

      if (error) {
        console.error('[OFF Popularity] Failed to increment:', error);
        // Don't throw - this is a non-critical operation
      }
    },
    onSuccess: () => {
      // Invalidate autocomplete cache to reflect new rankings
      queryClient.invalidateQueries({ queryKey: ['openfoodfacts-autocomplete'] });
    },
  });
};

/**
 * Convert autocomplete suggestion to full food format
 */
export function suggestionToFood(suggestion: AutocompleteSuggestion): OpenFoodFactsFood {
  return {
    external_id: suggestion.external_id,
    barcode: suggestion.barcode,
    name: suggestion.product_name,
    brand_name: suggestion.brand,
    serving_description: '100g',
    serving_size_g: 100,
    calories_per_100g: suggestion.calories_per_100g || 0,
    protein_g: suggestion.protein_g || 0,
    carbs_g: suggestion.carbs_g || 0,
    fat_g: suggestion.fat_g || 0,
    fiber_g: 0,
    sugar_g: null,
    sodium_mg: null,
    saturated_fat_g: null,
    image_url: suggestion.image_url,
    allergens: suggestion.allergens || [],
    dietary_preferences: [],
    food_type: suggestion.food_type,
  };
}
