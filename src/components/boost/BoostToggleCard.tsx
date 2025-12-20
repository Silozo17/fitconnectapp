import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Zap, TrendingUp, Shield, Clock, CreditCard, Loader2 } from "lucide-react";
import { useCoachBoostStatus, usePurchaseBoost, useBoostSettings, isBoostActive, getBoostRemainingDays } from "@/hooks/useCoachBoost";
import { formatCurrency } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const BoostToggleCard = () => {
  const { data: boostStatus, isLoading: statusLoading } = useCoachBoostStatus();
  const { data: settings, isLoading: settingsLoading } = useBoostSettings();
  const purchaseBoost = usePurchaseBoost();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const isActive = isBoostActive(boostStatus);
  const remainingDays = getBoostRemainingDays(boostStatus);
  const isLoading = statusLoading || settingsLoading;
  const isPending = boostStatus?.payment_status === "pending";

  // Handle payment success/cancel from URL params
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      toast.success("Boost activated successfully! You'll now appear first in search results.");
      queryClient.invalidateQueries({ queryKey: ["coach-boost-status"] });
      setSearchParams({});
    } else if (paymentStatus === "cancelled") {
      toast.info("Boost purchase was cancelled");
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, queryClient]);

  const handlePurchase = () => {
    purchaseBoost.mutate();
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

  const boostPrice = settings?.boost_price ? settings.boost_price / 100 : 5;
  const boostDuration = settings?.boost_duration_days || 30;

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
            {isPending && (
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                Payment Pending
              </Badge>
            )}
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
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {remainingDays} day{remainingDays !== 1 ? "s" : ""} remaining
              {boostStatus?.boost_end_date && (
                <span className="ml-1">
                  (expires {new Date(boostStatus.boost_end_date).toLocaleDateString()})
                </span>
              )}
            </p>
          </div>
        ) : (
          <div className="rounded-lg bg-muted/50 border border-border p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm font-medium">
                  Activate Boost for {formatCurrency(boostPrice, "GBP")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {boostDuration}-day visibility boost. Appear first in search results.
                </p>
              </div>
              <Button 
                onClick={handlePurchase}
                disabled={purchaseBoost.isPending || isPending}
                className="gap-2"
              >
                {purchaseBoost.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Purchase Boost
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-primary/10">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{formatCurrency(boostPrice, "GBP")} for {boostDuration} days</p>
              <p className="text-xs text-muted-foreground">
                One-time payment, no auto-renewal
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-primary/10">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Plus {settings ? `${Math.round(settings.commission_rate * 100)}%` : "30%"} on new clients</p>
              <p className="text-xs text-muted-foreground">
                Only on their first booking
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
                Commission only on first booking
              </p>
            </div>
          </div>
        </div>

        {isActive && remainingDays <= 5 && remainingDays > 0 && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
            <p className="text-sm text-amber-600 font-medium">
              Your Boost expires soon! Renew to maintain your visibility.
            </p>
            <Button 
              onClick={handlePurchase}
              disabled={purchaseBoost.isPending}
              variant="outline"
              size="sm"
              className="mt-2 gap-2"
            >
              {purchaseBoost.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              Renew Boost
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
