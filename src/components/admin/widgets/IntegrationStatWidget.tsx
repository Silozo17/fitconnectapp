import { Card, CardContent } from "@/components/ui/card";
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
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    key: "video" as const,
  },
  integration_calendar: {
    icon: Calendar,
    title: "Calendar Sync",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    key: "calendar" as const,
  },
  integration_wearables: {
    icon: Watch,
    title: "Wearables",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    key: "wearables" as const,
  },
  integration_grocery: {
    icon: ShoppingCart,
    title: "Grocery Lists",
    color: "text-green-500",
    bg: "bg-green-500/10",
    key: "grocery" as const,
  },
};

export function IntegrationStatWidget({ type, stats }: IntegrationStatWidgetProps) {
  const config = integrationConfig[type];
  const Icon = config.icon;
  const data = stats[config.key] || { total: 0, active: 0, providers: [] };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", config.bg)}>
            <Icon className={cn("w-6 h-6", config.color)} />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold">{data.total}</p>
            <p className="text-sm text-muted-foreground">{config.title}</p>
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
      </CardContent>
    </Card>
  );
}
