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
}

interface FatSecretSearchResponse {
  foods: FatSecretFood[];
  error?: string;
}

export const useFatSecretSearch = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['fatsecret-search', query],
    queryFn: async (): Promise<FatSecretFood[]> => {
      if (!query || query.length < 2) {
        return [];
      }

      const { data, error } = await supabase.functions.invoke<FatSecretSearchResponse>('fatsecret-search', {
        body: { query, maxResults: 25 }
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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1,
  });
};
