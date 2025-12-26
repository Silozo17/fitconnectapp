import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { 
  Trophy, 
  Flame, 
  Award, 
  Dumbbell, 
  Target,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useUserStats } from "@/hooks/useUserStats";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSelectedAvatar, getAvatarImageUrl } from "@/hooks/useAvatars";
import { useClientXP, getLevelTitle } from "@/hooks/useGamification";
import { cn } from "@/lib/utils";
import { useProfilePanel } from "@/contexts/ProfilePanelContext";

const ClientProfileSummary = () => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { close } = useProfilePanel();
  const { profile } = useUserProfile();
  const { data: selectedAvatar } = useSelectedAvatar('client');
  const { data: stats, isLoading } = useUserStats();
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

  const statItems = [
    {
      icon: Trophy,
      label: t("stats.rank", "Rank"),
      value: stats?.leaderboardRank ? `#${stats.leaderboardRank}` : "-",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      icon: Flame,
      label: t("stats.streak", "Streak"),
      value: stats?.habitStreak ? `${stats.habitStreak}d` : "0d",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      icon: Award,
      label: t("stats.badges", "Badges"),
      value: stats?.badgesEarned || 0,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: Dumbbell,
      label: t("stats.workouts", "Workouts"),
      value: stats?.workoutCount || 0,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Target,
      label: t("stats.challenges", "Challenges"),
      value: stats?.challengesCompleted || 0,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10"
    },
    {
      icon: Sparkles,
      label: t("stats.xp", "Total XP"),
      value: stats?.xpTotal?.toLocaleString() || 0,
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Avatar and Name Section */}
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-16 w-16 border-2 border-primary/30">
          <AvatarImage src={avatarUrl || undefined} alt={displayName} />
          <AvatarFallback className="bg-primary/20 text-primary text-lg font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-foreground truncate">
            {displayName}
          </h2>
          
          {/* Level and XP Progress */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium text-primary">
              {t("stats.level", "Level")} {xpData?.current_level || 1}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {levelTitle}
            </span>
          </div>
          
          {/* XP Progress Bar */}
          <div className="mt-2">
            <Progress 
              value={xpProgress} 
              className="h-1.5 bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-0.5">
              {xpData?.xp_to_next_level || 1000} XP {t("stats.toNextLevel", "to next level")}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid - 3x2 layout */}
      <div className="grid grid-cols-3 gap-2 flex-1 mb-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={cn(
                "glass-subtle flex flex-col items-center justify-center py-3 px-2",
                isLoading && "animate-pulse"
              )}
            >
              <div className={cn("p-1.5 rounded-lg mb-1", item.bgColor)}>
                <Icon className={cn("w-4 h-4", item.color)} />
              </div>
              <span className="text-lg font-bold text-foreground">
                {isLoading ? "-" : item.value}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 glass-interactive border-border/30 hover:border-primary/40"
          onClick={() => handleNavigate("/dashboard/client/settings")}
        >
          {t("profile.viewProfile", "View Profile")}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        <Button
          variant="outline"
          className="flex-1 glass-interactive border-border/30 hover:border-primary/40"
          onClick={() => handleNavigate("/dashboard/client/achievements")}
        >
          {t("profile.achievements", "Achievements")}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default ClientProfileSummary;
