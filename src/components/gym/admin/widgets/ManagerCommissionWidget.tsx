import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp } from "lucide-react";
import { useManagerCommission } from "@/hooks/gym/useGymDashboardStats";
import { useGym } from "@/contexts/GymContext";
import { Skeleton } from "@/components/ui/skeleton";

export function ManagerCommissionWidget() {
  const { staffRecord, gym } = useGym();
  const { data: commission, isLoading } = useManagerCommission(staffRecord?.id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: gym?.currency || "GBP",
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5" />
          My Commission
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : commission ? (
          <>
            {/* Signups This Month */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/20">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">My Signups (This Month)</p>
                  <p className="text-2xl font-bold">{commission.signupsThisMonth}</p>
                </div>
              </div>
            </div>

            {/* Commission Earned */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-secondary">
                  <TrendingUp className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Commission Earned</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(commission.commissionEarned)}
                  </p>
                </div>
              </div>
            </div>

            {/* Rate */}
            <div className="text-center text-sm text-muted-foreground">
              Commission rate: {commission.commissionRate}%
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No commission data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
