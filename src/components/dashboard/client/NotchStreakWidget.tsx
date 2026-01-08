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
    navigate("/dashboard/client/habits");
  };
  const { t } = useTranslation("common");
  const { data: stats, isLoading } = useUserStats();
  
  const streak = stats?.habitStreak || 0;

  return (
    <button 
      onClick={handleClick} 
      className="w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-orange-500/20 shadow-lg"
    >
      {/* Flame icon with glow effect */}
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative",
        streak > 0 ? "bg-orange-500/20" : "bg-muted/50"
      )}>
        <Flame className={cn(
          "w-6 h-6 transition-all",
          streak > 0 ? "text-orange-500 drop-shadow-[0_0_8px_hsl(25_95%_53%/0.6)]" : "text-muted-foreground"
        )} />
      </div>
      
      {/* Streak count and label */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-xl font-bold text-foreground tabular-nums tracking-tight",
          isLoading && "animate-pulse"
        )}>
          {isLoading ? "—" : streak}
          <span className="text-sm font-medium text-muted-foreground ml-0.5">days</span>
        </p>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
          {t("stats.streak", "Streak")}
        </p>
      </div>

      {/* Streak badge */}
      {streak >= 7 && (
        <div className="px-2 py-1 rounded-lg text-xs font-bold bg-orange-500/20 text-orange-400">
          🔥
        </div>
      )}
    </button>
  );
};

export default NotchStreakWidget;
