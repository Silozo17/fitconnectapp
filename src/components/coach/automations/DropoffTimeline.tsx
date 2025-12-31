import { useTranslation } from "react-i18next";
import { MessageCircle, Bell, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropoffTimelineProps {
  stage1Days: number;
  stage2Days: number;
  stage3Days: number;
  isEnabled: boolean;
}

export function DropoffTimeline({ stage1Days, stage2Days, stage3Days, isEnabled }: DropoffTimelineProps) {
  const { t } = useTranslation("coach");
  
  const stages = [
    {
      day: 0,
      label: t("automations.dropoff.timeline.lastActive", "Last Active"),
      icon: null,
      color: "bg-muted",
      textColor: "text-muted-foreground",
    },
    {
      day: stage1Days,
      label: t("automations.dropoff.timeline.stage1", "Auto-message"),
      icon: MessageCircle,
      color: "bg-primary",
      textColor: "text-primary",
    },
    {
      day: stage2Days,
      label: t("automations.dropoff.timeline.stage2", "Coach alert"),
      icon: Bell,
      color: "bg-warning",
      textColor: "text-warning",
    },
    {
      day: stage3Days,
      label: t("automations.dropoff.timeline.stage3", "Critical"),
      icon: AlertTriangle,
      color: "bg-destructive",
      textColor: "text-destructive",
    },
  ];

  // Calculate relative positions (max day = 100%)
  const maxDay = Math.max(stage3Days, 21); // Minimum scale of 21 days for readability

  return (
    <div className={cn(
      "rounded-lg border p-3 sm:p-4 transition-opacity",
      !isEnabled && "opacity-50"
    )}>
      <p className="text-sm font-medium mb-6 sm:mb-4">
        {t("automations.dropoff.timeline.title", "Rescue Timeline")}
      </p>
      
      {/* Timeline container */}
      <div className="relative h-28 sm:h-24">
        {/* Base line */}
        <div className="absolute top-8 left-4 right-4 sm:left-0 sm:right-0 h-0.5 bg-border" />
        
        {/* Stage markers */}
        {stages.map((stage, index) => {
          const position = (stage.day / maxDay) * 100;
          // Day 0 should be at the very start, other stages clamped to prevent overlap
          const clampedPosition = stage.day === 0 
            ? 2  // Fixed position at the start for Day 0
            : Math.min(Math.max(position, 12), 92);  // Other stages start at 12% to avoid overlapping Day 0
          const Icon = stage.icon;
          
          return (
            <div
              key={index}
              className="absolute flex flex-col items-center w-16 sm:w-auto"
              style={{ left: `${clampedPosition}%`, transform: 'translateX(-50%)' }}
            >
              {/* Dot */}
              <div className={cn(
                "w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-background mt-6",
                stage.color
              )} />
              
              {/* Label below */}
              <div className="mt-2 text-center">
                {Icon && <Icon className={cn("h-3 w-3 mx-auto mb-0.5", stage.textColor)} />}
                <p className={cn("text-[10px] sm:text-xs font-medium leading-tight", stage.textColor)}>
                  {stage.label}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {stage.day === 0 
                    ? t("automations.dropoff.timeline.dayZero", "Day 0")
                    : t("automations.dropoff.timeline.dayN", "Day {{n}}", { n: stage.day })
                  }
                </p>
              </div>
            </div>
          );
        })}
        
        {/* Connecting lines between stages with gradient */}
        <div 
          className="absolute top-8 h-0.5 bg-gradient-to-r from-primary via-warning to-destructive"
          style={{ 
            left: `${Math.max((stage1Days / maxDay) * 100, 8)}%`, 
            right: `${Math.max(100 - (stage3Days / maxDay) * 100, 8)}%`,
          }}
        />
      </div>
    </div>
  );
}
