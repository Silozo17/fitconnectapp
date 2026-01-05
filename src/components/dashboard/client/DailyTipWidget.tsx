import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AccentCard, AccentCardContent } from "@/components/ui/accent-card";
import { getDailyTip } from "@/lib/daily-tips";
import {
  Utensils,
  Dumbbell,
  Moon,
  Sparkles,
  Target,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const iconMap = {
  utensils: Utensils,
  dumbbell: Dumbbell,
  moon: Moon,
  sparkles: Sparkles,
  target: Target,
} as const;

const categoryColors = {
  nutrition: "text-primary bg-primary/15",
  training: "text-primary bg-primary/15",
  recovery: "text-primary bg-primary/15",
  motivation: "text-primary bg-primary/15",
  habit: "text-primary bg-primary/15",
} as const;

interface DailyTipWidgetProps {
  className?: string;
  context?: {
    goals?: string[];
    activityLevel?: string;
    hasActiveStreak?: boolean;
    streakCount?: number;
  };
}

export function DailyTipWidget({ className, context }: DailyTipWidgetProps) {
  const { t } = useTranslation("dashboard");
  const [isOpen, setIsOpen] = useState(false);

  const tip = useMemo(() => {
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    return getDailyTip({
      ...context,
      hourOfDay: hour,
      dayOfWeek,
    });
  }, [context]);

  const Icon = iconMap[tip.icon] || Lightbulb;
  const colorClass = categoryColors[tip.category] || categoryColors.motivation;

  return (
    <AccentCard className={cn("rounded-2xl", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <AccentCardContent className="p-5 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={cn("p-3 rounded-2xl shrink-0", colorClass)}>
                <Icon className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("client.dailyTip.label", "Tip of the Day")}
                  </span>
                </div>
                <p className="font-semibold text-foreground text-base">
                  {tip.title}
                </p>
                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                  {tip.body}
                </p>
              </div>

              {/* Expand indicator */}
              <ChevronRight
                className={cn(
                  "h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200",
                  isOpen && "rotate-90"
                )}
              />
            </div>
          </AccentCardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-5 pb-5">
            <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {t("client.dailyTip.whyMatters", "Why it matters")}
                  </span>
                  <p className="text-sm text-foreground mt-1 leading-relaxed">
                    {tip.whyMatters}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </AccentCard>
  );
}

export default DailyTipWidget;
