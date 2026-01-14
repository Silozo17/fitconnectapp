import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CreditsOverviewWidgetProps {
  creditsBought: number;
  creditsSpent: number;
  previousCreditsBought?: number;
  previousCreditsSpent?: number;
  showComparison?: boolean;
  isLoading?: boolean;
}

export function CreditsOverviewWidget({
  creditsBought,
  creditsSpent,
  previousCreditsBought,
  previousCreditsSpent,
  showComparison = false,
  isLoading,
}: CreditsOverviewWidgetProps) {
  const utilization = creditsBought > 0 ? Math.round((creditsSpent / creditsBought) * 100) : 0;
  
  const boughtChange = previousCreditsBought && previousCreditsBought > 0
    ? ((creditsBought - previousCreditsBought) / previousCreditsBought) * 100
    : 0;
  
  const spentChange = previousCreditsSpent && previousCreditsSpent > 0
    ? ((creditsSpent - previousCreditsSpent) / previousCreditsSpent) * 100
    : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Coins className="h-5 w-5" />
          Credits Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse h-12 bg-muted rounded" />
            <div className="animate-pulse h-12 bg-muted rounded" />
            <div className="animate-pulse h-4 bg-muted rounded" />
          </div>
        ) : (
          <>
            {/* Credits Bought */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/20">
                  <ArrowUpRight className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Credits Bought</p>
                  <p className="text-xl font-bold">{creditsBought.toLocaleString()}</p>
                </div>
              </div>
              {showComparison && boughtChange !== 0 && (
                <div className={`text-sm font-medium ${boughtChange > 0 ? 'text-primary' : 'text-destructive'}`}>
                  {boughtChange > 0 ? '+' : ''}{boughtChange.toFixed(1)}%
                </div>
              )}
            </div>

            {/* Credits Spent */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-secondary">
                  <ArrowDownRight className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Credits Used</p>
                  <p className="text-xl font-bold">{creditsSpent.toLocaleString()}</p>
                </div>
              </div>
              {showComparison && spentChange !== 0 && (
                <div className={`text-sm font-medium ${spentChange > 0 ? 'text-primary' : 'text-destructive'}`}>
                  {spentChange > 0 ? '+' : ''}{spentChange.toFixed(1)}%
                </div>
              )}
            </div>

            {/* Utilization */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Utilization Rate</span>
                <span className="font-medium">{utilization}%</span>
              </div>
              <Progress value={utilization} className="h-2" />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
