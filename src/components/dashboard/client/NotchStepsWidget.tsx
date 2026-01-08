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
  const hasLoadedOnce = !isLoading && data !== undefined;
  
  // Calculate circumference for circular progress
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <button 
      onClick={handleClick} 
      className="w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-primary/20 shadow-lg"
    >
      {/* Circular Progress Ring with glow */}
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
          {/* Background circle */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke="hsl(var(--muted)/0.3)"
            strokeWidth="3"
          />
          {/* Progress circle with glow */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
          />
        </svg>
        {/* Center icon with background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Footprints className="w-3.5 h-3.5 text-primary" />
          </div>
        </div>
      </div>
      
      {/* Steps count and label */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-xl font-bold text-foreground tabular-nums tracking-tight",
          isLoading && !hasLoadedOnce && "animate-pulse"
        )}>
          {isLoading && !hasLoadedOnce ? "—" : steps.toLocaleString()}
        </p>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
          {t("stats.stepsToday", "Steps")}
        </p>
      </div>
      
    </button>
  );
};

export default NotchStepsWidget;
