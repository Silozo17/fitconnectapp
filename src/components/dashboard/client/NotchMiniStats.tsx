import { useUserStats } from "@/hooks/useUserStats";
import { Trophy, Dumbbell, Award, Target, TrendingUp, Zap, MapPin } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const formatNumber = (num: number): string => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
};

const NotchMiniStats = () => {
  const { data, isLoading } = useUserStats();

  const stats = data || {
    leaderboardRank: 0,
    totalLeaderboardUsers: 0,
    localRank: 0,
    localTotal: 0,
    localArea: null,
    localType: 'global' as const,
    workoutCount: 0,
    badgesEarned: 0,
    challengesCompleted: 0,
    progressEntries: 0,
    xpTotal: 0,
  };

  // Format the rank display based on local area
  const getRankDisplay = () => {
    if (stats.localRank === 0) return "—";
    return `#${stats.localRank}/${stats.localTotal}`;
  };

  const getRankLabel = () => {
    if (stats.localType === 'city' && stats.localArea) {
      return `in ${stats.localArea}`;
    }
    if (stats.localType === 'county' && stats.localArea) {
      return `in ${stats.localArea}`;
    }
    return 'Global';
  };

  const statItems = [
    { 
      icon: stats.localArea ? MapPin : Trophy, 
      value: getRankDisplay(), 
      color: "text-amber-500",
      tooltip: stats.localArea 
        ? `#${stats.localRank}/${stats.localTotal} ${getRankLabel()} • Global: #${stats.leaderboardRank}/${stats.totalLeaderboardUsers}`
        : `Global rank: #${stats.leaderboardRank}/${stats.totalLeaderboardUsers}`
    },
    { icon: Dumbbell, value: formatNumber(stats.workoutCount), color: "text-blue-400", tooltip: "Workouts" },
    { icon: Award, value: formatNumber(stats.badgesEarned), color: "text-purple-400", tooltip: "Badges" },
    { icon: Target, value: formatNumber(stats.challengesCompleted), color: "text-green-400", tooltip: "Challenges" },
    { icon: TrendingUp, value: formatNumber(stats.progressEntries), color: "text-cyan-400", tooltip: "Progress entries" },
    { icon: Zap, value: formatNumber(stats.xpTotal), color: "text-primary", tooltip: "Total XP" },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-subtle rounded-lg p-2 h-12 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-6 gap-1.5">
        {statItems.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <div className="glass-subtle flex flex-col items-center justify-center p-1.5 rounded-lg cursor-default">
                <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span className="text-[10px] font-bold text-foreground mt-0.5 truncate max-w-full">
                  {item.value}
                </span>
                {index === 0 && stats.localArea && (
                  <span className="text-[8px] text-muted-foreground truncate max-w-full leading-none">
                    {stats.localArea.length > 8 ? stats.localArea.substring(0, 8) + '…' : stats.localArea}
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {item.tooltip}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default NotchMiniStats;
