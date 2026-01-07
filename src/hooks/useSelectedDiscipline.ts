/**
 * Hook for managing the user's selected discipline
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useSelectedDiscipline() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: discipline, isLoading } = useQuery({
    queryKey: ['selected-discipline', user?.id],
    queryFn: async (): Promise<string | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('client_profiles')
        .select('selected_discipline')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching selected discipline:', error);
        return null;
      }

      return data?.selected_discipline || null;
    },
    enabled: !!user?.id,
  });

  const setDisciplineMutation = useMutation({
    mutationFn: async (disciplineId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('client_profiles')
        .update({ selected_discipline: disciplineId })
        .eq('user_id', user.id);

      if (error) throw error;
      return disciplineId;
    },
    onSuccess: (disciplineId) => {
      queryClient.invalidateQueries({ queryKey: ['selected-discipline'] });
      queryClient.invalidateQueries({ queryKey: ['discipline-widget'] });
      toast.success('Discipline selected!');
    },
    onError: (error) => {
      console.error('Error setting discipline:', error);
      toast.error('Failed to set discipline');
    },
  });

  const clearDisciplineMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('client_profiles')
        .update({ selected_discipline: null })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['selected-discipline'] });
      queryClient.invalidateQueries({ queryKey: ['discipline-widget'] });
    },
  });

  return {
    discipline,
    isLoading,
    setDiscipline: setDisciplineMutation.mutate,
    clearDiscipline: clearDisciplineMutation.mutate,
    isUpdating: setDisciplineMutation.isPending || clearDisciplineMutation.isPending,
  };
}
