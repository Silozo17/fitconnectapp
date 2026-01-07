import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Video, Calendar, Watch, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntegrationStat {
  total: number;
  active: number;
  providers: string[];
}

interface IntegrationStatWidgetProps {
  type: "integration_video" | "integration_calendar" | "integration_wearables" | "integration_grocery";
  stats: {
    video?: IntegrationStat;
    calendar?: IntegrationStat;
    wearables?: IntegrationStat;
    grocery?: IntegrationStat;
  };
}

const integrationConfig = {
  integration_video: {
    icon: Video,
    title: "Video Conferencing",
    key: "video" as const,
    styles: {
      bg: "from-blue-500/10 via-background to-blue-600/5",
      border: "border-blue-500/20",
      accent: "from-blue-400/60 via-blue-500/40",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
    },
  },
  integration_calendar: {
    icon: Calendar,
    title: "Calendar Sync",
    key: "calendar" as const,
    styles: {
      bg: "from-purple-500/10 via-background to-indigo-600/5",
      border: "border-purple-500/20",
      accent: "from-purple-400/60 via-indigo-400/40",
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-400",
    },
  },
  integration_wearables: {
    icon: Watch,
    title: "Wearables",
    key: "wearables" as const,
    styles: {
      bg: "from-orange-500/10 via-background to-orange-600/5",
      border: "border-orange-500/20",
      accent: "from-orange-400/60 via-orange-500/40",
      iconBg: "bg-orange-500/20",
      iconColor: "text-orange-400",
    },
  },
  integration_grocery: {
    icon: ShoppingCart,
    title: "Grocery Lists",
    key: "grocery" as const,
    styles: {
      bg: "from-green-500/10 via-background to-green-600/5",
      border: "border-green-500/20",
      accent: "from-green-400/60 via-green-500/40",
      iconBg: "bg-green-500/20",
      iconColor: "text-green-400",
    },
  },
};

export const IntegrationStatWidget = memo(function IntegrationStatWidget({ type, stats }: IntegrationStatWidgetProps) {
  const config = integrationConfig[type];
  const Icon = config.icon;
  const data = stats[config.key] || { total: 0, active: 0, providers: [] };
  const { styles } = config;

  return (
    <div className={cn(
      "relative bg-gradient-to-br rounded-2xl border overflow-hidden p-4",
      "hover:shadow-lg transition-shadow",
      styles.bg,
      styles.border
    )}>
      {/* Top accent line */}
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r to-transparent", styles.accent)} />
      
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-xl", styles.iconBg)}>
          <Icon className={cn("w-5 h-5", styles.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold text-foreground tracking-tight">{data.total}</p>
          <p className="text-xs text-muted-foreground">{config.title}</p>
        </div>
      </div>
      
      {data.providers.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {data.providers.slice(0, 3).map((provider) => (
            <Badge key={provider} variant="outline" className="text-xs">
              {provider}
            </Badge>
          ))}
          {data.providers.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{data.providers.length - 3}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
});
