import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Flame } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { useProfilePanel } from "@/contexts/ProfilePanelContext";
import { cn } from "@/lib/utils";

const NotchStreakWidget = () => {
  const navigate = useNavigate();
  const { close } = useProfilePanel();
  
  const handleClick = () => {
    close();
    navigate("/dashboard/client/stats");
  };
  const { t } = useTranslation("common");
  const { data: stats, isLoading } = useUserStats();
  
  const streak = stats?.habitStreak || 0;

  return (
    <button onClick={handleClick} className="w-full glass-subtle flex items-center gap-3 p-3 rounded-xl text-left hover:bg-accent/10 transition-colors">
      {/* Flame icon with glow effect */}
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
        streak > 0 ? "bg-orange-500/20" : "bg-muted"
      )}>
        <Flame className={cn(
          "w-6 h-6",
          streak > 0 ? "text-orange-500" : "text-muted-foreground"
        )} />
      </div>
      
      {/* Streak count and label */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-lg font-bold text-foreground tabular-nums",
          isLoading && "animate-pulse"
        )}>
          {isLoading ? "—" : `${streak}d`}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("stats.streak", "Streak")}
        </p>
      </div>
    </button>
  );
};

export default NotchStreakWidget;
