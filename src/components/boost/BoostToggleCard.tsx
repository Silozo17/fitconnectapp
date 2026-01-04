import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Zap, TrendingUp, Shield, Clock, CreditCard, Loader2, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCoachBoostStatus, usePurchaseBoost, useBoostSettings, isBoostActive, getBoostRemainingDays, useResetPendingBoost } from "@/hooks/useCoachBoost";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useActivePricing } from "@/hooks/useActivePricing";
import { useNativePricing } from "@/hooks/useNativePricing";
import { useNativeBoostPurchase } from "@/hooks/useNativeBoostPurchase";
import { isDespia } from "@/lib/despia";
import { IAPUnsuccessfulDialog } from "@/components/iap/IAPUnsuccessfulDialog";
import { LegalDisclosure } from "@/components/shared/LegalLinks";

export const BoostToggleCard = () => {
  const { t } = useTranslation("coach");
  const { data: boostStatus, isLoading: statusLoading, refetch: refetchStatus, isRefetching } = useCoachBoostStatus();
  const { data: settings, isLoading: settingsLoading } = useBoostSettings();
  const pricing = useActivePricing();
  const nativePricing = useNativePricing();
  const purchaseBoost = usePurchaseBoost(pricing.country);
  const nativeBoost = useNativeBoostPurchase();
  const resetPendingBoost = useResetPendingBoost();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const isNative = isDespia();
  const isActive = isBoostActive(boostStatus);
  const remainingDays = getBoostRemainingDays(boostStatus);
  const isLoading = statusLoading || settingsLoading;
  const isPending = boostStatus?.payment_status === "pending";
  const isMigratedFree = boostStatus?.payment_status === "migrated_free";
  
  // Check if pending is stale (>30 min old) - allow retry
  const pendingIsStale = useMemo(() => {
    if (!isPending || !boostStatus?.updated_at) return false;
    const updatedAt = new Date(boostStatus.updated_at);
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    return updatedAt < thirtyMinutesAgo;
  }, [isPending, boostStatus?.updated_at]);
  
  // Use native pricing on native devices, web pricing otherwise
  const boostPrice = isNative ? nativePricing.prices.boost : pricing.prices.boost;
  const formattedBoostPrice = isNative 
    ? nativePricing.formatPrice(nativePricing.prices.boost) 
    : pricing.formatPrice(boostPrice);
  const boostDuration = settings?.boost_duration_days || 30;

  // Combined purchasing state
  const isPurchasing = isNative 
    ? (nativeBoost.state.purchaseStatus === 'purchasing' || nativeBoost.state.isPolling)
    : purchaseBoost.isPending;

  // Manual refresh handler for native users
  const handleManualRefresh = async () => {
    // Reset reconciliation flag and force re-check
    await nativeBoost.reconcileBoostEntitlement();
    refetchStatus();
  };

  // Auto-reset stale pending boost on mount
  useEffect(() => {
    if (pendingIsStale) {
      console.log('[BoostToggleCard] Auto-resetting stale pending boost');
      resetPendingBoost.mutate();
    }
  }, [pendingIsStale, resetPendingBoost]);

  // Handle payment success/cancel from URL params (web only)
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      toast.success(t("boostCard.activatedSuccess"));
      queryClient.invalidateQueries({ queryKey: ["coach-boost-status"] });
      setSearchParams({});
    } else if (paymentStatus === "cancelled") {
      toast.info(t("boostCard.purchaseCancelled"));
      // Reset pending status so user can try again
      resetPendingBoost.mutate();
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, queryClient, t, resetPendingBoost]);

  const handlePurchase = () => {
    if (isNative) {
      // Native IAP flow - opens immediately
      nativeBoost.purchase();
    } else {
      // Web Stripe checkout flow
      purchaseBoost.mutate();
    }
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
    <>
      <Card className={`border-2 transition-all ${isActive ? "border-primary bg-primary/5" : "border-border"}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isActive ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">{t("boostCard.title")}</CardTitle>
                <CardDescription>
                  {t("boostCard.subtitle")}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isActive && (
                <Badge className="bg-primary text-primary-foreground">
                  <Zap className="h-3 w-3 mr-1" />
                  {t("boostCard.active")}
                </Badge>
              )}
              {isPending && (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  {t("boostCard.paymentPending")}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isActive ? (
            <div className="space-y-3">
              {isMigratedFree && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                    🎁 {t("boostCard.freeExtension")}
                  </p>
                <p className="text-xs text-muted-foreground mt-1">
                    {t("boostCard.earlyAdopterMessage", { price: formattedBoostPrice, days: boostDuration })}
                  </p>
                </div>
              )}
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
                <p className="text-sm text-primary font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t("boostCard.appearingAtTop")}
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {remainingDays} {t("boostCard.daysRemaining")}
                  {boostStatus?.boost_end_date && (
                    <span className="ml-1">
                      ({t("boostCard.expires")} {new Date(boostStatus.boost_end_date).toLocaleDateString()})
                    </span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Show manual reset for stuck pending state */}
              {isPending && !pendingIsStale && !isPurchasing && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                    Payment pending from previous attempt
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 gap-2"
                    onClick={() => resetPendingBoost.mutate()}
                    disabled={resetPendingBoost.isPending}
                  >
                    {resetPendingBoost.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Reset & Try Again
                  </Button>
                </div>
              )}
              <div className="rounded-lg bg-muted/50 border border-border p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-sm font-medium">
                      {t("boostCard.activateFor", { price: formattedBoostPrice })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("boostCard.visibilityBoost", { days: boostDuration })}
                    </p>
                  </div>
                  <Button 
                    onClick={handlePurchase}
                    disabled={isPurchasing || (isPending && !pendingIsStale)}
                    className="gap-2 min-h-[44px]"
                  >
                    {isPurchasing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("boostCard.processing")}
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        {t("boostCard.purchaseBoost")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {/* Refresh Status button for native users when purchase completed but status not updated */}
              {isNative && !isPurchasing && nativeBoost.state.purchaseStatus === 'success' && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManualRefresh}
                    disabled={isRefetching}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                    {isRefetching ? 'Refreshing...' : 'Refresh Status'}
                  </Button>
                </div>
              )}
              <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{t("boostCard.whatYouPay")}:</span> {formattedBoostPrice} {t("boostCard.activation")} + {settings ? `${Math.round(settings.commission_rate * 100)}%` : "30%"} {t("boostCard.ofFirstBooking")}.
                  {t("boostCard.afterDays", { days: boostDuration })}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-primary/10">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{t("boostCard.priceForDays", { price: formattedBoostPrice, days: boostDuration })}</p>
                <p className="text-xs text-muted-foreground">
                  {t("boostCard.oneTimePayment")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{t("boostCard.plusCommission", { rate: settings ? Math.round(settings.commission_rate * 100) : 30 })}</p>
                <p className="text-xs text-muted-foreground">
                  {t("boostCard.onlyFirstBooking")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{t("boostCard.noShowProtection")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("boostCard.noFeeIfNoShow")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{t("boostCard.repeatClients")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("boostCard.commissionOnlyFirst")}
                </p>
              </div>
            </div>
          </div>

          {/* Legal disclosure - required for iOS App Store compliance */}
          <LegalDisclosure className="mt-4 pt-4 border-t" />

          {isActive && remainingDays <= 5 && remainingDays > 0 && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
              <p className="text-sm text-amber-600 font-medium">
                {t("boostCard.expiresSoon")}
              </p>
              <Button 
                onClick={handlePurchase}
                disabled={isPurchasing}
                variant="outline"
                size="sm"
                className="mt-2 gap-2 min-h-[44px]"
              >
                {isPurchasing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                {t("boostCard.renewBoost")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* IAP Unsuccessful Dialog for native purchases */}
      <IAPUnsuccessfulDialog
        open={nativeBoost.state.showUnsuccessfulModal}
        onOpenChange={nativeBoost.dismissUnsuccessfulModal}
      />
    </>
  );
};
