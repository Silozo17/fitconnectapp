/**
 * Hook for fetching discipline news from RSS feeds
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NewsItem {
  id: string;
  discipline_id: string;
  source_id: string | null;
  title: string;
  summary: string | null;
  url: string;
  image_url: string | null;
  published_at: string | null;
  fetched_at: string;
}

interface FetchNewsResponse {
  news: NewsItem[];
  cached: boolean;
}

async function fetchDisciplineNews(disciplineId: string, entityIds?: string[]): Promise<NewsItem[]> {
  const { data, error } = await supabase.functions.invoke<FetchNewsResponse>('fetch-discipline-news', {
    body: { discipline_id: disciplineId, entity_ids: entityIds },
  });

  if (error) {
    console.error('Error fetching discipline news:', error);
    throw error;
  }

  return data?.news || [];
}

export function useDisciplineNews(disciplineId: string | null, entityIds?: string[]) {
  return useQuery({
    queryKey: ['discipline-news', disciplineId, entityIds],
    queryFn: () => fetchDisciplineNews(disciplineId!, entityIds),
    enabled: !!disciplineId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    refetchOnWindowFocus: false,
    retry: 2,
  });
}
