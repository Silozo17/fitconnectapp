import { Card, CardContent } from "@/components/ui/card";
import { Users, Dumbbell, Calendar, DollarSign, TrendingUp, TrendingDown, MessageSquare, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatWidgetProps {
  type: string;
  title: string;
  value: number | string;
  change?: number;
  size?: "small" | "medium" | "large";
}

const iconMap: Record<string, React.ComponentType<any>> = {
  stats_users: Users,
  stats_coaches: Dumbbell,
  stats_sessions: Calendar,
  stats_revenue: DollarSign,
  stats_messages: MessageSquare,
  stats_reviews: Star,
};

const colorMap: Record<string, string> = {
  stats_users: "text-blue-500 bg-blue-500/10",
  stats_coaches: "text-orange-500 bg-orange-500/10",
  stats_sessions: "text-green-500 bg-green-500/10",
  stats_revenue: "text-primary bg-primary/10",
  stats_messages: "text-purple-500 bg-purple-500/10",
  stats_reviews: "text-amber-500 bg-amber-500/10",
};

export function StatWidget({ type, title, value, change, size = "small" }: StatWidgetProps) {
  const Icon = iconMap[type] || Users;
  const colorClass = colorMap[type] || "text-primary bg-primary/10";

  return (
    <Card className={cn(
      "hover:shadow-lg transition-shadow",
      size === "large" && "col-span-2"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colorClass)}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold">
              {type === "stats_revenue" && typeof value === "number" ? `£${value.toLocaleString()}` : value}
            </p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              change >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
