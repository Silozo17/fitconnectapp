import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { triggerHaptic } from '@/lib/despia';
import { checkIsFirstProgressPhoto } from '@/hooks/useFirstTimeTracker';

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

// Pass celebration callback from component that has access to useCelebration
export const useCreateProgress = (callbacks?: {
  onFirstPhoto?: () => void;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (progress: ClientProgressInsert) => {
      // Check if this will be the first photo BEFORE inserting
      const hasPhotos = progress.photo_urls && 
        Array.isArray(progress.photo_urls) && 
        progress.photo_urls.length > 0;
      
      let isFirstPhoto = false;
      if (hasPhotos) {
        isFirstPhoto = await checkIsFirstProgressPhoto(progress.client_id);
      }
      
      const { data, error } = await supabase
        .from('client_progress')
        .insert([progress])
        .select()
        .single();
      
      if (error) throw error;
      return { ...data, isFirstPhoto };
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client-progress'] });
      queryClient.invalidateQueries({ queryKey: ['my-progress'] });
      queryClient.invalidateQueries({ queryKey: ['first-time-progress-photos'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      
      // Sync weight to client_profiles if weight was logged
      if (variables.weight_kg) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('client_profiles')
              .update({ weight_kg: variables.weight_kg })
              .eq('user_id', user.id);
            
            // Invalidate client profile data to refresh BMI widget
            queryClient.invalidateQueries({ queryKey: ['client-profile-data'] });
          }
        } catch (error) {
          console.error('Failed to sync weight to profile:', error);
        }
      }
      
      // Haptic feedback for progress logged
      triggerHaptic('success');
      
      // Check for first photo achievement
      if (data.isFirstPhoto && callbacks?.onFirstPhoto) {
        callbacks.onFirstPhoto();
      } else {
        toast.success('Progress logged!');
      }
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

// Upload progress photo - returns signed URL since bucket is private
export const uploadProgressPhoto = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('transformation-photos')
    .upload(fileName, file);
  
  if (uploadError) throw uploadError;
  
  // Use signed URL for private bucket (valid for 1 year)
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('transformation-photos')
    .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year
  
  if (signedUrlError) throw signedUrlError;
  
  return signedUrlData.signedUrl;
};
