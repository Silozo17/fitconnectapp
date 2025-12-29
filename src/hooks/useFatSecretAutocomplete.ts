import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AutocompleteSuggestion {
  text: string;
  type: 'food' | 'brand' | 'generic';
}

interface AutocompleteResponse {
  suggestions: AutocompleteSuggestion[];
  error?: string;
}

export const useFatSecretAutocomplete = (query: string, enabled: boolean = true, region: string = 'GB') => {
  return useQuery({
    queryKey: ['fatsecret-autocomplete', query, region],
    queryFn: async (): Promise<AutocompleteSuggestion[]> => {
      if (!query || query.length < 1) {
        return [];
      }

      const { data, error } = await supabase.functions.invoke<AutocompleteResponse>('fatsecret-autocomplete', {
        body: { query, maxResults: 10, region }
      });

      if (error) {
        console.error('FatSecret autocomplete error:', error);
        return [];
      }

      return data?.suggestions || [];
    },
    enabled: enabled && query.length >= 1,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 60 * 1000,
    retry: 0,
  });
};
