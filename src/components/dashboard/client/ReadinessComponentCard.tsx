import { memo } from "react";
import { useReadinessScore } from "@/hooks/useReadinessScore";
import { Moon, Heart, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";
import { ContentSection, ContentSectionColor } from "@/components/shared/ContentSection";
import { IconBadge, IconBadgeColor } from "@/components/shared/IconBadge";

type ComponentType = "sleep" | "recovery" | "activity";

interface ReadinessComponentCardProps {
  type: ComponentType;
  className?: string;
}

const componentConfig: Record<ComponentType, {
  icon: typeof Moon;
  label: string;
  colorTheme: ContentSectionColor;
  iconColor: IconBadgeColor;
}> = {
  sleep: {
    icon: Moon,
    label: "Sleep",
    colorTheme: "purple",
    iconColor: "purple",
  },
  recovery: {
    icon: Heart,
    label: "Recovery",
    colorTheme: "red",
    iconColor: "red",
  },
  activity: {
    icon: Activity,
    label: "Activity",
    colorTheme: "green",
    iconColor: "green",
  },
};

export const ReadinessComponentCard = memo(function ReadinessComponentCard({ type, className }: ReadinessComponentCardProps) {
  const { readiness, isLoading, hasData } = useReadinessScore();
  const config = componentConfig[type];
  const Icon = config.icon;

  if (isLoading) {
    return (
      <ContentSection colorTheme={config.colorTheme} padding="sm" className={cn("rounded-2xl", className)}>
        <ShimmerSkeleton className="h-9 w-9 rounded-xl mb-3" />
        <ShimmerSkeleton className="h-3 w-12 mb-1" />
        <ShimmerSkeleton className="h-5 w-16" />
      </ContentSection>
    );
  }

  if (!hasData || !readiness) {
    return null;
  }

  const component = readiness.components[type];

  return (
    <ContentSection colorTheme={config.colorTheme} padding="sm" className={cn("rounded-2xl", className)}>
      <IconBadge icon={Icon} color={config.iconColor} size="sm" />

      <div className="mt-3">
        <div className="text-xs text-muted-foreground capitalize mb-0.5">
          {config.label}
        </div>
        <div className="font-semibold text-foreground text-lg">
          {component.value !== null
            ? `${component.value}${component.unit}`
            : "—"}
        </div>
      </div>
    </ContentSection>
  );
});

export default ReadinessComponentCard;
