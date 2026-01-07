/**
 * Hook for CRUD operations on discipline_events
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DisciplineEventInput {
  disciplineId: string;
  eventType: string;
  value: number;
  label?: string;
  recordedAt?: Date;
}

export interface DisciplineEvent {
  id: string;
  user_id: string;
  discipline_id: string;
  event_type: string;
  value_json: { value: number; label?: string };
  recorded_at: string;
  source: string;
  created_at: string;
}

export function useDisciplineEvents(disciplineId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch events for a discipline
  const { data: events, isLoading } = useQuery({
    queryKey: ['discipline-events', disciplineId, user?.id],
    queryFn: async (): Promise<DisciplineEvent[]> => {
      if (!user?.id || !disciplineId) return [];

      const { data, error } = await supabase
        .from('discipline_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('discipline_id', disciplineId)
        .order('recorded_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching discipline events:', error);
        return [];
      }

      return (data || []) as DisciplineEvent[];
    },
    enabled: !!user?.id && !!disciplineId,
  });

  // Log multiple events at once
  const logEventsMutation = useMutation({
    mutationFn: async (inputs: DisciplineEventInput[]) => {
      if (!user?.id) throw new Error('Not authenticated');

      const events = inputs.map(input => ({
        user_id: user.id,
        discipline_id: input.disciplineId,
        event_type: input.eventType,
        value_json: { value: input.value, label: input.label },
        recorded_at: (input.recordedAt || new Date()).toISOString(),
        source: 'manual',
      }));

      const { error } = await supabase
        .from('discipline_events')
        .insert(events);

      if (error) throw error;
      return events;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipline-events'] });
      queryClient.invalidateQueries({ queryKey: ['discipline-widget'] });
      toast.success('Logged successfully!');
    },
    onError: (error) => {
      console.error('Error logging events:', error);
      toast.error('Failed to log');
    },
  });

  // Log a single event
  const logEventMutation = useMutation({
    mutationFn: async (input: DisciplineEventInput) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('discipline_events')
        .insert({
          user_id: user.id,
          discipline_id: input.disciplineId,
          event_type: input.eventType,
          value_json: { value: input.value, label: input.label },
          recorded_at: (input.recordedAt || new Date()).toISOString(),
          source: 'manual',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipline-events'] });
      queryClient.invalidateQueries({ queryKey: ['discipline-widget'] });
      toast.success('Logged!');
    },
    onError: (error) => {
      console.error('Error logging event:', error);
      toast.error('Failed to log');
    },
  });

  // Delete an event
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('discipline_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipline-events'] });
      queryClient.invalidateQueries({ queryKey: ['discipline-widget'] });
      toast.success('Deleted');
    },
    onError: (error) => {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete');
    },
  });

  return {
    events,
    isLoading,
    logEvent: logEventMutation.mutate,
    logEvents: logEventsMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    isLogging: logEventMutation.isPending || logEventsMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
  };
}
