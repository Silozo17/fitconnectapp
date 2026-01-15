import { useState, useMemo } from "react";
import { Calculator, TrendingUp, Clock, PiggyBank, Users } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ROICalculator() {
  const [members, setMembers] = useState(100);
  const [currentSoftwareCost, setCurrentSoftwareCost] = useState(200);
  const [adminHoursPerWeek, setAdminHoursPerWeek] = useState(10);

  const calculations = useMemo(() => {
    // FitConnect pricing: £99/month base + £1 per member payment
    const fitConnectCost = 99 + members;
    const monthlySavings = currentSoftwareCost - fitConnectCost;
    const annualSavings = monthlySavings * 12;
    
    // Estimate 40% reduction in admin time
    const hoursSavedPerWeek = Math.round(adminHoursPerWeek * 0.4);
    const hoursSavedPerMonth = hoursSavedPerWeek * 4;
    
    // Value of time saved (assuming £25/hour for admin work)
    const timeSavedValue = hoursSavedPerMonth * 25;
    
    // Total monthly benefit
    const totalMonthlyBenefit = Math.max(0, monthlySavings) + timeSavedValue;
    
    // Member retention improvement (estimate 5% improvement)
    const retentionImprovement = Math.round(members * 0.05);
    const avgMemberValue = 50; // £50/month average
    const retentionValue = retentionImprovement * avgMemberValue;

    return {
      fitConnectCost,
      monthlySavings: Math.max(0, monthlySavings),
      annualSavings: Math.max(0, annualSavings),
      hoursSavedPerWeek,
      hoursSavedPerMonth,
      timeSavedValue,
      totalMonthlyBenefit,
      retentionImprovement,
      retentionValue,
    };
  }, [members, currentSoftwareCost, adminHoursPerWeek]);

  return (
    <div className="space-y-8">
      {/* Calculator inputs */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Number of Active Members
            </span>
            <span className="text-2xl font-bold text-primary block mt-1">{members}</span>
          </label>
          <Slider
            value={[members]}
            onValueChange={(v) => setMembers(v[0])}
            min={25}
            max={500}
            step={25}
            className="w-full"
          />
          <span className="text-xs text-muted-foreground">25 - 500 members</span>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-primary" />
              Current Software Cost (£/month)
            </span>
            <span className="text-2xl font-bold text-primary block mt-1">£{currentSoftwareCost}</span>
          </label>
          <Slider
            value={[currentSoftwareCost]}
            onValueChange={(v) => setCurrentSoftwareCost(v[0])}
            min={50}
            max={500}
            step={25}
            className="w-full"
          />
          <span className="text-xs text-muted-foreground">£50 - £500/month</span>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Admin Hours Per Week
            </span>
            <span className="text-2xl font-bold text-primary block mt-1">{adminHoursPerWeek} hrs</span>
          </label>
          <Slider
            value={[adminHoursPerWeek]}
            onValueChange={(v) => setAdminHoursPerWeek(v[0])}
            min={2}
            max={30}
            step={1}
            className="w-full"
          />
          <span className="text-xs text-muted-foreground">2 - 30 hours</span>
        </div>
      </div>

      {/* Results */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">FitConnect Cost</span>
          </div>
          <p className="text-3xl font-bold">£{calculations.fitConnectCost}</p>
          <p className="text-xs text-muted-foreground mt-1">/month</p>
        </Card>

        <Card className={cn(
          "p-6 border-2",
          calculations.monthlySavings > 0 
            ? "bg-emerald-500/5 border-emerald-500/20" 
            : "bg-card border-border"
        )}>
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              calculations.monthlySavings > 0 ? "bg-emerald-500/10" : "bg-primary/10"
            )}>
              <PiggyBank className={cn(
                "w-5 h-5",
                calculations.monthlySavings > 0 ? "text-emerald-500" : "text-primary"
              )} />
            </div>
            <span className="text-sm text-muted-foreground">Monthly Savings</span>
          </div>
          <p className={cn(
            "text-3xl font-bold",
            calculations.monthlySavings > 0 ? "text-emerald-600 dark:text-emerald-400" : ""
          )}>
            £{calculations.monthlySavings}
          </p>
          <p className="text-xs text-muted-foreground mt-1">vs current software</p>
        </Card>

        <Card className="p-6 bg-blue-500/5 border-2 border-blue-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm text-muted-foreground">Time Saved</span>
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {calculations.hoursSavedPerWeek}hrs
          </p>
          <p className="text-xs text-muted-foreground mt-1">per week (worth £{calculations.timeSavedValue}/mo)</p>
        </Card>

        <Card className="p-6 bg-primary/5 border-2 border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Improved Retention</span>
          </div>
          <p className="text-3xl font-bold text-primary">
            +{calculations.retentionImprovement}
          </p>
          <p className="text-xs text-muted-foreground mt-1">members retained (worth £{calculations.retentionValue}/mo)</p>
        </Card>
      </div>

      {/* Total benefit summary */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 text-center">
        <p className="text-muted-foreground mb-2">Estimated Total Monthly Benefit</p>
        <p className="text-5xl font-bold text-primary">
          £{calculations.totalMonthlyBenefit + calculations.retentionValue}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          That's <span className="font-semibold text-primary">£{(calculations.totalMonthlyBenefit + calculations.retentionValue) * 12}</span> per year in savings and growth
        </p>
      </div>
    </div>
  );
}
