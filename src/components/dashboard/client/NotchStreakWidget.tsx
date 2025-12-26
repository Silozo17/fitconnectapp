import { useTranslation } from "react-i18next";
import { Flame } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { cn } from "@/lib/utils";

const NotchStreakWidget = () => {
  const { t } = useTranslation("common");
  const { data: stats, isLoading } = useUserStats();
  
  const streak = stats?.habitStreak || 0;

  return (
    <div className="glass-subtle flex items-center gap-3 p-3 rounded-xl">
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
    </div>
  );
};

export default NotchStreakWidget;
