import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Badge {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  image_url?: string | null;
  rarity: string;
  xp_reward: number;
  criteria: Record<string, unknown>;
}

interface CoachBadge {
  id: string;
  coach_id: string;
  badge_id: string;
  earned_at: string;
  source_data: Record<string, unknown> | null;
  is_featured: boolean;
  badge: Badge;
}

// Fetch coach's earned badges
export const useCoachBadges = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coach-badges", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      // Get coach profile ID
      const { data: profile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) return [];

      const { data, error } = await supabase
        .from("coach_badges")
        .select(`
          *,
          badge:badges(*)
        `)
        .eq("coach_id", profile.id)
        .order("earned_at", { ascending: false });

      if (error) throw error;
      return data as CoachBadge[];
    },
    enabled: !!user?.id,
  });
};

// Fetch all available coach badges
export const useAvailableCoachBadges = () => {
  return useQuery({
    queryKey: ["available-coach-badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .in("category", ["coach_profile", "coach_milestone"])
        .eq("is_active", true)
        .order("rarity", { ascending: true });

      if (error) throw error;
      return data as Badge[];
    },
  });
};

// Award a badge to a coach
export const useAwardCoachBadge = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      badgeName, 
      sourceData 
    }: { 
      badgeName: string; 
      sourceData?: Record<string, unknown>;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Get coach profile ID
      const { data: profile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) throw new Error("Coach profile not found");

      // Get badge by name
      const { data: badge } = await supabase
        .from("badges")
        .select("id, name, icon")
        .eq("name", badgeName)
        .single();

      if (!badge) throw new Error("Badge not found");

      // Check if already earned
      const { data: existing } = await supabase
        .from("coach_badges")
        .select("id")
        .eq("coach_id", profile.id)
        .eq("badge_id", badge.id)
        .single();

      if (existing) return null; // Already earned

      // Award the badge
      const { data, error } = await supabase
        .from("coach_badges")
        .insert([{
          coach_id: profile.id,
          badge_id: badge.id,
          source_data: (sourceData || {}) as unknown as Record<string, never>,
        }])
        .select()
        .single();

      if (error) throw error;

      return { ...data, badge };
    },
    onSuccess: (data) => {
      if (data) {
        toast.success(`🎉 Badge Earned: ${data.badge.name}!`);
        queryClient.invalidateQueries({ queryKey: ["coach-badges"] });
      }
    },
    onError: (error) => {
      console.error("Failed to award badge:", error);
    },
  });
};

// Check and award profile completion badges
export const useCheckProfileBadges = () => {
  const awardBadge = useAwardCoachBadge();

  const checkAndAward = async (completionPercentage: number) => {
    if (completionPercentage >= 50) {
      await awardBadge.mutateAsync({ 
        badgeName: "Profile Starter",
        sourceData: { percentage: completionPercentage }
      });
    }
    
    if (completionPercentage >= 100) {
      await awardBadge.mutateAsync({ 
        badgeName: "Profile Pro",
        sourceData: { percentage: 100 }
      });
    }
  };

  return { checkAndAward, isLoading: awardBadge.isPending };
};

// Get coach stats for badge progress
export const useCoachStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coach-stats-for-badges", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("coach_profiles")
        .select("id, is_verified")
        .eq("user_id", user.id)
        .single();

      if (!profile) throw new Error("Coach profile not found");

      // Get active clients count
      const { count: clientCount } = await supabase
        .from("coach_clients")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", profile.id)
        .eq("status", "active");

      // Get completed sessions count
      const { count: sessionCount } = await supabase
        .from("coaching_sessions")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", profile.id)
        .eq("status", "completed");

      // Get reviews count and average
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("coach_id", profile.id);

      const reviewCount = reviews?.length || 0;
      const averageRating = reviewCount > 0 
        ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount 
        : 0;

      return {
        clientCount: clientCount || 0,
        sessionCount: sessionCount || 0,
        reviewCount,
        averageRating,
        isVerified: profile.is_verified || false,
      };
    },
    enabled: !!user?.id,
  });
};
