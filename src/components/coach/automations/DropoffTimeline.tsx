import { useTranslation } from "react-i18next";
import { MessageCircle, Bell, AlertTriangle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropoffTimelineProps {
  stage1Days: number;
  stage2Days: number;
  stage3Days: number;
  isEnabled: boolean;
}

export function DropoffTimeline({ stage1Days, stage2Days, stage3Days, isEnabled }: DropoffTimelineProps) {
  const { t } = useTranslation("coach");
  
  // Stages with alternating positions: bottom, top, bottom, top
  const stages = [
    {
      day: 0,
      label: t("automations.dropoff.timeline.lastActive", "Last Active"),
      icon: Circle,
      color: "bg-muted",
      textColor: "text-muted-foreground",
      position: "bottom" as const,
    },
    {
      day: stage1Days,
      label: t("automations.dropoff.timeline.stage1", "Auto-message"),
      icon: MessageCircle,
      color: "bg-primary",
      textColor: "text-primary",
      position: "top" as const,
    },
    {
      day: stage2Days,
      label: t("automations.dropoff.timeline.stage2", "Coach alert"),
      icon: Bell,
      color: "bg-warning",
      textColor: "text-warning",
      position: "bottom" as const,
    },
    {
      day: stage3Days,
      label: t("automations.dropoff.timeline.stage3", "Critical"),
      icon: AlertTriangle,
      color: "bg-destructive",
      textColor: "text-destructive",
      position: "top" as const,
    },
  ];

  // Calculate relative positions (max day = 100%)
  const maxDay = Math.max(stage3Days, 21);

  return (
    <div className={cn(
      "rounded-lg border p-3 sm:p-4 transition-opacity",
      !isEnabled && "opacity-50"
    )}>
      <p className="text-sm font-medium mb-4">
        {t("automations.dropoff.timeline.title", "Rescue Timeline")}
      </p>
      
      {/* Timeline container - taller to accommodate top/bottom labels */}
      <div className="relative h-36 sm:h-32">
        {/* Base line - centered vertically */}
        <div className="absolute top-1/2 left-4 right-4 sm:left-0 sm:right-0 h-0.5 bg-border -translate-y-1/2" />
        
        {/* Stage markers - dots always ON the line, labels above/below */}
        {stages.map((stage, index) => {
          const position = (stage.day / maxDay) * 100;
          const clampedPosition = stage.day === 0 
            ? 4
            : Math.min(Math.max(position, 18), 92);
          const Icon = stage.icon;
          const isTop = stage.position === "top";
          
          return (
            <div
              key={index}
              className="absolute flex flex-col items-center"
              style={{ 
                left: `${clampedPosition}%`, 
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Dot - always centered on line */}
              <div className={cn(
                "w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-background z-10 shrink-0",
                stage.color
              )} />
              
              {/* Label - positioned above or below the dot */}
              <div className={cn(
                "absolute text-center w-16 sm:w-auto",
                isTop ? "bottom-full mb-1.5" : "top-full mt-1.5"
              )}>
                <Icon className={cn("h-3 w-3 mx-auto mb-0.5", stage.textColor)} />
                <p className={cn("text-[10px] sm:text-xs font-medium leading-tight whitespace-nowrap", stage.textColor)}>
                  {stage.label}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
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
          className="absolute top-1/2 h-0.5 bg-gradient-to-r from-primary via-warning to-destructive -translate-y-1/2"
          style={{ 
            left: `${Math.max((stage1Days / maxDay) * 100, 8)}%`, 
            right: `${Math.max(100 - (stage3Days / maxDay) * 100, 8)}%`,
          }}
        />
      </div>
    </div>
  );
}
