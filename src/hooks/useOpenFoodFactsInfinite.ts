import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AutocompleteSuggestion } from './useOpenFoodFacts';

interface InfiniteResponse {
  suggestions: AutocompleteSuggestion[];
  source: string;
  total?: number;
  hasMore: boolean;
}

export const useOpenFoodFactsInfinite = (
  query: string,
  enabled: boolean = true,
  country: string = 'GB',
  pageSize: number = 10
) => {
  return useInfiniteQuery({
    queryKey: ['openfoodfacts-infinite', query, country],
    queryFn: async ({ pageParam = 0 }): Promise<InfiniteResponse> => {
      if (!query || query.length < 2) {
        return { suggestions: [], source: 'none', hasMore: false };
      }

      const { data, error } = await supabase.functions.invoke('openfoodfacts-autocomplete', {
        body: { 
          query, 
          country, 
          limit: pageSize, 
          offset: pageParam 
        }
      });

      if (error) {
        console.error('OpenFoodFacts infinite search error:', error);
        return { suggestions: [], source: 'error', hasMore: false };
      }

      const suggestions = data?.suggestions || [];
      
      return {
        suggestions,
        source: data?.source || 'unknown',
        total: data?.total,
        hasMore: suggestions.length === pageSize
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.reduce((total, page) => total + page.suggestions.length, 0);
    },
    initialPageParam: 0,
    enabled: enabled && query.length >= 2,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
