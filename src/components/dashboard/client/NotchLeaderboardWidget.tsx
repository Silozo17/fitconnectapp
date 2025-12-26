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
      className="w-full glass-subtle rounded-lg p-3 text-left hover:bg-accent/10 transition-colors group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-500/20">
            <Icon className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
              {hasLocalRank ? stats.localArea : 'Global'} Rank
            </p>
            <p className="text-sm font-bold text-foreground">
              #{hasLocalRank ? stats.localRank : stats.leaderboardRank}
              <span className="text-muted-foreground font-normal">
                /{hasLocalRank ? stats.localTotal : stats.totalLeaderboardUsers}
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {hasLocalRank && (
            <span className="text-[10px] text-muted-foreground">
              Global #{stats.leaderboardRank}
            </span>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </button>
  );
};

export default NotchLeaderboardWidget;
