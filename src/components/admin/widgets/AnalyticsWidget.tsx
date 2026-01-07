import { memo } from "react";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, CheckCircle, Activity, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsWidgetProps {
  type: "analytics_growth_rate" | "analytics_session_rate" | "analytics_engagement" | "analytics_coach_ratio";
  stats: {
    growthRate?: number;
    sessionCompletionRate?: number;
    engagementScore?: number;
    coachClientRatio?: string;
  };
}

const widgetStyles = {
  analytics_growth_rate: {
    bg: "from-green-500/10 via-background to-green-600/5",
    border: "border-green-500/20",
    accent: "from-green-400/60 via-green-500/40",
    iconBg: "bg-green-500/20",
    iconColor: "text-green-400",
  },
  analytics_growth_rate_negative: {
    bg: "from-red-500/10 via-background to-pink-600/5",
    border: "border-red-500/20",
    accent: "from-red-400/60 via-pink-400/40",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
  },
  analytics_session_rate: {
    bg: "from-emerald-500/10 via-background to-emerald-600/5",
    border: "border-emerald-500/20",
    accent: "from-emerald-400/60 via-emerald-500/40",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  analytics_engagement: {
    bg: "from-amber-500/10 via-background to-amber-600/5",
    border: "border-amber-500/20",
    accent: "from-amber-400/60 via-amber-500/40",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
  },
  analytics_coach_ratio: {
    bg: "from-indigo-500/10 via-background to-indigo-600/5",
    border: "border-indigo-500/20",
    accent: "from-indigo-400/60 via-indigo-500/40",
    iconBg: "bg-indigo-500/20",
    iconColor: "text-indigo-400",
  },
};

export const AnalyticsWidget = memo(function AnalyticsWidget({ type, stats }: AnalyticsWidgetProps) {
  const isPositive = (stats.growthRate || 0) >= 0;
  const styles = type === "analytics_growth_rate" && !isPositive 
    ? widgetStyles.analytics_growth_rate_negative 
    : widgetStyles[type];

  const renderContent = () => {
    switch (type) {
      case "analytics_growth_rate":
        return (
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl", styles.iconBg)}>
              {isPositive ? (
                <TrendingUp className={cn("w-5 h-5", styles.iconColor)} />
              ) : (
                <TrendingDown className={cn("w-5 h-5", styles.iconColor)} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-2xl font-bold tracking-tight",
                isPositive ? "text-green-400" : "text-red-400"
              )}>
                {isPositive ? "+" : ""}{stats.growthRate || 0}%
              </p>
              <p className="text-xs text-muted-foreground">User Growth (30 days)</p>
            </div>
          </div>
        );

      case "analytics_session_rate":
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-xl", styles.iconBg)}>
                <CheckCircle className={cn("w-5 h-5", styles.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold text-foreground tracking-tight">{stats.sessionCompletionRate || 0}%</p>
                <p className="text-xs text-muted-foreground">Session Completion Rate</p>
              </div>
            </div>
            <Progress value={stats.sessionCompletionRate || 0} className="h-2" />
          </div>
        );

      case "analytics_engagement":
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-xl", styles.iconBg)}>
                <Activity className={cn("w-5 h-5", styles.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold text-foreground tracking-tight">{stats.engagementScore || 0}/100</p>
                <p className="text-xs text-muted-foreground">User Engagement Score</p>
              </div>
            </div>
            <Progress value={stats.engagementScore || 0} className="h-2" />
          </div>
        );

      case "analytics_coach_ratio":
        return (
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl", styles.iconBg)}>
              <Users className={cn("w-5 h-5", styles.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold text-foreground tracking-tight">{stats.coachClientRatio || "0"}:1</p>
              <p className="text-xs text-muted-foreground">Client to Coach Ratio</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cn(
      "relative bg-gradient-to-br rounded-2xl border overflow-hidden p-4",
      "hover:shadow-lg transition-shadow",
      styles.bg,
      styles.border
    )}>
      {/* Top accent line */}
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r to-transparent", styles.accent)} />
      {renderContent()}
    </div>
  );
});
