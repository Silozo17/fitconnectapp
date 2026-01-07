/**
 * Hook for submitting discipline requests
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DisciplineRequestInput {
  disciplineName: string;
  requestedMetrics?: string;
}

export function useDisciplineRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const submitRequestMutation = useMutation({
    mutationFn: async (input: DisciplineRequestInput) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('discipline_requests')
        .insert({
          user_id: user.id,
          discipline_name: input.disciplineName,
          requested_metrics: input.requestedMetrics || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Request submitted! We\'ll review it soon.');
    },
    onError: (error) => {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
    },
  });

  return {
    submitRequest: submitRequestMutation.mutate,
    isSubmitting: submitRequestMutation.isPending,
  };
}
