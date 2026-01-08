import { useNavigate } from "react-router-dom";
import { useUserStats } from "@/hooks/useUserStats";
import { useProfilePanel } from "@/contexts/ProfilePanelContext";
import { Dumbbell, Award, Target, TrendingUp, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const formatNumber = (num: number): string => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
};

const NotchMiniStats = () => {
  const navigate = useNavigate();
  const { close } = useProfilePanel();
  const { data, isLoading } = useUserStats();

  const stats = data || {
    workoutCount: 0,
    badgesEarned: 0,
    challengesCompleted: 0,
    progressEntries: 0,
    xpTotal: 0,
  };

  const handleClick = (route: string) => {
    close();
    navigate(route);
  };

  const statItems = [
    { icon: Dumbbell, value: formatNumber(stats.workoutCount), color: "text-blue-400", tooltip: "Workouts", route: "/dashboard/client/plans" },
    { icon: Award, value: formatNumber(stats.badgesEarned), color: "text-purple-400", tooltip: "Badges", route: "/dashboard/client/achievements" },
    { icon: Target, value: formatNumber(stats.challengesCompleted), color: "text-green-400", tooltip: "Challenges", route: "/dashboard/client/challenges" },
    { icon: TrendingUp, value: formatNumber(stats.progressEntries), color: "text-cyan-400", tooltip: "Progress entries", route: "/dashboard/client/progress" },
    { icon: Zap, value: formatNumber(stats.xpTotal), color: "text-primary", tooltip: "Total XP", route: "/dashboard/client/achievements" },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass-subtle rounded-lg p-2 h-12 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-5 gap-2">
        {statItems.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <button 
                onClick={() => handleClick(item.route)}
                className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 hover:scale-105 bg-gradient-to-br from-card/60 to-card/30 backdrop-blur-lg border border-border/30"
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center mb-1",
                  item.color === "text-blue-400" && "bg-blue-500/20",
                  item.color === "text-purple-400" && "bg-purple-500/20",
                  item.color === "text-green-400" && "bg-green-500/20",
                  item.color === "text-cyan-400" && "bg-cyan-500/20",
                  item.color === "text-primary" && "bg-primary/20"
                )}>
                  <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                </div>
                <span className="text-xs font-bold text-foreground tabular-nums">
                  {item.value}
                </span>
              </button>
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
