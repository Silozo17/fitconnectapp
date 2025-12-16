import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type ClientProgress = Tables<'client_progress'>;
export type ClientProgressInsert = TablesInsert<'client_progress'>;

export interface ProgressMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  thighs?: number;
  calves?: number;
  shoulders?: number;
  neck?: number;
}

export const useClientProgress = (clientId?: string) => {
  return useQuery({
    queryKey: ['client-progress', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      
      const { data, error } = await supabase
        .from('client_progress')
        .select('*')
        .eq('client_id', clientId)
        .order('recorded_at', { ascending: false });
      
      if (error) throw error;
      return data as ClientProgress[];
    },
    enabled: !!clientId,
  });
};

export const useMyProgress = () => {
  return useQuery({
    queryKey: ['my-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!clientProfile) throw new Error('Client profile not found');

      const { data, error } = await supabase
        .from('client_progress')
        .select('*')
        .eq('client_id', clientProfile.id)
        .order('recorded_at', { ascending: true });
      
      if (error) throw error;
      return { progress: data as ClientProgress[], clientId: clientProfile.id };
    },
  });
};

export const useCreateProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (progress: ClientProgressInsert) => {
      const { data, error } = await supabase
        .from('client_progress')
        .insert([progress])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-progress'] });
      queryClient.invalidateQueries({ queryKey: ['my-progress'] });
    },
  });
};

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ClientProgress> & { id: string }) => {
      const { data, error } = await supabase
        .from('client_progress')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-progress'] });
      queryClient.invalidateQueries({ queryKey: ['my-progress'] });
    },
  });
};

export const useDeleteProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('client_progress')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-progress'] });
      queryClient.invalidateQueries({ queryKey: ['my-progress'] });
    },
  });
};

// Upload progress photo
export const uploadProgressPhoto = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('transformation-photos')
    .upload(fileName, file);
  
  if (uploadError) throw uploadError;
  
  const { data: { publicUrl } } = supabase.storage
    .from('transformation-photos')
    .getPublicUrl(fileName);
  
  return publicUrl;
};
