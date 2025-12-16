import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export type LeadStage = 'new_lead' | 'conversation_started' | 'offer_sent' | 'deal_closed';

export interface Lead {
  id: string;
  coach_id: string;
  client_id: string;
  stage: LeadStage;
  source: string | null;
  notes: string | null;
  offer_sent_at: string | null;
  deal_closed_at: string | null;
  created_at: string;
  updated_at: string;
  client_profile?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    location: string | null;
    fitness_goals: string[] | null;
    avatar_url: string | null;
  } | null;
}

export const useCoachPipeline = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get coach profile ID
  const { data: coachProfile } = useQuery({
    queryKey: ['coach-profile-for-pipeline', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('coach_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch leads
  const { data: leads = [], isLoading, error } = useQuery({
    queryKey: ['coach-leads', coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile?.id) return [];
      
      const { data, error } = await supabase
        .from('coach_leads')
        .select(`
          *,
          client_profile:client_profiles(
            id, first_name, last_name, location, fitness_goals, avatar_url
          )
        `)
        .eq('coach_id', coachProfile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!coachProfile?.id,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!coachProfile?.id) return;

    const channel = supabase
      .channel('coach-leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coach_leads',
          filter: `coach_id=eq.${coachProfile.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['coach-leads', coachProfile.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coachProfile?.id, queryClient]);

  // Add lead
  const addLead = useMutation({
    mutationFn: async ({ clientId, source }: { clientId: string; source?: string }) => {
      if (!coachProfile?.id) throw new Error('Coach profile not found');
      
      const { data, error } = await supabase
        .from('coach_leads')
        .upsert({
          coach_id: coachProfile.id,
          client_id: clientId,
          source: source || 'manual',
          stage: 'new_lead',
        }, { onConflict: 'coach_id,client_id' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-leads'] });
    },
  });

  // Update lead stage
  const updateStage = useMutation({
    mutationFn: async ({ leadId, stage }: { leadId: string; stage: LeadStage }) => {
      const updates: Record<string, unknown> = { stage, updated_at: new Date().toISOString() };
      
      if (stage === 'offer_sent') {
        updates.offer_sent_at = new Date().toISOString();
      } else if (stage === 'deal_closed') {
        updates.deal_closed_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('coach_leads')
        .update(updates)
        .eq('id', leadId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-leads'] });
    },
  });

  // Update lead notes
  const updateNotes = useMutation({
    mutationFn: async ({ leadId, notes }: { leadId: string; notes: string }) => {
      const { data, error } = await supabase
        .from('coach_leads')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-leads'] });
    },
  });

  // Delete lead
  const deleteLead = useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase
        .from('coach_leads')
        .delete()
        .eq('id', leadId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-leads'] });
    },
  });

  // Group leads by stage
  const leadsByStage = {
    new_lead: leads.filter(l => l.stage === 'new_lead'),
    conversation_started: leads.filter(l => l.stage === 'conversation_started'),
    offer_sent: leads.filter(l => l.stage === 'offer_sent'),
    deal_closed: leads.filter(l => l.stage === 'deal_closed'),
  };

  return {
    leads,
    leadsByStage,
    isLoading,
    error,
    coachProfileId: coachProfile?.id,
    addLead,
    updateStage,
    updateNotes,
    deleteLead,
  };
};
