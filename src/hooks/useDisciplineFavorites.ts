/**
 * Hook for managing discipline favorites (teams, players, athletes)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface FollowableEntity {
  id: string;
  discipline_id: string;
  entity_type: 'team' | 'player' | 'athlete' | 'league' | 'organization';
  name: string;
  external_id: string | null;
  metadata: Record<string, unknown>;
  search_keywords: string[];
}

export interface ClientFavorite {
  id: string;
  client_id: string;
  discipline_id: string;
  entity_id: string;
  created_at: string;
  entity?: FollowableEntity;
}

// Fetch available entities for a discipline
async function fetchEntities(disciplineId: string): Promise<FollowableEntity[]> {
  const { data, error } = await supabase
    .from('discipline_followable_entities')
    .select('*')
    .eq('discipline_id', disciplineId)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return (data || []) as FollowableEntity[];
}

// Fetch user's favorites
async function fetchFavorites(clientId: string, disciplineId?: string): Promise<ClientFavorite[]> {
  let query = supabase
    .from('client_discipline_favorites')
    .select(`
      *,
      entity:discipline_followable_entities(*)
    `)
    .eq('client_id', clientId);

  if (disciplineId) {
    query = query.eq('discipline_id', disciplineId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as ClientFavorite[];
}

// Search entities across disciplines
async function searchEntities(query: string, disciplineId?: string): Promise<FollowableEntity[]> {
  const searchTerms = query.toLowerCase().split(' ');
  
  let dbQuery = supabase
    .from('discipline_followable_entities')
    .select('*')
    .eq('is_active', true)
    .ilike('name', `%${query}%`);

  if (disciplineId) {
    dbQuery = dbQuery.eq('discipline_id', disciplineId);
  }

  const { data, error } = await dbQuery.limit(20);

  if (error) throw error;
  return (data || []) as FollowableEntity[];
}

export function useDisciplineEntities(disciplineId: string | null) {
  return useQuery({
    queryKey: ['discipline-entities', disciplineId],
    queryFn: () => fetchEntities(disciplineId!),
    enabled: !!disciplineId,
    staleTime: 60 * 60 * 1000, // 1 hour - entities don't change often
  });
}

export function useDisciplineFavorites(disciplineId?: string) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['discipline-favorites', profile?.id, disciplineId],
    queryFn: () => fetchFavorites(profile!.id, disciplineId),
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchEntities(query: string, disciplineId?: string) {
  return useQuery({
    queryKey: ['search-entities', query, disciplineId],
    queryFn: () => searchEntities(query, disciplineId),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ entityId, disciplineId }: { entityId: string; disciplineId: string }) => {
      if (!profile?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('client_discipline_favorites')
        .insert({
          client_id: profile.id,
          entity_id: entityId,
          discipline_id: disciplineId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipline-favorites'] });
      toast.success('Added to favorites');
    },
    onError: (error) => {
      console.error('Error adding favorite:', error);
      toast.error('Failed to add favorite');
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (favoriteId: string) => {
      const { error } = await supabase
        .from('client_discipline_favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipline-favorites'] });
      toast.success('Removed from favorites');
    },
    onError: (error) => {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove favorite');
    },
  });
}
