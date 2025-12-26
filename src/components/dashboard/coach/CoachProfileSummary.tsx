import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronRight, CheckCircle, Zap, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSelectedAvatar } from "@/hooks/useAvatars";
import { useCoachProfile } from "@/hooks/useCoachClients";
import { useCoachBoostStatus, isBoostActive, getBoostRemainingDays } from "@/hooks/useCoachBoost";
import { cn } from "@/lib/utils";
import { useProfilePanel } from "@/contexts/ProfilePanelContext";
import { UserAvatar } from "@/components/shared/UserAvatar";
import NotchCoachEarnings from "./NotchCoachEarnings";
import NotchNextSession from "./NotchNextSession";
import NotchCoachMiniStats from "./NotchCoachMiniStats";
import NotchCoachBadgeProgress from "./NotchCoachBadgeProgress";

const CoachProfileSummary = () => {
  const { t } = useTranslation(["coach", "common"]);
  const navigate = useNavigate();
  const { close } = useProfilePanel();
  const { profile } = useUserProfile();
  const { data: selectedAvatar } = useSelectedAvatar('coach');
  const { data: coachProfile } = useCoachProfile();

  const { data: boostStatus } = useCoachBoostStatus();
  
  const displayName = profile?.display_name || profile?.first_name || t("common:profile.coach");
  const subscriptionTier = coachProfile?.subscription_tier || "free";
  const isVerified = coachProfile?.is_verified;
  
  // Boost status
  const boostActive = isBoostActive(boostStatus);
  const remainingDays = getBoostRemainingDays(boostStatus);
  const showExpiryWarning = boostActive && remainingDays <= 7;
  const isUrgent = remainingDays <= 3;

  // Profile completion
  const profileCompletion = coachProfile ? calculateProfileCompletion(coachProfile) : 0;

  const handleNavigate = (path: string) => {
    close();
    navigate(path);
  };

  // Tier styling
  const getTierStyle = () => {
    switch (subscriptionTier) {
      case "enterprise":
        return "border-yellow-500/50 text-yellow-500 bg-yellow-500/10";
      case "pro":
        return "border-primary/50 text-primary bg-primary/10";
      default:
        return "border-border/50 text-muted-foreground bg-muted/50";
    }
  };

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Row 1: Avatar and Name Section (compact) */}
      <div className="flex items-start gap-3">
        <UserAvatar
          src={selectedAvatar ? undefined : (coachProfile?.profile_image_url || profile?.avatar_url)}
          avatarSlug={selectedAvatar?.slug}
          avatarRarity={selectedAvatar?.rarity}
          name={displayName}
          size="lg"
          className="shrink-0 border-2 border-primary/30"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground truncate">
              {displayName}
            </h2>
            {isVerified && (
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
            )}
          </div>
          
          {/* Tier Badge inline */}
          <div className="flex items-center gap-2 mt-0.5">
            <Badge 
              variant="outline" 
              className={cn("text-[10px] capitalize px-2 py-0", getTierStyle())}
            >
              {subscriptionTier} {t("common:profile.plan", "Plan")}
            </Badge>
          </div>
          
          {/* Profile Completion (compact) */}
          <div className="mt-1.5">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-muted-foreground">
                {t("coach:profile.completion", "Profile")}
              </span>
              <span className="text-[10px] font-medium text-primary">{profileCompletion}%</span>
            </div>
            <Progress 
              value={profileCompletion} 
              className="h-1 bg-muted"
            />
          </div>
        </div>
        
        {/* Boost Status Badge */}
        <button
          onClick={() => handleNavigate("/dashboard/coach/boost")}
          className="flex flex-col items-end gap-0.5 shrink-0"
        >
          <Badge 
            variant="outline"
            className={cn(
              "text-[10px] px-2 py-0.5 flex items-center gap-1",
              boostActive 
                ? "border-primary/50 text-primary bg-primary/10" 
                : "border-border/50 text-muted-foreground bg-muted/50"
            )}
          >
            <Zap className="w-3 h-3" />
            {boostActive ? t("coach:boost.active", "Boost Active") : t("coach:boost.inactive", "Boost Inactive")}
          </Badge>
          
          {showExpiryWarning && (
            <span className={cn(
              "text-[10px] flex items-center gap-0.5",
              isUrgent ? "text-destructive" : "text-orange-500"
            )}>
              {isUrgent && <AlertTriangle className="w-3 h-3" />}
              {t("coach:boost.expiresIn", "Expires in")} {remainingDays}d
            </span>
          )}
        </button>
      </div>

      {/* Row 2: Earnings & Next Session (2-column grid) */}
      <div className="grid grid-cols-2 gap-2">
        <NotchCoachEarnings />
        <NotchNextSession />
      </div>

      {/* Row 3: Nearest Badge Progress (full width) */}
      <NotchCoachBadgeProgress />

      {/* Row 4: Mini Stats (6-column) */}
      <NotchCoachMiniStats />

      {/* Row 5: Quick Actions */}
      <div className="flex gap-2 mt-auto">
        <Button
          variant="outline"
          className="flex-1 glass-interactive border-border/30 hover:border-primary/40 h-9"
          onClick={() => handleNavigate("/dashboard/coach/settings")}
        >
          {t("common:profile.viewProfile", "View Profile")}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        <Button
          variant="outline"
          className="flex-1 glass-interactive border-border/30 hover:border-primary/40 h-9"
          onClick={() => handleNavigate("/dashboard/coach/clients")}
        >
          {t("coach:dashboard.manageClients", "Clients")}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

// Helper function to calculate profile completion
function calculateProfileCompletion(profile: any): number {
  const fields = [
    'display_name',
    'bio',
    'profile_image_url',
    'coach_types',
    'location',
    'hourly_rate',
    'certifications'
  ];
  
  const completed = fields.filter(field => {
    const value = profile[field];
    if (Array.isArray(value)) return value.length > 0;
    return !!value;
  }).length;
  
  return Math.round((completed / fields.length) * 100);
}

export default CoachProfileSummary;
