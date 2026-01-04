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
      <div className="relative h-40 sm:h-36">
        {/* Base line - centered vertically */}
        <div className="absolute top-1/2 left-4 right-4 sm:left-0 sm:right-0 h-0.5 bg-border -translate-y-1/2" />
        
        {/* Stage markers */}
        {stages.map((stage, index) => {
          const position = (stage.day / maxDay) * 100;
          const clampedPosition = stage.day === 0 
            ? 2
            : Math.min(Math.max(position, 15), 95);
          const Icon = stage.icon;
          const isTop = stage.position === "top";
          
          return (
            <div
              key={index}
              className={cn(
                "absolute flex flex-col items-center w-16 sm:w-auto",
                isTop ? "top-0" : "bottom-0"
              )}
              style={{ left: `${clampedPosition}%`, transform: 'translateX(-50%)' }}
            >
              {isTop ? (
                // Top position: label above, then dot
                <>
                  <div className="text-center mb-2">
                    <Icon className={cn("h-3 w-3 mx-auto mb-0.5", stage.textColor)} />
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
                  <div className={cn(
                    "w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-background",
                    stage.color
                  )} />
                </>
              ) : (
                // Bottom position: dot, then label below
                <>
                  <div className={cn(
                    "w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-background",
                    stage.color
                  )} />
                  <div className="text-center mt-2">
                    <Icon className={cn("h-3 w-3 mx-auto mb-0.5", stage.textColor)} />
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
                </>
              )}
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
