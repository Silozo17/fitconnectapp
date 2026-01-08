import { useNavigate } from "react-router-dom";
import { Trophy, MapPin, ChevronRight } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfilePanel } from "@/contexts/ProfilePanelContext";

const NotchLeaderboardWidget = () => {
  const navigate = useNavigate();
  const { close } = useProfilePanel();
  const { data, isLoading } = useUserStats();

  const stats = data || {
    leaderboardRank: 0,
    totalLeaderboardUsers: 0,
    localRank: 0,
    localTotal: 0,
    localArea: null,
    localType: 'global' as const,
  };

  const handleClick = () => {
    close();
    navigate("/dashboard/client/leaderboard");
  };

  if (isLoading) {
    return (
      <div className="glass-subtle rounded-lg p-3">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-6 w-32" />
      </div>
    );
  }

  const hasLocalRank = stats.localArea && stats.localRank > 0;
  const Icon = hasLocalRank ? MapPin : Trophy;

  return (
    <button
      onClick={handleClick}
      className="w-full rounded-2xl p-3 text-left transition-all duration-200 hover:scale-[1.01] bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-amber-500/20 shadow-lg group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-amber-500 drop-shadow-[0_0_6px_hsl(38_92%_50%/0.5)]" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              {hasLocalRank ? stats.localArea : 'Global'} Rank
            </p>
            <p className="text-lg font-bold text-foreground">
              #{hasLocalRank ? stats.localRank : stats.leaderboardRank}
              <span className="text-sm text-muted-foreground font-normal ml-0.5">
                /{hasLocalRank ? stats.localTotal : stats.totalLeaderboardUsers}
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hasLocalRank && (
            <span className="text-[10px] px-2 py-1 rounded-lg bg-muted/50 text-muted-foreground font-medium">
              Global #{stats.leaderboardRank}
            </span>
          )}
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </button>
  );
};

export default NotchLeaderboardWidget;
