import { memo } from "react";
import { TrendingUp, Percent, CreditCard, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface RevenueWidgetProps {
  type: "revenue_mrr" | "revenue_commissions" | "revenue_active_subs" | "revenue_tier_distribution";
  stats: {
    mrr?: number;
    commissionEarnings?: number;
    activeSubscriptions?: number;
    tierDistribution?: Record<string, number>;
  };
}

const TIER_COLORS: Record<string, string> = {
  starter: "hsl(var(--chart-1))",
  pro: "hsl(var(--chart-2))",
  enterprise: "hsl(var(--chart-3))",
  free: "hsl(var(--muted))",
};

const widgetStyles = {
  revenue_mrr: {
    bg: "from-green-500/10 via-background to-green-600/5",
    border: "border-green-500/20",
    accent: "from-green-400/60 via-green-500/40",
    iconBg: "bg-green-500/20",
    iconColor: "text-green-400",
  },
  revenue_commissions: {
    bg: "from-purple-500/10 via-background to-indigo-600/5",
    border: "border-purple-500/20",
    accent: "from-purple-400/60 via-indigo-400/40",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
  },
  revenue_active_subs: {
    bg: "from-blue-500/10 via-background to-blue-600/5",
    border: "border-blue-500/20",
    accent: "from-blue-400/60 via-blue-500/40",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
  },
  revenue_tier_distribution: {
    bg: "from-primary/10 via-background to-primary/5",
    border: "border-primary/20",
    accent: "from-primary/60 via-accent/40",
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
  },
};

export const RevenueWidget = memo(function RevenueWidget({ type, stats }: RevenueWidgetProps) {
  const styles = widgetStyles[type];

  const renderContent = () => {
    switch (type) {
      case "revenue_mrr":
        return (
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl", styles.iconBg)}>
              <TrendingUp className={cn("w-5 h-5", styles.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold text-foreground tracking-tight">£{(stats.mrr || 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Monthly Recurring Revenue</p>
            </div>
          </div>
        );

      case "revenue_commissions":
        return (
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl", styles.iconBg)}>
              <Percent className={cn("w-5 h-5", styles.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold text-foreground tracking-tight">£{(stats.commissionEarnings || 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Platform Commissions (1-4%)</p>
            </div>
          </div>
        );

      case "revenue_active_subs":
        return (
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl", styles.iconBg)}>
              <CreditCard className={cn("w-5 h-5", styles.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold text-foreground tracking-tight">{stats.activeSubscriptions || 0}</p>
              <p className="text-xs text-muted-foreground">Active Subscriptions</p>
            </div>
          </div>
        );

      case "revenue_tier_distribution":
        const pieData = Object.entries(stats.tierDistribution || {}).map(([tier, count]) => ({
          name: tier.charAt(0).toUpperCase() + tier.slice(1),
          value: count,
          color: TIER_COLORS[tier] || TIER_COLORS.free,
        }));

        if (pieData.length === 0) {
          pieData.push({ name: "No Data", value: 1, color: TIER_COLORS.free });
        }

        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={cn("p-2 rounded-xl", styles.iconBg)}>
                <PieChart className={cn("h-4 w-4", styles.iconColor)} />
              </div>
              <span className="font-semibold text-foreground text-base">Tier Distribution</span>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
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
      styles.border,
      type === "revenue_tier_distribution" && "col-span-1 md:col-span-2"
    )}>
      {/* Top accent line */}
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r to-transparent", styles.accent)} />
      {renderContent()}
    </div>
  );
});
