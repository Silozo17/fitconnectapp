import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSelectedAvatar, getAvatarImageUrl } from "@/hooks/useAvatars";
import { useClientXP, getLevelTitle, calculateLevelFromXP } from "@/hooks/useGamification";
import { useProfilePanel } from "@/contexts/ProfilePanelContext";
import NotchStepsWidget from "./NotchStepsWidget";
import NotchStreakWidget from "./NotchStreakWidget";
import NotchNearestBadge from "./NotchNearestBadge";
import NotchMiniStats from "./NotchMiniStats";
import NotchBMIWidget from "./NotchBMIWidget";
import NotchLeaderboardWidget from "./NotchLeaderboardWidget";

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

  // Calculate XP progress percentage using correct level calculation
  const { xpInLevel, xpForNextLevel } = calculateLevelFromXP(xpData?.total_xp || 0);
  const xpProgress = xpForNextLevel > 0 
    ? Math.max((xpInLevel / xpForNextLevel) * 100, 8) 
    : 0;

  const handleNavigate = (path: string) => {
    close();
    navigate(path);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Avatar, Name and BMI Section */}
      <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/30">
        <UserAvatar
          src={selectedAvatar ? undefined : profile?.avatar_url}
          avatarSlug={selectedAvatar?.slug}
          avatarRarity={selectedAvatar?.rarity}
          name={displayName}
          size="md"
          className="shrink-0 ring-2 ring-primary/40 shadow-lg"
        />
        
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground truncate">
            {displayName}
          </h2>
          
          {/* Level and XP Progress */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-bold text-primary">
              Lv.{xpData?.current_level || 1}
            </span>
            <span className="text-[10px] text-muted-foreground">•</span>
            <span className="text-[11px] text-muted-foreground truncate font-medium">
              {levelTitle}
            </span>
          </div>
          
          {/* XP Progress Bar with gradient */}
          <div className="mt-1.5">
            <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
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
      <div className="mb-2">
        <NotchMiniStats />
      </div>

      {/* Leaderboard Widget */}
      <div className="mb-3">
        <NotchLeaderboardWidget />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mt-auto">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 rounded-xl border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-xs font-medium transition-all"
          onClick={() => handleNavigate("/dashboard/client/settings")}
        >
          {t("profile.viewProfile", "View Profile")}
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 rounded-xl border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-xs font-medium transition-all"
          onClick={() => handleNavigate("/dashboard/client/achievements")}
        >
          {t("profile.achievements", "Achievements")}
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      {/* Bottom spacer to avoid notch overlap */}
      <div className="h-[50px] shrink-0" aria-hidden="true" />
    </div>
  );
};

export default ClientProfileSummary;
