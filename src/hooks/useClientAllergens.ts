import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

export interface AllergenPreference {
  id: string;
  name: string;
  enabled: boolean;
}

const DEFAULT_ALLERGENS = [
  { id: 'gluten', name: 'Gluten', enabled: false },
  { id: 'dairy', name: 'Dairy', enabled: false },
  { id: 'eggs', name: 'Eggs', enabled: false },
  { id: 'nuts', name: 'Tree Nuts', enabled: false },
  { id: 'peanuts', name: 'Peanuts', enabled: false },
  { id: 'soy', name: 'Soy', enabled: false },
  { id: 'shellfish', name: 'Shellfish', enabled: false },
  { id: 'fish', name: 'Fish', enabled: false },
  { id: 'sesame', name: 'Sesame', enabled: false },
  { id: 'sulfites', name: 'Sulfites', enabled: false },
  { id: 'mustard', name: 'Mustard', enabled: false },
  { id: 'celery', name: 'Celery', enabled: false },
  { id: 'lupin', name: 'Lupin', enabled: false },
  { id: 'molluscs', name: 'Molluscs', enabled: false },
];

export const useClientAllergens = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: allergenPreferences, isLoading } = useQuery({
    queryKey: ['client-allergen-preferences', user?.id],
    queryFn: async () => {
      if (!user) return DEFAULT_ALLERGENS;

      const { data, error } = await supabase
        .from('client_profiles')
        .select('allergen_preferences')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // Parse stored preferences
      const raw = data?.allergen_preferences;
      if (Array.isArray(raw)) {
        const stored = raw as unknown as AllergenPreference[];
        // Merge with defaults to ensure all allergens are present
        return DEFAULT_ALLERGENS.map(def => {
          const saved = stored.find(s => s.id === def.id);
          return saved || def;
        });
      }

      return DEFAULT_ALLERGENS;
    },
    enabled: !!user?.id,
  });

  const updateAllergens = useMutation({
    mutationFn: async (preferences: AllergenPreference[]) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('client_profiles')
        .update({ allergen_preferences: preferences as unknown as Json })
        .eq('user_id', user.id);

      if (error) throw error;
      return preferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-allergen-preferences'] });
      toast.success('Allergen preferences saved');
    },
    onError: (error) => {
      console.error('Error saving allergen preferences:', error);
      toast.error('Failed to save preferences');
    },
  });

  const toggleAllergen = (allergenId: string) => {
    if (!allergenPreferences) return;

    const updated = allergenPreferences.map(a =>
      a.id === allergenId ? { ...a, enabled: !a.enabled } : a
    );

    updateAllergens.mutate(updated);
  };

  // Get enabled allergen names for filtering
  const enabledAllergens = allergenPreferences?.filter(a => a.enabled).map(a => a.name) || [];

  return {
    allergenPreferences: allergenPreferences || DEFAULT_ALLERGENS,
    enabledAllergens,
    isLoading,
    toggleAllergen,
    updateAllergens,
  };
};
