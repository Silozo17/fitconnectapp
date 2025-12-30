import { Crown, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientLTV, LTVTier } from "@/hooks/useClientLTV";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const tierConfig: Record<LTVTier, { color: string; bgColor: string; label: string }> = {
  high: { color: "text-amber-500", bgColor: "bg-amber-500/10", label: "High Value" },
  medium: { color: "text-primary", bgColor: "bg-primary/10", label: "Medium" },
  low: { color: "text-muted-foreground", bgColor: "bg-muted", label: "Growing" },
};

function formatCurrency(amount: number, compact = false): string {
  if (compact && amount >= 1000) {
    return `£${(amount / 1000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ClientLTVWidget() {
  const { data, isLoading } = useClientLTV();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            Client Lifetime Value
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            Client Lifetime Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No client data available yet
          </p>
        </CardContent>
      </Card>
    );
  }

  const { totalHistoricalLTV, totalProjectedLTV, avgClientLTV, topClients, ltvDistribution } = data;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            Client Lifetime Value
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Total LTV</p>
            <p className="text-xl font-bold">{formatCurrency(totalHistoricalLTV, true)}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="text-xs text-success">
                +{formatCurrency(totalProjectedLTV - totalHistoricalLTV, true)} projected
              </span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Avg per Client</p>
            <p className="text-xl font-bold">{formatCurrency(avgClientLTV)}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              {ltvDistribution.high + ltvDistribution.medium + ltvDistribution.low} clients
            </div>
          </div>
        </div>

        {/* LTV Distribution */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden flex">
            {ltvDistribution.high > 0 && (
              <div 
                className="bg-amber-500 h-full" 
                style={{ width: `${(ltvDistribution.high / (ltvDistribution.high + ltvDistribution.medium + ltvDistribution.low)) * 100}%` }}
              />
            )}
            {ltvDistribution.medium > 0 && (
              <div 
                className="bg-primary h-full" 
                style={{ width: `${(ltvDistribution.medium / (ltvDistribution.high + ltvDistribution.medium + ltvDistribution.low)) * 100}%` }}
              />
            )}
            {ltvDistribution.low > 0 && (
              <div 
                className="bg-muted-foreground/30 h-full" 
                style={{ width: `${(ltvDistribution.low / (ltvDistribution.high + ltvDistribution.medium + ltvDistribution.low)) * 100}%` }}
              />
            )}
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-1 text-[10px] sm:text-xs text-muted-foreground">
          <span className="whitespace-nowrap">{ltvDistribution.high} <span className="hidden sm:inline">high value</span><span className="sm:hidden">high</span></span>
          <span className="whitespace-nowrap">{ltvDistribution.medium} <span className="hidden sm:inline">medium</span><span className="sm:hidden">med</span></span>
          <span className="whitespace-nowrap">{ltvDistribution.low} <span className="hidden sm:inline">growing</span><span className="sm:hidden">grow</span></span>
        </div>

        {/* Top Clients */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Top Clients</p>
          {topClients.slice(0, 3).map((client, index) => {
            const tier = tierConfig[client.ltvTier];
            return (
              <div
                key={client.clientId}
                className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/dashboard/clients/${client.clientId}`)}
              >
                <span className="text-xs font-medium text-muted-foreground w-4 flex-shrink-0">
                  #{index + 1}
                </span>
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                  <AvatarImage src={client.avatarUrl || undefined} alt={client.clientName} />
                  <AvatarFallback className="text-xs">
                    {client.clientName.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <span className="text-xs sm:text-sm font-medium truncate block">{client.clientName}</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    {client.monthsAsClient}mo
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs sm:text-sm font-bold block">{formatCurrency(client.projectedLTV)}</span>
                  <Badge variant="outline" className={cn("text-[10px] sm:text-xs hidden sm:inline-flex", tier.color, tier.bgColor)}>
                    {tier.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
