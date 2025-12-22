import { Trophy, Star, Check, Dumbbell, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useCoachBadges, useAvailableCoachBadges, useCoachStats } from "@/hooks/useCoachGamification";
import { useCoachProfileCompletion } from "@/hooks/useCoachProfileCompletion";
import { useAutoAwardCoachBadges } from "@/hooks/useAutoAwardCoachBadges";
import { useFeaturedBadges } from "@/hooks/useFeaturedBadges";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const rarityColors: Record<string, string> = {
  common: "border-muted-foreground/30",
  uncommon: "border-success/50",
  rare: "border-primary/50",
  epic: "border-accent/50",
  legendary: "border-warning/50",
};

const rarityTextColors: Record<string, string> = {
  common: "text-muted-foreground",
  uncommon: "text-success",
  rare: "text-primary",
  epic: "text-accent",
  legendary: "text-warning",
};

const rarityOrder: Record<string, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

// Subtle gradient for unearned badges
const rarityGradientUnearned: Record<string, string> = {
  common: "radial-gradient(ellipse at 85% 50%, hsla(0, 0%, 60%, 0.08) 0%, transparent 55%)",
  uncommon: "radial-gradient(ellipse at 85% 50%, hsla(142, 76%, 36%, 0.08) 0%, transparent 55%)",
  rare: "radial-gradient(ellipse at 85% 50%, hsla(217, 91%, 60%, 0.08) 0%, transparent 55%)",
  epic: "radial-gradient(ellipse at 85% 50%, hsla(270, 70%, 60%, 0.08) 0%, transparent 55%)",
  legendary: "radial-gradient(ellipse at 85% 50%, hsla(45, 93%, 47%, 0.08) 0%, transparent 55%)",
};

// Stronger gradient for earned badges
const rarityGradientEarned: Record<string, string> = {
  common: "radial-gradient(ellipse at 85% 50%, hsla(0, 0%, 60%, 0.25) 0%, transparent 50%)",
  uncommon: "radial-gradient(ellipse at 85% 50%, hsla(142, 76%, 36%, 0.25) 0%, transparent 50%)",
  rare: "radial-gradient(ellipse at 85% 50%, hsla(217, 91%, 60%, 0.25) 0%, transparent 50%)",
  epic: "radial-gradient(ellipse at 85% 50%, hsla(270, 70%, 60%, 0.25) 0%, transparent 50%)",
  legendary: "radial-gradient(ellipse at 85% 50%, hsla(45, 93%, 47%, 0.25) 0%, transparent 50%)",
};

interface BadgeProgress {
  current: number;
  target: number;
  percentage: number;
  label: string;
}

const calculateBadgeProgress = (
  criteria: Record<string, unknown> | null,
  stats: { clientCount: number; sessionCount: number; reviewCount: number; averageRating: number; isVerified: boolean } | null,
  profileCompletionPercent: number
): BadgeProgress => {
  const criteriaType = criteria?.type as string;
  const criteriaValue = (criteria?.value as number) || 0;

  switch (criteriaType) {
    case "profile_completion": {
      const current = profileCompletionPercent;
      return {
        current,
        target: criteriaValue,
        percentage: Math.min((current / criteriaValue) * 100, 100),
        label: `${current}% / ${criteriaValue}%`,
      };
    }
    case "client_count": {
      const current = stats?.clientCount || 0;
      return {
        current,
        target: criteriaValue,
        percentage: Math.min((current / criteriaValue) * 100, 100),
        label: `${current} / ${criteriaValue} clients`,
      };
    }
    case "session_count": {
      const current = stats?.sessionCount || 0;
      return {
        current,
        target: criteriaValue,
        percentage: Math.min((current / criteriaValue) * 100, 100),
        label: `${current} / ${criteriaValue} sessions`,
      };
    }
    case "review_count": {
      const current = stats?.reviewCount || 0;
      return {
        current,
        target: criteriaValue,
        percentage: Math.min((current / criteriaValue) * 100, 100),
        label: `${current} / ${criteriaValue} reviews`,
      };
    }
    case "rating_threshold": {
      const minReviews = (criteria?.min_reviews as number) || 5;
      const targetRating = (criteria?.rating as number) || criteriaValue;
      const currentRating = stats?.averageRating || 0;
      const hasEnoughReviews = (stats?.reviewCount || 0) >= minReviews;
      return {
        current: currentRating,
        target: targetRating,
        percentage: hasEnoughReviews ? Math.min((currentRating / targetRating) * 100, 100) : 0,
        label: hasEnoughReviews 
          ? `${currentRating.toFixed(1)} / ${targetRating} rating`
          : `Need ${minReviews} reviews first`,
      };
    }
    case "verification": {
      const isVerified = stats?.isVerified || false;
      return {
        current: isVerified ? 1 : 0,
        target: 1,
        percentage: isVerified ? 100 : 0,
        label: isVerified ? "Verified" : "Get verified",
      };
    }
    default:
      return {
        current: 0,
        target: 1,
        percentage: 0,
        label: "In progress",
      };
  }
};

const CoachAchievements = () => {
  const { t } = useTranslation("coach");
  const { data: earnedBadges, isLoading: badgesLoading } = useCoachBadges();
  const { data: availableBadges, isLoading: availableLoading } = useAvailableCoachBadges();
  const { data: stats, isLoading: statsLoading } = useCoachStats();
  const { data: profileCompletion } = useCoachProfileCompletion();
  const { toggleFeatured, isUpdating, MAX_FEATURED_BADGES } = useFeaturedBadges();
  
  // Auto-award badges on page load
  useAutoAwardCoachBadges();

  const isLoading = badgesLoading || availableLoading || statsLoading;

  const earnedBadgeIds = new Set(earnedBadges?.map((b) => b.badge_id) || []);
  const featuredCount = earnedBadges?.filter((b) => b.is_featured).length || 0;
  const profileCompletionPercent = profileCompletion?.percentage || 0;

  // Get ALL badges by category and sort by rarity
  const getBadgesByCategory = (category: string) => {
    const categoryBadges = availableBadges?.filter((b) => b.category === category) || [];
    return categoryBadges.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
  };

  const profileBadges = getBadgesByCategory("coach_profile");
  const milestoneBadges = getBadgesByCategory("coach_milestone");

  const handleToggleFeatured = (coachBadgeId: string, currentlyFeatured: boolean) => {
    toggleFeatured({ coachBadgeId, currentlyFeatured, currentFeaturedCount: featuredCount });
  };

  if (isLoading) {
    return (
      <DashboardLayout title={t("achievementsPage.title")} description={t("achievementsPage.subtitle")}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  const renderBadgeCard = (badge: typeof availableBadges[0]) => {
    const isEarned = earnedBadgeIds.has(badge.id);
    const earnedData = earnedBadges?.find((b) => b.badge_id === badge.id);
    const progress = !isEarned 
      ? calculateBadgeProgress(badge.criteria as Record<string, unknown>, stats || null, profileCompletionPercent)
      : null;

    const gradientStyle = isEarned 
      ? rarityGradientEarned[badge.rarity] 
      : rarityGradientUnearned[badge.rarity];

    return (
      <div
        key={badge.id}
        className={cn(
          "p-4 rounded-xl border-2 transition-all",
          isEarned ? rarityColors[badge.rarity] : "border-muted/50 opacity-80"
        )}
        style={{ background: gradientStyle }}
      >
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Left side - Text content */}
          <div className="flex-1 min-w-0 order-2 sm:order-1">
            <h3 className={cn("font-semibold text-lg", isEarned ? "text-foreground" : "text-muted-foreground")}>
              {badge.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{badge.description}</p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs font-medium capitalize px-2 py-0.5 rounded-full bg-background/50",
                  isEarned ? rarityTextColors[badge.rarity] : "text-muted-foreground"
                )}>
                  {badge.rarity}
                </span>
                {isEarned && earnedData && (
                  <span className="text-xs text-muted-foreground">
                    Earned {format(new Date(earnedData.earned_at), "MMM d, yyyy")}
                  </span>
                )}
              </div>

              {/* Progress bar for unearned badges */}
              {!isEarned && progress && (
                <div className="space-y-1">
                  <Progress value={progress.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">{progress.label}</p>
                </div>
              )}

              {/* Feature button for earned badges */}
              {isEarned && earnedData && (
                <Button
                  size="sm"
                  variant={earnedData.is_featured ? "default" : "outline"}
                  className="h-8 text-xs"
                  onClick={() => handleToggleFeatured(earnedData.id, earnedData.is_featured)}
                  disabled={isUpdating || (!earnedData.is_featured && featuredCount >= MAX_FEATURED_BADGES)}
                >
                  <Star className={cn("h-3 w-3 mr-1", earnedData.is_featured && "fill-current")} />
                  {earnedData.is_featured ? t("achievementsPage.featured") : t("achievementsPage.featureOnProfile")}
                </Button>
              )}
            </div>
          </div>

          {/* Right side - Badge image or Lock icon */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 order-1 sm:order-2 self-center sm:self-start">
            {isEarned ? (
              badge.image_url ? (
                <img 
                  src={badge.image_url} 
                  alt={badge.name} 
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-background/50 flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-primary" />
                </div>
              )
            ) : (
              <div className="w-full h-full rounded-xl bg-muted/30 flex items-center justify-center border border-muted">
                <Lock className="w-10 h-10 text-muted-foreground/50" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const totalEarned = earnedBadges?.length || 0;
  const totalAvailable = availableBadges?.length || 0;

  return (
    <DashboardLayout title={t("achievementsPage.title")} description={t("achievementsPage.subtitle")}>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card-elevated p-4 text-center">
          <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{totalEarned}/{totalAvailable}</p>
          <p className="text-sm text-muted-foreground">{t("achievementsPage.badgesEarned")}</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <Star className="w-8 h-8 text-warning mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{featuredCount}/{MAX_FEATURED_BADGES}</p>
          <p className="text-sm text-muted-foreground">{t("achievementsPage.featuredOnProfile")}</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-2">
            <Check className="w-5 h-5 text-success" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.clientCount || 0}</p>
          <p className="text-sm text-muted-foreground">{t("achievementsPage.activeClients")}</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-2">
            <Dumbbell className="w-5 h-5 text-accent" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.sessionCount || 0}</p>
          <p className="text-sm text-muted-foreground">{t("achievementsPage.sessionsCompleted")}</p>
        </div>
      </div>

      {/* Profile Badges */}
      {profileBadges.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-display font-bold text-foreground mb-4">{t("achievementsPage.profileBadges")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileBadges.map((badge) => renderBadgeCard(badge))}
          </div>
        </div>
      )}

      {/* Milestone Badges */}
      {milestoneBadges.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-display font-bold text-foreground mb-4">{t("achievementsPage.milestoneBadges")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestoneBadges.map((badge) => renderBadgeCard(badge))}
          </div>
        </div>
      )}

      {/* Empty State - only if no badges exist at all */}
      {totalAvailable === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">{t("achievementsPage.noBadges")}</h3>
          <p className="text-muted-foreground">{t("achievementsPage.checkBackLater")}</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CoachAchievements;
