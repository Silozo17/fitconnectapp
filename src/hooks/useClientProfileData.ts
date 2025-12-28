import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ClientProfileData {
  id: string;
  user_id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  date_of_birth: string | null;
  gender: string | null;
  activity_level: string | null;
}

export function useClientProfileData() {
  const { user } = useAuth();
  
  const query = useQuery({
    queryKey: ['client-profile-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('client_profiles')
        .select('id, user_id, username, first_name, last_name, avatar_url, weight_kg, height_cm, age, date_of_birth, gender, activity_level')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as ClientProfileData | null;
    },
    enabled: !!user?.id,
  });

  return query;
}

export function useUpdateClientWeight() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (weight_kg: number) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('client_profiles')
        .update({ weight_kg })
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-profile-data'] });
    },
  });
}

// Calculate BMI from weight (kg) and height (cm)
export function calculateBMI(weight_kg: number | null, height_cm: number | null): number | null {
  if (!weight_kg || !height_cm || height_cm <= 0) return null;
  
  const height_m = height_cm / 100;
  return weight_kg / (height_m * height_m);
}

// Get BMI category
export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400' };
  if (bmi < 25) return { label: 'Normal', color: 'text-green-400' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-400' };
  return { label: 'Obese', color: 'text-red-400' };
}
