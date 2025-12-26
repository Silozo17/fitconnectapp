import { useTranslation } from "react-i18next";
import { Footprints } from "lucide-react";
import { useHealthData } from "@/hooks/useHealthData";
import { cn } from "@/lib/utils";

const DAILY_STEP_GOAL = 10000;

const NotchStepsWidget = () => {
  const { t } = useTranslation("common");
  const { getTodayValue, isLoading } = useHealthData();
  
  const steps = getTodayValue("steps");
  const progress = Math.min(100, (steps / DAILY_STEP_GOAL) * 100);
  
  // Calculate circumference for circular progress
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="glass-subtle flex items-center gap-3 p-3 rounded-xl">
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
          isLoading && "animate-pulse"
        )}>
          {isLoading ? "—" : steps.toLocaleString()}
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
    </div>
  );
};

export default NotchStepsWidget;
