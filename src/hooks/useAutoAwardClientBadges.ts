import { useEffect, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useClientBadges, useClientBadgesAvailable, useAwardXP } from "./useGamification";
import { useUserStats } from "./useUserStats";
import { toast } from "sonner";
import { triggerHaptic } from "@/lib/despia";

interface BadgeCriteria {
  type: string;
  value?: number;
}

// Check if a badge criteria is met based on user stats
function checkCriteriaMet(
  criteria: BadgeCriteria,
  stats: NonNullable<ReturnType<typeof useUserStats>['data']>
): boolean {
  const target = criteria.value ?? 0;

  switch (criteria.type) {
    // Workout criteria
    case 'workout_count':
      return stats.workoutCount >= target;
    
    // Streak criteria
    case 'streak_days':
      return stats.habitStreak >= target;
    
    // Progress criteria
    case 'progress_logs':
    case 'progress_count':
      return stats.progressEntries >= target;
    case 'photo_count':
      return stats.progressPhotos >= target;
    
    // Challenge criteria
    case 'challenge_count':
    case 'challenge_completed':
      return stats.challengesCompleted >= target;
    case 'challenge_joined':
      return stats.challengesJoined >= target;
    case 'challenge_won':
      return stats.challengesWon >= target;
    
    // XP and level criteria
    case 'xp_threshold':
      return stats.xpTotal >= target;
    case 'level_reached':
      return stats.currentLevel >= target;
    
    // Badge collection criteria
    case 'badges_earned':
      return stats.badgesEarned >= target;
    
    // Wearable criteria
    case 'steps_total':
      return stats.stepsTotal >= target;
    case 'calories_total':
      return stats.caloriesTotal >= target;
    case 'distance_total':
      return stats.distanceTotal >= target;
    case 'active_minutes_total':
      return stats.activeMinutesTotal >= target;
    case 'devices_connected':
      return stats.devicesConnected >= target;
    case 'wearable_workout_count':
      return stats.wearableWorkoutCount >= target;
    case 'sleep_hours_total':
      return stats.sleepHoursTotal >= target;
    
    // Coach connection
    case 'coach_connected':
      return stats.coachConnected;
    
    // Leaderboard criteria
    case 'leaderboard_entry':
      return stats.leaderboardRank > 0;
    case 'leaderboard_rank':
      return stats.leaderboardRank > 0 && stats.leaderboardRank <= target;
    
    // Nutrition criteria (placeholder - set to 0 until implemented)
    case 'nutrition_days':
    case 'meal_days':
    case 'macro_days':
      return stats.macroDays >= target;
    
    // Goal criteria
    case 'goal_achieved':
      return stats.goalsAchieved >= target;
    
    // Special workout types (would need additional tracking)
    case 'early_workout':
    case 'late_workout':
    case 'weekend_workouts':
      // These require specific time-based tracking, return false for now
      return false;

    default:
      console.warn(`Unknown badge criteria type: ${criteria.type}`);
      return false;
  }
}

export function useAutoAwardClientBadges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { data: earnedBadges, isLoading: earnedLoading } = useClientBadges();
  const { data: availableBadges, isLoading: availableLoading } = useClientBadgesAvailable();
  const awardXP = useAwardXP();
  
  // Ref to prevent multiple simultaneous award attempts
  const isAwardingRef = useRef(false);
  // Ref to track which badges we've already attempted to award this session
  const attemptedBadgesRef = useRef<Set<string>>(new Set());

  const awardMutation = useMutation({
    mutationFn: async ({ badgeId, clientId }: { badgeId: string; clientId: string }) => {
      // Check if already earned
      const { data: existing } = await supabase
        .from("client_badges")
        .select("id")
        .eq("client_id", clientId)
        .eq("badge_id", badgeId)
        .maybeSingle();

      if (existing) return null;

      const { data, error } = await supabase
        .from("client_badges")
        .insert([{ client_id: clientId, badge_id: badgeId }])
        .select(`*, badge:badges(*)`)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      if (data?.badge) {
        triggerHaptic('success');
        toast.success(`🏆 Badge Earned: ${data.badge.name}!`, {
          description: data.badge.description,
          duration: 5000,
        });
        
        // Award XP for the badge
        if (data.badge.xp_reward > 0) {
          awardXP.mutate({
            amount: data.badge.xp_reward,
            source: 'badge_earned',
            description: `Earned "${data.badge.name}" badge`,
            sourceId: data.badge.id,
          });
        }

        // Send push + in-app notification
        try {
          const { data: profile } = await supabase
            .from("client_profiles")
            .select("id")
            .eq("user_id", user?.id)
            .maybeSingle();

          if (profile) {
            await supabase.functions.invoke('notify-achievement-earned', {
              body: {
                client_badge_id: data.id,
                client_id: profile.id,
                badge_id: data.badge.id,
              },
            });
          }
        } catch (notifyError) {
          console.error('[useAutoAwardClientBadges] Notification failed:', notifyError);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["client-badges"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
    },
    onError: (error) => {
      console.error('[useAutoAwardClientBadges] Failed to award badge:', error);
    },
  });

  const checkAndAwardBadges = useCallback(async () => {
    // Guard against concurrent runs
    if (isAwardingRef.current) {
      return;
    }
    
    if (!user?.id || !stats || !availableBadges || statsLoading || earnedLoading || availableLoading) {
      return;
    }

    isAwardingRef.current = true;
    
    try {
      // Get client profile ID
      const { data: profile, error: profileError } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError || !profile) {
        console.warn('[useAutoAwardClientBadges] No client profile found');
        return;
      }

      const earnedBadgeIds = new Set(earnedBadges?.map((b) => b.badge_id) || []);

      for (const badge of availableBadges) {
        // Skip if already earned
        if (earnedBadgeIds.has(badge.id)) continue;

        // Skip challenge-exclusive badges
        if (badge.is_challenge_exclusive) continue;
        
        // Skip if we've already attempted this badge this session
        if (attemptedBadgesRef.current.has(badge.id)) continue;

        const criteria = badge.criteria as unknown as BadgeCriteria;
        if (!criteria?.type) continue;

        const shouldAward = checkCriteriaMet(criteria, stats);

        if (shouldAward) {
          attemptedBadgesRef.current.add(badge.id);
          try {
            await awardMutation.mutateAsync({ badgeId: badge.id, clientId: profile.id });
          } catch (error) {
            // Silently fail if badge already exists (race condition)
            console.error("[useAutoAwardClientBadges] Failed to award badge:", error);
          }
        }
      }
    } catch (error) {
      console.error('[useAutoAwardClientBadges] Error in checkAndAwardBadges:', error);
    } finally {
      isAwardingRef.current = false;
    }
  }, [user?.id, stats, availableBadges, earnedBadges, statsLoading, earnedLoading, availableLoading]);

  // Auto-check when stats data changes
  useEffect(() => {
    if (stats && availableBadges && earnedBadges !== undefined && !statsLoading && !availableLoading && !earnedLoading) {
      checkAndAwardBadges();
    }
  }, [stats, availableBadges, earnedBadges, statsLoading, availableLoading, earnedLoading, checkAndAwardBadges]);

  return { checkAndAwardBadges, isAwarding: awardMutation.isPending };
}
