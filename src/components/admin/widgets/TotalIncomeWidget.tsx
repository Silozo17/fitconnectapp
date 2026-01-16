import { memo } from "react";
import { Wallet, TrendingUp, Building2, Dumbbell, Receipt, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface TotalIncomeWidgetProps {
  stats: {
    totalPlatformIncome?: number;
    coachMRR?: number;
    gymMRR?: number;
    gymMembershipFees?: number;
    commissionEarnings?: number;
  };
}

const INCOME_COLORS = {
  coachMRR: "hsl(var(--chart-1))",
  gymMRR: "hsl(var(--chart-2))",
  gymMembershipFees: "hsl(var(--chart-3))",
  commissionEarnings: "hsl(var(--chart-4))",
};

const INCOME_LABELS = {
  coachMRR: "Coach Subscriptions",
  gymMRR: "Gym Subscriptions",
  gymMembershipFees: "Membership Fees",
  commissionEarnings: "Commissions",
};

const INCOME_ICONS = {
  coachMRR: Dumbbell,
  gymMRR: Building2,
  gymMembershipFees: Receipt,
  commissionEarnings: Percent,
};

export const TotalIncomeWidget = memo(function TotalIncomeWidget({ stats }: TotalIncomeWidgetProps) {
  const { 
    totalPlatformIncome = 0,
    coachMRR = 0,
    gymMRR = 0,
    gymMembershipFees = 0,
    commissionEarnings = 0,
  } = stats;

  const pieData = [
    { name: INCOME_LABELS.coachMRR, value: coachMRR, color: INCOME_COLORS.coachMRR, key: "coachMRR" },
    { name: INCOME_LABELS.gymMRR, value: gymMRR, color: INCOME_COLORS.gymMRR, key: "gymMRR" },
    { name: INCOME_LABELS.gymMembershipFees, value: gymMembershipFees, color: INCOME_COLORS.gymMembershipFees, key: "gymMembershipFees" },
    { name: INCOME_LABELS.commissionEarnings, value: commissionEarnings, color: INCOME_COLORS.commissionEarnings, key: "commissionEarnings" },
  ].filter(item => item.value > 0);

  // If no data, show placeholder
  if (pieData.length === 0) {
    pieData.push({ name: "No Data", value: 1, color: "hsl(var(--muted))", key: "none" });
  }

  const breakdownItems = [
    { key: "coachMRR", label: "Coach Subscriptions", value: coachMRR, icon: Dumbbell, color: "text-chart-1" },
    { key: "gymMRR", label: "Gym Subscriptions", value: gymMRR, icon: Building2, color: "text-chart-2" },
    { key: "gymMembershipFees", label: "Membership Fees (£1/payment)", value: gymMembershipFees, icon: Receipt, color: "text-chart-3" },
    { key: "commissionEarnings", label: "Transaction Commissions", value: commissionEarnings, icon: Percent, color: "text-chart-4" },
  ];

  return (
    <div className={cn(
      "relative bg-gradient-to-br from-primary/10 via-background to-accent/5 rounded-2xl border border-primary/20 overflow-hidden p-5",
      "hover:shadow-lg transition-shadow col-span-1 md:col-span-2 lg:col-span-3"
    )}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-transparent" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - Total and breakdown */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/20">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Platform Income</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-foreground tracking-tight">
                  £{totalPlatformIncome.toLocaleString()}
                </p>
                <span className="text-xs text-muted-foreground">/month</span>
              </div>
            </div>
          </div>

          {/* Breakdown list */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Income Breakdown</p>
            <div className="space-y-2">
              {breakdownItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("w-4 h-4", item.color)} />
                      <span className="text-sm text-foreground">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">£{item.value.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right side - Pie chart */}
        <div className="h-[200px] lg:h-full min-h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`£${value.toLocaleString()}`, ""]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                }}
              />
              <Legend 
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
});
