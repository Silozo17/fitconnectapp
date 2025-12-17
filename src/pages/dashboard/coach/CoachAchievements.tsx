import { Trophy, Lock, Check, Star, Dumbbell } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useCoachBadges, useAvailableCoachBadges, useCoachStats } from "@/hooks/useCoachGamification";
import { useCoachProfileCompletion } from "@/hooks/useCoachProfileCompletion";
import { useAutoAwardCoachBadges } from "@/hooks/useAutoAwardCoachBadges";
import { useFeaturedBadges } from "@/hooks/useFeaturedBadges";
import { getBadgeIcon } from "@/lib/badge-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const rarityColors: Record<string, string> = {
  common: "border-muted-foreground/30 bg-muted/20",
  uncommon: "border-success/50 bg-success/10",
  rare: "border-primary/50 bg-primary/10",
  epic: "border-accent/50 bg-accent/10",
  legendary: "border-warning/50 bg-warning/10",
};

const rarityTextColors: Record<string, string> = {
  common: "text-muted-foreground",
  uncommon: "text-success",
  rare: "text-primary",
  epic: "text-accent",
  legendary: "text-warning",
};

const CoachAchievements = () => {
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

  // Group badges by category
  const profileBadges = availableBadges?.filter((b) => b.category === "coach_profile") || [];
  const milestoneBadges = availableBadges?.filter((b) => b.category === "coach_milestone") || [];

  // Calculate progress for milestone badges
  const getBadgeProgress = (badge: { criteria: Record<string, unknown> }) => {
    if (!stats) return { current: 0, target: 0, percentage: 0 };

    const criteria = badge.criteria as { type?: string; value?: number };
    const criteriaType = criteria.type;
    const criteriaValue = criteria.value || 0;
    
    if (criteriaType === "profile_completion") {
      return {
        current: profileCompletion?.percentage || 0,
        target: criteriaValue,
        percentage: Math.min(100, ((profileCompletion?.percentage || 0) / criteriaValue) * 100),
      };
    }
    if (criteriaType === "client_count") {
      return {
        current: stats.clientCount,
        target: criteriaValue,
        percentage: Math.min(100, (stats.clientCount / criteriaValue) * 100),
      };
    }
    if (criteriaType === "session_count") {
      return {
        current: stats.sessionCount,
        target: criteriaValue,
        percentage: Math.min(100, (stats.sessionCount / criteriaValue) * 100),
      };
    }
    if (criteriaType === "review_count") {
      return {
        current: stats.reviewCount,
        target: criteriaValue,
        percentage: Math.min(100, (stats.reviewCount / criteriaValue) * 100),
      };
    }
    if (criteriaType === "verification") {
      return {
        current: stats.isVerified ? 1 : 0,
        target: 1,
        percentage: stats.isVerified ? 100 : 0,
      };
    }
    return { current: 0, target: 0, percentage: 0 };
  };

  const handleToggleFeatured = (coachBadgeId: string, currentlyFeatured: boolean) => {
    toggleFeatured({ coachBadgeId, currentlyFeatured, currentFeaturedCount: featuredCount });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Achievements" description="Track your coaching milestones and badges">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  const renderBadgeCard = (badge: typeof availableBadges[0], isProfileBadge: boolean) => {
    const isEarned = earnedBadgeIds.has(badge.id);
    const earnedData = earnedBadges?.find((b) => b.badge_id === badge.id);
    const progress = getBadgeProgress(badge);
    const IconComponent = getBadgeIcon(badge.icon);

    return (
      <div
        key={badge.id}
        className={cn(
          "p-4 rounded-xl border-2 transition-all",
          isEarned ? rarityColors[badge.rarity] : "border-border bg-card opacity-60"
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden",
            isEarned ? "bg-background/50" : "bg-muted"
          )}>
            {isEarned ? (
              badge.image_url ? (
                <img src={badge.image_url} alt={badge.name} className="w-10 h-10 object-contain" />
              ) : (
                <IconComponent className="h-6 w-6" />
              )
            ) : (
              <Lock className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">{badge.name}</h3>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{badge.description}</p>
            
            {isEarned ? (
              <div className="space-y-2">
                <p className="text-xs text-success">
                  Earned {format(new Date(earnedData!.earned_at), "MMM d, yyyy")}
                </p>
                <Button
                  size="sm"
                  variant={earnedData?.is_featured ? "default" : "outline"}
                  className="h-7 text-xs"
                  onClick={() => handleToggleFeatured(earnedData!.id, earnedData!.is_featured)}
                  disabled={isUpdating || (!earnedData?.is_featured && featuredCount >= MAX_FEATURED_BADGES)}
                >
                  <Star className={cn("h-3 w-3 mr-1", earnedData?.is_featured && "fill-current")} />
                  {earnedData?.is_featured ? "Featured" : "Feature"}
                </Button>
              </div>
            ) : (
              <div>
                <Progress value={progress.percentage} className="h-1.5 mb-1" />
                <p className="text-xs text-muted-foreground">
                  {isProfileBadge ? `${progress.current}% / ${progress.target}%` : `${progress.current} / ${progress.target}`}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 flex justify-end">
          <span className={cn("text-xs font-medium capitalize", rarityTextColors[badge.rarity])}>
            {badge.rarity}
          </span>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Achievements" description="Track your coaching milestones and badges">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card-elevated p-4 text-center">
          <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{earnedBadges?.length || 0}</p>
          <p className="text-sm text-muted-foreground">Badges Earned</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <Star className="w-8 h-8 text-warning mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{featuredCount}/{MAX_FEATURED_BADGES}</p>
          <p className="text-sm text-muted-foreground">Featured on Profile</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-2">
            <Check className="w-5 h-5 text-success" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.clientCount || 0}</p>
          <p className="text-sm text-muted-foreground">Active Clients</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-2">
            <Dumbbell className="w-5 h-5 text-accent" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.sessionCount || 0}</p>
          <p className="text-sm text-muted-foreground">Sessions Completed</p>
        </div>
      </div>

      {/* Profile Badges */}
      <div className="mb-8">
        <h2 className="text-xl font-display font-bold text-foreground mb-4">Profile Badges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profileBadges.map((badge) => renderBadgeCard(badge, true))}
        </div>
      </div>

      {/* Milestone Badges */}
      <div>
        <h2 className="text-xl font-display font-bold text-foreground mb-4">Milestone Badges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {milestoneBadges.map((badge) => renderBadgeCard(badge, false))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CoachAchievements;
