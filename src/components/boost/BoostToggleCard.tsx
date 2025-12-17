import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Rocket, Zap, TrendingUp, Shield } from "lucide-react";
import { useCoachBoostStatus, useToggleBoost, useBoostSettings } from "@/hooks/useCoachBoost";
import { formatCurrency } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";

export const BoostToggleCard = () => {
  const { data: boostStatus, isLoading: statusLoading } = useCoachBoostStatus();
  const { data: settings, isLoading: settingsLoading } = useBoostSettings();
  const toggleBoost = useToggleBoost();

  const isActive = boostStatus?.is_active || false;
  const isLoading = statusLoading || settingsLoading;

  const handleToggle = (checked: boolean) => {
    toggleBoost.mutate(checked);
  };

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 transition-all ${isActive ? "border-primary bg-primary/5" : "border-border"}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isActive ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Boost Your Profile</CardTitle>
              <CardDescription>
                Appear first in search results and get more clients
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isActive && (
              <Badge className="bg-primary text-primary-foreground animate-pulse">
                <Zap className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
            <Switch
              checked={isActive}
              onCheckedChange={handleToggle}
              disabled={toggleBoost.isPending}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isActive ? (
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
            <p className="text-sm text-primary font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              You're appearing at the top of search results!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You'll only be charged when you get new clients from Boost.
            </p>
          </div>
        ) : (
          <div className="rounded-lg bg-muted/50 border border-border p-4">
            <p className="text-sm text-muted-foreground">
              Enable Boost to appear first when clients search for coaches in your area.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-primary/10">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Pay only for results</p>
              <p className="text-xs text-muted-foreground">
                {settings ? `${Math.round(settings.commission_rate * 100)}% of first booking only` : "30% of first booking only"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-primary/10">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">No-show protection</p>
              <p className="text-xs text-muted-foreground">
                No fee if client doesn't show up
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Repeat clients = 100% yours</p>
              <p className="text-xs text-muted-foreground">
                Only pay on their first booking
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-primary/10">
              <Rocket className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Fee range: {settings ? `${formatCurrency(settings.min_fee, "GBP")} - ${formatCurrency(settings.max_fee, "GBP")}` : "£10 - £100"}
              </p>
              <p className="text-xs text-muted-foreground">
                Capped to protect your earnings
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
