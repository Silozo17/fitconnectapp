import { Card, CardContent } from "@/components/ui/card";
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

export function AnalyticsWidget({ type, stats }: AnalyticsWidgetProps) {
  const renderContent = () => {
    switch (type) {
      case "analytics_growth_rate":
        const isPositive = (stats.growthRate || 0) >= 0;
        return (
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            )}>
              {isPositive ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <p className={cn(
                "text-2xl font-bold",
                isPositive ? "text-green-500" : "text-red-500"
              )}>
                {isPositive ? "+" : ""}{stats.growthRate || 0}%
              </p>
              <p className="text-sm text-muted-foreground">User Growth (30 days)</p>
            </div>
          </div>
        );

      case "analytics_session_rate":
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-500">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.sessionCompletionRate || 0}%</p>
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
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-500">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.engagementScore || 0}/100</p>
                <p className="text-xs text-muted-foreground">User Engagement Score</p>
              </div>
            </div>
            <Progress value={stats.engagementScore || 0} className="h-2" />
          </div>
        );

      case "analytics_coach_ratio":
        return (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-500">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">{stats.coachClientRatio || "0"}:1</p>
              <p className="text-sm text-muted-foreground">Client to Coach Ratio</p>
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
