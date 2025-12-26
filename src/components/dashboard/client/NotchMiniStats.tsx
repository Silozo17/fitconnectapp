import { useUserStats } from "@/hooks/useUserStats";
import { Trophy, Dumbbell, Award, Target, TrendingUp, Zap } from "lucide-react";

const formatNumber = (num: number): string => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
};

const NotchMiniStats = () => {
  const { data, isLoading } = useUserStats();

  const stats = data || {
    leaderboardRank: 0,
    workoutCount: 0,
    badgesEarned: 0,
    challengesCompleted: 0,
    progressEntries: 0,
    xpTotal: 0,
  };

  const statItems = [
    { icon: Trophy, value: stats.leaderboardRank ? `#${stats.leaderboardRank}` : "—", color: "text-amber-500" },
    { icon: Dumbbell, value: formatNumber(stats.workoutCount), color: "text-blue-400" },
    { icon: Award, value: formatNumber(stats.badgesEarned), color: "text-purple-400" },
    { icon: Target, value: formatNumber(stats.challengesCompleted), color: "text-green-400" },
    { icon: TrendingUp, value: formatNumber(stats.progressEntries), color: "text-cyan-400" },
    { icon: Zap, value: formatNumber(stats.xpTotal), color: "text-primary" },
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
    <div className="grid grid-cols-6 gap-1.5">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="glass-subtle flex flex-col items-center justify-center p-1.5 rounded-lg"
        >
          <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
          <span className="text-[10px] font-bold text-foreground mt-0.5">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default NotchMiniStats;
