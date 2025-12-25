import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Calendar, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCoachBoostStatus, useBoostAttributions, useBoostSettings, calculateBoostFee, isBoostActive, getBoostRemainingDays } from "@/hooks/useCoachBoost";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { useActivePricing } from "@/hooks/useActivePricing";

export const BoostStatsCard = () => {
  const { t } = useTranslation("coach");
  const { data: boostStatus, isLoading: statusLoading } = useCoachBoostStatus();
  const { data: attributions, isLoading: attributionsLoading } = useBoostAttributions(5);
  const { data: settings } = useBoostSettings();
  const pricing = useActivePricing();

  const isLoading = statusLoading || attributionsLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalClients = boostStatus?.total_clients_acquired || 0;
  const totalFees = boostStatus?.total_fees_paid || 0;
  const boostActive = isBoostActive(boostStatus);
  const remainingDays = getBoostRemainingDays(boostStatus);
  
  // Calculate estimated value (assuming average 3 repeat bookings per client)
  const avgBookingValue = attributions && attributions.length > 0 
    ? attributions.reduce((sum, a) => sum + (a.booking_amount || 0), 0) / attributions.length
    : 50;
  const estimatedLifetimeValue = totalClients * avgBookingValue * 3; // 3 average repeat visits
  const roi = totalFees > 0 ? ((estimatedLifetimeValue - totalFees) / totalFees * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Boost Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t("boostStats.boostStatus")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {boostActive ? (
              <>
                <p className="text-2xl font-bold text-primary">{remainingDays} {t("boostStats.days")}</p>
                <p className="text-xs text-muted-foreground">{t("boostStats.remaining")}</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-muted-foreground">{t("boostStats.inactive")}</p>
                <p className="text-xs text-muted-foreground">{t("boostStats.purchaseToActivate")}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t("boostStats.clientsAcquired")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalClients}</p>
            <p className="text-xs text-muted-foreground">{t("boostStats.viaBoost")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t("boostStats.commissionPaid")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pricing.formatPrice(totalFees)}</p>
            <p className="text-xs text-muted-foreground">{t("boostStats.onNewClients")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t("boostStats.estClientValue")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pricing.formatPrice(estimatedLifetimeValue)}</p>
            <p className="text-xs text-muted-foreground">{t("boostStats.fromRepeatVisits")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t("boostStats.roi")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${roi > 0 ? "text-green-500" : "text-muted-foreground"}`}>
              {roi > 0 ? `+${Math.round(roi)}%` : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">{t("boostStats.returnOnInvestment")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Acquisitions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("boostStats.recentAcquisitions")}</CardTitle>
        </CardHeader>
        <CardContent>
          {attributions && attributions.length > 0 ? (
            <div className="space-y-4">
              {attributions.map((attribution) => {
                const clientName = attribution.client_profiles 
                  ? `${attribution.client_profiles.first_name || ""} ${attribution.client_profiles.last_name?.charAt(0) || ""}.`.trim()
                  : "Client";
                
                return (
                  <div key={attribution.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="pt-3">
                        <UserAvatar 
                          src={attribution.client_profiles?.avatar_url} 
                          name={clientName} 
                          variant="squircle"
                          size="xs"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{clientName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(attribution.attributed_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {attribution.booking_amount 
                          ? pricing.formatPrice(attribution.booking_amount) 
                          : t("boostStats.pendingBooking")}
                      </p>
                      {attribution.fee_amount && (
                        <Badge 
                          variant={attribution.fee_status === "charged" ? "secondary" : attribution.fee_status === "waived" ? "outline" : "default"}
                          className="text-xs"
                        >
                          Fee: {pricing.formatPrice(attribution.fee_amount)}
                          {attribution.fee_status === "waived" && " (waived)"}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {t("boostStats.noClientsYet", { price: pricing.formatPrice(pricing.prices.boost) })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Fee Calculator */}
      {settings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("boostStats.feeCalculator")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t("boostStats.feeDescription", { 
                rate: Math.round(settings.commission_rate * 100),
                minFee: pricing.formatPrice(settings.min_fee * settings.commission_rate),
                minBooking: pricing.formatPrice(settings.min_fee),
                maxFee: pricing.formatPrice(settings.max_fee * settings.commission_rate),
                maxBooking: pricing.formatPrice(settings.max_fee)
              })}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[20, 50, 100, 150].map((amount) => {
                const fee = calculateBoostFee(amount, settings);
                return (
                  <div key={amount} className="p-3 rounded-lg glass-item text-center">
                    <p className="text-sm text-muted-foreground">{pricing.formatPrice(amount)} {t("boostStats.booking")}</p>
                    <p className="text-lg font-bold text-primary">{pricing.formatPrice(fee)} {t("boostStats.fee")}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};