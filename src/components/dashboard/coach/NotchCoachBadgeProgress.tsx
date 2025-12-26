import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Trophy, Sparkles } from "lucide-react";
import { useCoachBadges, useAvailableCoachBadges, useCoachStats } from "@/hooks/useCoachGamification";
import { useProfilePanel } from "@/contexts/ProfilePanelContext";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Rarity colors
const RARITY_COLORS: Record<string, string> = {
  common: "text-slate-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-amber-400",
};

const RARITY_BG: Record<string, string> = {
  common: "bg-slate-500/20",
  rare: "bg-blue-500/20",
  epic: "bg-purple-500/20",
  legendary: "bg-amber-500/20",
};

interface BadgeCriteria {
  type?: string;
  value?: number;
  [key: string]: number | string | undefined;
}

// Calculate progress for a coach badge based on its criteria
const calculateBadgeProgress = (
  criteria: BadgeCriteria | null,
  stats: { clientCount: number; sessionCount: number; reviewCount: number; averageRating: number; isVerified: boolean }
): { current: number; target: number; percentage: number } | null => {
  if (!criteria) return null;

  let criteriaType: string | undefined;
  let target: number | undefined;

  if (criteria.type && criteria.value !== undefined) {
    criteriaType = criteria.type;
    target = Number(criteria.value);
  } else {
    const legacyKeys = [
      'client_count', 'session_count', 'review_count', 'rating_threshold',
      'profile_completion', 'verified',
    ];
    
    for (const key of legacyKeys) {
      if (criteria[key] !== undefined) {
        criteriaType = key;
        target = Number(criteria[key]);
        break;
      }
    }
  }

  if (!criteriaType || target === undefined) return null;

  const statsMap: Record<string, number> = {
    client_count: stats.clientCount,
    session_count: stats.sessionCount,
    review_count: stats.reviewCount,
    rating_threshold: stats.averageRating,
  };

  const current = statsMap[criteriaType] || 0;
  const percentage = Math.min(100, (current / target) * 100);

  return { current, target, percentage };
};

const NotchCoachBadgeProgress = () => {
  const { t } = useTranslation("coach");
  const navigate = useNavigate();
  const { close } = useProfilePanel();
  const { data: earnedBadges, isLoading: earnedLoading } = useCoachBadges();
  const { data: availableBadges, isLoading: availableLoading } = useAvailableCoachBadges();
  const { data: stats, isLoading: statsLoading } = useCoachStats();

  const handleClick = () => {
    close();
    navigate("/dashboard/coach/achievements");
  };

  const isLoading = earnedLoading || availableLoading || statsLoading;

  // Find the badge closest to completion
  const nearestBadge = useMemo(() => {
    if (!availableBadges || !earnedBadges || !stats) return null;

    const earnedIds = new Set(earnedBadges.map(eb => eb.badge?.id || eb.badge_id));
    
    // Filter to unearned badges and calculate progress
    const unearnedWithProgress = availableBadges
      .filter(badge => !earnedIds.has(badge.id))
      .map(badge => {
        const progress = calculateBadgeProgress(badge.criteria as BadgeCriteria, stats);
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
      <button onClick={handleClick} className="w-full glass-subtle p-3 rounded-xl text-left hover:bg-accent/10 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {t("badges.keepGoing", "Keep coaching!")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("badges.moreBadgesAhead", "More achievements to unlock")}
            </p>
          </div>
        </div>
      </button>
    );
  }

  const { badge, progress } = nearestBadge;
  const rarityColor = RARITY_COLORS[badge.rarity] || "text-slate-400";
  const rarityBg = RARITY_BG[badge.rarity] || "bg-slate-500/20";

  return (
    <button onClick={handleClick} className="w-full glass-subtle p-3 rounded-xl text-left hover:bg-accent/10 transition-colors">
      <div className="flex items-center gap-3">
        {/* Badge icon */}
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", rarityBg)}>
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
    </button>
  );
};

export default NotchCoachBadgeProgress;
