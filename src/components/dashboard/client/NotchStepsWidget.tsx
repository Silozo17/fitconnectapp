import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Footprints } from "lucide-react";
import { useHealthData } from "@/hooks/useHealthData";
import { useProfilePanel } from "@/contexts/ProfilePanelContext";
import { cn } from "@/lib/utils";

const DAILY_STEP_GOAL = 10000;

const NotchStepsWidget = () => {
  const navigate = useNavigate();
  const { close } = useProfilePanel();
  
  const handleClick = () => {
    close();
    navigate("/dashboard/client/progress");
  };
  const { t } = useTranslation("common");
  const { getTodayValue, isLoading, data } = useHealthData();
  
  const steps = getTodayValue("steps");
  const progress = Math.min(100, (steps / DAILY_STEP_GOAL) * 100);
  
  // Check if we've loaded data at least once (even if empty)
  // This prevents infinite loading animation when there's no data
  const hasLoadedOnce = !isLoading && data !== undefined;
  
  // Calculate circumference for circular progress
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <button onClick={handleClick} className="w-full glass-subtle flex items-center gap-3 p-3 rounded-xl text-left hover:bg-accent/10 transition-colors">
      {/* Circular Progress Ring */}
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
          {/* Background circle */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="4"
          />
          {/* Progress circle */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Footprints className="w-4 h-4 text-primary" />
        </div>
      </div>
      
      {/* Steps count and label */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-lg font-bold text-foreground tabular-nums",
          isLoading && !hasLoadedOnce && "animate-pulse"
        )}>
          {isLoading && !hasLoadedOnce ? "—" : steps.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("stats.stepsToday", "Steps today")}
        </p>
      </div>
      
      {/* Progress percentage */}
      <div className="text-right">
        <span className={cn(
          "text-sm font-medium",
          progress >= 100 ? "text-green-500" : "text-muted-foreground"
        )}>
          {Math.round(progress)}%
        </span>
      </div>
    </button>
  );
};

export default NotchStepsWidget;
