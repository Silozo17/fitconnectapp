import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronRight, CheckCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSelectedAvatar, getAvatarImageUrl } from "@/hooks/useAvatars";
import { useCoachProfile } from "@/hooks/useCoachClients";
import { cn } from "@/lib/utils";
import { useProfilePanel } from "@/contexts/ProfilePanelContext";
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

  const displayName = profile?.display_name || profile?.first_name || t("common:profile.coach");
  const avatarUrl = selectedAvatar ? getAvatarImageUrl(selectedAvatar.slug) : (coachProfile?.profile_image_url || profile?.avatar_url);
  const initials = displayName?.slice(0, 2).toUpperCase() || "C";
  const subscriptionTier = coachProfile?.subscription_tier || "free";
  const isVerified = coachProfile?.is_verified;

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
      <div className="flex items-center gap-3">
        <Avatar className="h-14 w-14 border-2 border-primary/30">
          <AvatarImage src={avatarUrl || undefined} alt={displayName} />
          <AvatarFallback className="bg-primary/20 text-primary text-lg font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        
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
