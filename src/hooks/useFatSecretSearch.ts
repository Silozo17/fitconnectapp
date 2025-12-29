import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FatSecretFood {
  fatsecret_id: string;
  name: string;
  brand_name: string | null;
  serving_description: string;
  serving_size_g: number;
  calories_per_100g: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g?: number;
  sodium_mg?: number;
  saturated_fat_g?: number;
  image_url?: string | null;
  allergens?: string[];
  dietary_preferences?: string[];
}

interface FatSecretSearchResponse {
  foods: FatSecretFood[];
  meta?: {
    region: string;
    total_results: number;
    api_version: string;
  };
  error?: string;
}

export const useFatSecretSearch = (query: string, enabled: boolean = true, region: string = 'GB') => {
  return useQuery({
    queryKey: ['fatsecret-search', query, region],
    queryFn: async (): Promise<FatSecretFood[]> => {
      if (!query || query.length < 2) {
        return [];
      }

      const { data, error } = await supabase.functions.invoke<FatSecretSearchResponse>('fatsecret-search', {
        body: { query, maxResults: 25, region }
      });

      if (error) {
        console.error('FatSecret search error:', error);
        throw new Error('Failed to search foods');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.foods || [];
    },
    enabled: enabled && query.length >= 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
};
