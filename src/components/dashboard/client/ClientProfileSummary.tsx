import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSelectedAvatar, getAvatarImageUrl } from "@/hooks/useAvatars";
import { useClientXP, getLevelTitle } from "@/hooks/useGamification";
import { useProfilePanel } from "@/contexts/ProfilePanelContext";
import NotchStepsWidget from "./NotchStepsWidget";
import NotchStreakWidget from "./NotchStreakWidget";
import NotchNearestBadge from "./NotchNearestBadge";
import NotchMiniStats from "./NotchMiniStats";
import NotchBMIWidget from "./NotchBMIWidget";

const ClientProfileSummary = () => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { close } = useProfilePanel();
  const { profile } = useUserProfile();
  const { data: selectedAvatar } = useSelectedAvatar('client');
  const { data: xpData } = useClientXP();

  const displayName = profile?.display_name || profile?.first_name || t("profile.user");
  const avatarUrl = selectedAvatar ? getAvatarImageUrl(selectedAvatar.slug) : profile?.avatar_url;
  const initials = displayName?.slice(0, 2).toUpperCase() || "U";
  const levelTitle = getLevelTitle(xpData?.current_level || 1);

  // Calculate XP progress percentage
  const xpProgress = xpData?.xp_to_next_level 
    ? Math.min(100, ((xpData.total_xp % 1000) / (xpData.xp_to_next_level || 1000)) * 100) 
    : 0;

  const handleNavigate = (path: string) => {
    close();
    navigate(path);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Avatar, Name and BMI Section */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="h-12 w-12 border-2 border-primary/30 shrink-0">
          <AvatarImage src={avatarUrl || undefined} alt={displayName} />
          <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-foreground truncate">
            {displayName}
          </h2>
          
          {/* Level and XP Progress */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-medium text-primary">
              Lv.{xpData?.current_level || 1}
            </span>
            <span className="text-[10px] text-muted-foreground">•</span>
            <span className="text-[10px] text-muted-foreground truncate">
              {levelTitle}
            </span>
          </div>
          
          {/* XP Progress Bar */}
          <div className="mt-1">
            <Progress 
              value={xpProgress} 
              className="h-1 bg-muted"
            />
          </div>
        </div>

        {/* Mini BMI Widget */}
        <NotchBMIWidget />
      </div>

      {/* Compact Widgets - 2 columns for steps/streak */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <NotchStepsWidget />
        <NotchStreakWidget />
      </div>

      {/* Nearest Badge - full width */}
      <div className="mb-2">
        <NotchNearestBadge />
      </div>

      {/* Mini Stats Grid */}
      <div className="mb-3">
        <NotchMiniStats />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mt-auto">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 glass-interactive border-border/30 hover:border-primary/40 text-xs"
          onClick={() => handleNavigate("/dashboard/client/settings")}
        >
          {t("profile.viewProfile", "View Profile")}
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 glass-interactive border-border/30 hover:border-primary/40 text-xs"
          onClick={() => handleNavigate("/dashboard/client/achievements")}
        >
          {t("profile.achievements", "Achievements")}
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default ClientProfileSummary;
