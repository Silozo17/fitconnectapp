import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function RevenueWidget({ type, stats }: RevenueWidgetProps) {
  const renderContent = () => {
    switch (type) {
      case "revenue_mrr":
        return (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-500/10 text-green-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">£{(stats.mrr || 0).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
            </div>
          </div>
        );

      case "revenue_commissions":
        return (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-500">
              <Percent className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">£{(stats.commissionEarnings || 0).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Platform Commissions (15%)</p>
            </div>
          </div>
        );

      case "revenue_active_subs":
        return (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">{stats.activeSubscriptions || 0}</p>
              <p className="text-sm text-muted-foreground">Active Subscriptions</p>
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
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Tier Distribution</span>
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
                      borderRadius: "8px",
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
    <Card className={cn(
      "h-full hover:shadow-lg transition-shadow",
      type === "revenue_tier_distribution" && "col-span-1 md:col-span-2"
    )}>
      <CardContent className="p-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
