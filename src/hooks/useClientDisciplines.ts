/**
 * Hook for managing multiple client disciplines
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ClientDiscipline {
  id: string;
  client_id: string;
  discipline_id: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export function useClientDisciplines() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get client profile ID first
  const { data: clientProfile } = useQuery({
    queryKey: ['client-profile-id', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: disciplines, isLoading } = useQuery({
    queryKey: ['client-disciplines', clientProfile?.id],
    queryFn: async (): Promise<ClientDiscipline[]> => {
      if (!clientProfile?.id) return [];

      const { data, error } = await supabase
        .from('client_disciplines')
        .select('*')
        .eq('client_id', clientProfile.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching disciplines:', error);
        return [];
      }

      return (data || []) as ClientDiscipline[];
    },
    enabled: !!clientProfile?.id,
  });

  const primaryDiscipline = disciplines?.find(d => d.is_primary)?.discipline_id || disciplines?.[0]?.discipline_id || null;

  const addDisciplineMutation = useMutation({
    mutationFn: async ({ disciplineId, isPrimary = false }: { disciplineId: string; isPrimary?: boolean }) => {
      if (!clientProfile?.id) throw new Error('Not authenticated');

      // If this is the first discipline or marked as primary, set is_primary true
      const shouldBePrimary = isPrimary || !disciplines?.length;

      const { error, data } = await supabase
        .from('client_disciplines')
        .insert({
          client_id: clientProfile.id,
          discipline_id: disciplineId,
          is_primary: shouldBePrimary,
        })
        .select()
        .single();

      if (error) throw error;

      // Also update the legacy selected_discipline field for backward compatibility
      if (shouldBePrimary) {
        await supabase
          .from('client_profiles')
          .update({ selected_discipline: disciplineId })
          .eq('id', clientProfile.id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-disciplines'] });
      queryClient.invalidateQueries({ queryKey: ['selected-discipline'] });
      queryClient.invalidateQueries({ queryKey: ['discipline-widget'] });
      toast.success('Discipline added!');
    },
    onError: (error: any) => {
      console.error('Error adding discipline:', error);
      if (error.code === '23505') {
        toast.error('You already have this discipline');
      } else {
        toast.error('Failed to add discipline');
      }
    },
  });

  const removeDisciplineMutation = useMutation({
    mutationFn: async (disciplineId: string) => {
      if (!clientProfile?.id) throw new Error('Not authenticated');

      const disciplineToRemove = disciplines?.find(d => d.discipline_id === disciplineId);
      
      const { error } = await supabase
        .from('client_disciplines')
        .delete()
        .eq('client_id', clientProfile.id)
        .eq('discipline_id', disciplineId);

      if (error) throw error;

      // If we removed the primary, make another one primary
      if (disciplineToRemove?.is_primary && disciplines && disciplines.length > 1) {
        const newPrimary = disciplines.find(d => d.discipline_id !== disciplineId);
        if (newPrimary) {
          await supabase
            .from('client_disciplines')
            .update({ is_primary: true })
            .eq('id', newPrimary.id);
          
          // Update legacy field
          await supabase
            .from('client_profiles')
            .update({ selected_discipline: newPrimary.discipline_id })
            .eq('id', clientProfile.id);
        }
      } else if (disciplineToRemove?.is_primary) {
        // No more disciplines, clear legacy field
        await supabase
          .from('client_profiles')
          .update({ selected_discipline: null })
          .eq('id', clientProfile.id);
      }

      return disciplineId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-disciplines'] });
      queryClient.invalidateQueries({ queryKey: ['selected-discipline'] });
      queryClient.invalidateQueries({ queryKey: ['discipline-widget'] });
      toast.success('Discipline removed');
    },
    onError: (error) => {
      console.error('Error removing discipline:', error);
      toast.error('Failed to remove discipline');
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: async (disciplineId: string) => {
      if (!clientProfile?.id) throw new Error('Not authenticated');

      // The trigger will handle unsetting other primaries
      const { error } = await supabase
        .from('client_disciplines')
        .update({ is_primary: true })
        .eq('client_id', clientProfile.id)
        .eq('discipline_id', disciplineId);

      if (error) throw error;

      // Update legacy field
      await supabase
        .from('client_profiles')
        .update({ selected_discipline: disciplineId })
        .eq('id', clientProfile.id);

      return disciplineId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-disciplines'] });
      queryClient.invalidateQueries({ queryKey: ['selected-discipline'] });
      queryClient.invalidateQueries({ queryKey: ['discipline-widget'] });
      toast.success('Primary discipline updated');
    },
    onError: (error) => {
      console.error('Error setting primary discipline:', error);
      toast.error('Failed to update primary discipline');
    },
  });

  return {
    disciplines: disciplines || [],
    primaryDiscipline,
    isLoading,
    addDiscipline: addDisciplineMutation.mutate,
    removeDiscipline: removeDisciplineMutation.mutate,
    setPrimary: setPrimaryMutation.mutate,
    isUpdating: addDisciplineMutation.isPending || removeDisciplineMutation.isPending || setPrimaryMutation.isPending,
    hasDisciplines: (disciplines?.length || 0) > 0,
  };
}
