import { useNavigate } from "react-router-dom";
import { useUserStats } from "@/hooks/useUserStats";
import { useProfilePanel } from "@/contexts/ProfilePanelContext";
import { Dumbbell, Award, Target, TrendingUp, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    { icon: Dumbbell, value: formatNumber(stats.workoutCount), color: "text-blue-400", tooltip: "Workouts", route: "/dashboard/client/training" },
    { icon: Award, value: formatNumber(stats.badgesEarned), color: "text-purple-400", tooltip: "Badges", route: "/dashboard/client/achievements" },
    { icon: Target, value: formatNumber(stats.challengesCompleted), color: "text-green-400", tooltip: "Challenges", route: "/dashboard/client/challenges" },
    { icon: TrendingUp, value: formatNumber(stats.progressEntries), color: "text-cyan-400", tooltip: "Progress entries", route: "/dashboard/client/stats" },
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
      <div className="grid grid-cols-5 gap-1.5">
        {statItems.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <button 
                onClick={() => handleClick(item.route)}
                className="glass-subtle flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-accent/10 transition-colors"
              >
                <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span className="text-[10px] font-bold text-foreground mt-0.5 truncate max-w-full">
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
