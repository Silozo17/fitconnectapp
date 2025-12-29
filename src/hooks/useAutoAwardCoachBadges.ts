import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCoachStats, useCoachBadges, useAvailableCoachBadges } from "./useCoachGamification";
import { useCoachProfileCompletion } from "./useCoachProfileCompletion";
import { toast } from "sonner";

interface BadgeCriteria {
  type: string;
  value?: number;
}

export function useAutoAwardCoachBadges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: stats } = useCoachStats();
  const { data: earnedBadges } = useCoachBadges();
  const { data: availableBadges } = useAvailableCoachBadges();
  const { data: profileCompletion } = useCoachProfileCompletion();

  const awardMutation = useMutation({
    mutationFn: async ({ badgeId, coachId }: { badgeId: string; coachId: string }) => {
      const { data, error } = await supabase
        .from("coach_badges")
        .insert([{ coach_id: coachId, badge_id: badgeId }])
        .select(`*, badge:badges(name, icon)`)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      if (data?.badge) {
        // Create in-app notification for the coach
        if (user?.id) {
          await supabase.from("notifications").insert({
            user_id: user.id,
            type: "achievement_earned",
            title: "🏅 Achievement Unlocked!",
            message: `You earned the "${data.badge.name}" badge!`,
            data: {
              badge_id: data.badge_id,
              badge_name: data.badge.name,
              is_coach_badge: true,
            },
            read: false,
          });
        }

        toast.success(`🎉 Badge Earned: ${data.badge.name}!`, {
          description: "Check your achievements page to see all your badges.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["coach-badges"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const checkAndAwardBadges = async () => {
    if (!user?.id || !stats || !availableBadges || !profileCompletion) return;

    // Get coach profile ID
    const { data: profile } = await supabase
      .from("coach_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) return;

    const earnedBadgeIds = new Set(earnedBadges?.map((b) => b.badge_id) || []);

    for (const badge of availableBadges) {
      // Skip if already earned
      if (earnedBadgeIds.has(badge.id)) continue;

      const criteria = badge.criteria as unknown as BadgeCriteria;
      if (!criteria?.type) continue;
      
      let shouldAward = false;

      switch (criteria.type) {
        case "profile_completion":
          shouldAward = (profileCompletion.percentage || 0) >= (criteria.value || 0);
          break;
        case "client_count":
          shouldAward = stats.clientCount >= (criteria.value || 0);
          break;
        case "session_count":
          shouldAward = stats.sessionCount >= (criteria.value || 0);
          break;
        case "review_count":
          shouldAward = stats.reviewCount >= (criteria.value || 0);
          break;
        case "verification":
          shouldAward = stats.isVerified;
          break;
        case "rating":
          shouldAward = stats.averageRating >= (criteria.value || 0) && stats.reviewCount >= 5;
          break;
      }

      if (shouldAward) {
        try {
          await awardMutation.mutateAsync({ badgeId: badge.id, coachId: profile.id });
        } catch (error) {
          // Silently fail if badge already exists (race condition)
          console.error("Failed to award badge:", error);
        }
      }
    }
  };

  // Auto-check when stats/profile data changes
  useEffect(() => {
    if (stats && availableBadges && profileCompletion && earnedBadges !== undefined) {
      checkAndAwardBadges();
    }
  }, [stats, availableBadges, profileCompletion, earnedBadges]);

  return { checkAndAwardBadges, isAwarding: awardMutation.isPending };
}
