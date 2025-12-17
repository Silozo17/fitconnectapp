import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const MAX_FEATURED_BADGES = 5;

export function useFeaturedBadges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ 
      coachBadgeId, 
      currentlyFeatured,
      currentFeaturedCount 
    }: { 
      coachBadgeId: string; 
      currentlyFeatured: boolean;
      currentFeaturedCount: number;
    }) => {
      // If trying to feature and already at max
      if (!currentlyFeatured && currentFeaturedCount >= MAX_FEATURED_BADGES) {
        throw new Error(`You can only feature up to ${MAX_FEATURED_BADGES} badges`);
      }

      const { data, error } = await supabase
        .from("coach_badges")
        .update({ is_featured: !currentlyFeatured })
        .eq("id", coachBadgeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const action = data.is_featured ? "featured" : "unfeatured";
      toast.success(`Badge ${action} on your profile`);
      queryClient.invalidateQueries({ queryKey: ["coach-badges"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update badge");
    },
  });

  return {
    toggleFeatured: toggleFeaturedMutation.mutate,
    isUpdating: toggleFeaturedMutation.isPending,
    MAX_FEATURED_BADGES,
  };
}

// Hook to fetch featured badges for a specific coach (public)
export function useCoachFeaturedBadges(coachId: string | undefined) {
  return {
    queryKey: ["coach-featured-badges", coachId],
    queryFn: async () => {
      if (!coachId) return [];

      const { data, error } = await supabase
        .from("coach_badges")
        .select(`
          id,
          earned_at,
          badge:badges(id, name, icon, image_url, rarity, description)
        `)
        .eq("coach_id", coachId)
        .eq("is_featured", true)
        .order("earned_at", { ascending: false })
        .limit(MAX_FEATURED_BADGES);

      if (error) throw error;
      return data;
    },
    enabled: !!coachId,
  };
}
