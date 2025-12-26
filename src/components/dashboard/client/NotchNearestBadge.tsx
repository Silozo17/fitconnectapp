import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Trophy, Sparkles } from "lucide-react";
import { useClientBadgesAvailable, useClientBadges, Badge } from "@/hooks/useGamification";
import { useUserStats } from "@/hooks/useUserStats";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Rarity colors
const RARITY_COLORS: Record<string, string> = {
  common: "text-slate-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-amber-400",
};

// Calculate progress for a badge based on its criteria
const calculateBadgeProgress = (
  badge: Badge,
  stats: Record<string, number | boolean>
): { current: number; target: number; percentage: number } | null => {
  const criteria = badge.criteria as { type?: string; value?: number } & Record<string, number> | null;
  if (!criteria) return null;

  let criteriaType: string | undefined;
  let target: number | undefined;

  if (criteria.type && criteria.value !== undefined) {
    criteriaType = criteria.type;
    target = criteria.value;
  } else {
    const legacyKeys = [
      'workout_count', 'streak_days', 'progress_logs', 'progress_count',
      'photo_count', 'challenge_count', 'challenge_completed', 'challenge_joined',
      'challenge_won', 'xp_threshold', 'level_reached', 'badges_earned',
      'leaderboard_entry', 'leaderboard_rank', 'goal_achieved',
      'steps_total', 'calories_total', 'distance_total', 'active_minutes_total',
    ];
    
    for (const key of legacyKeys) {
      if (criteria[key] !== undefined) {
        criteriaType = key;
        target = criteria[key];
        break;
      }
    }
  }

  if (!criteriaType || target === undefined) return null;

  const statsMap: Record<string, string> = {
    workout_count: 'workoutCount',
    streak_days: 'habitStreak',
    progress_logs: 'progressEntries',
    progress_count: 'progressEntries',
    photo_count: 'progressPhotos',
    challenge_count: 'challengesCompleted',
    challenge_completed: 'challengesCompleted',
    challenge_joined: 'challengesJoined',
    challenge_won: 'challengesWon',
    xp_threshold: 'xpTotal',
    level_reached: 'currentLevel',
    badges_earned: 'badgesEarned',
    leaderboard_rank: 'leaderboardRank',
    goal_achieved: 'goalsAchieved',
    steps_total: 'stepsTotal',
    calories_total: 'caloriesTotal',
    distance_total: 'distanceTotal',
    active_minutes_total: 'activeMinutesTotal',
  };

  const statKey = statsMap[criteriaType];
  if (!statKey) return null;

  const current = Number(stats[statKey]) || 0;
  const percentage = Math.min(100, (current / target) * 100);

  return { current, target, percentage };
};

const NotchNearestBadge = () => {
  const { t } = useTranslation("common");
  const { data: availableBadges, isLoading: availableLoading } = useClientBadgesAvailable();
  const { data: earnedBadges, isLoading: earnedLoading } = useClientBadges();
  const { data: stats, isLoading: statsLoading } = useUserStats();

  const isLoading = availableLoading || earnedLoading || statsLoading;

  // Find the badge closest to completion
  const nearestBadge = useMemo(() => {
    if (!availableBadges || !earnedBadges || !stats) return null;

    const earnedIds = new Set(earnedBadges.map(eb => eb.badge?.id || eb.badge_id));
    
    // Filter to unearned badges and calculate progress
    const unearnedWithProgress = availableBadges
      .filter(badge => !earnedIds.has(badge.id))
      .map(badge => {
        const progress = calculateBadgeProgress(badge, stats as unknown as Record<string, number | boolean>);
        return { badge, progress };
      })
      .filter(item => item.progress !== null && item.progress.percentage > 0 && item.progress.percentage < 100);

    // Sort by highest progress percentage
    unearnedWithProgress.sort((a, b) => (b.progress?.percentage || 0) - (a.progress?.percentage || 0));

    return unearnedWithProgress[0] || null;
  }, [availableBadges, earnedBadges, stats]);

  if (isLoading) {
    return (
      <div className="glass-subtle p-3 rounded-xl animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-2 w-full bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!nearestBadge) {
    return (
      <div className="glass-subtle p-3 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {t("badges.keepGoing", "Keep going!")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("badges.moreBadgesAhead", "More badges to unlock")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { badge, progress } = nearestBadge;
  const rarityColor = RARITY_COLORS[badge.rarity] || "text-slate-400";

  return (
    <div className="glass-subtle p-3 rounded-xl">
      <div className="flex items-center gap-3">
        {/* Badge icon */}
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          badge.rarity === "legendary" ? "bg-amber-500/20" :
          badge.rarity === "epic" ? "bg-purple-500/20" :
          badge.rarity === "rare" ? "bg-blue-500/20" :
          "bg-slate-500/20"
        )}>
          <Trophy className={cn("w-5 h-5", rarityColor)} />
        </div>

        {/* Badge info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">
              {badge.name}
            </p>
            <span className={cn("text-[10px] uppercase font-medium", rarityColor)}>
              {badge.rarity}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="mt-1.5">
            <Progress 
              value={progress?.percentage || 0} 
              className="h-1.5 bg-muted"
            />
          </div>
          
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {progress?.current}/{progress?.target} {t("badges.toUnlock", "to unlock")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotchNearestBadge;
