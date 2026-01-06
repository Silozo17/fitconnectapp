import { Users, DollarSign, TrendingUp, Calendar, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCoachBoostStatus, useBoostAttributions, useBoostSettings, calculateBoostFee, isBoostActive, getBoostRemainingDays } from "@/hooks/useCoachBoost";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { useActivePricing } from "@/hooks/useActivePricing";
import { MetricCard, StatsGrid, DashboardSectionHeader } from "@/components/shared";

export const BoostStatsCard = () => {
  const { t } = useTranslation("coach");
  const { data: boostStatus, isLoading: statusLoading } = useCoachBoostStatus();
  const { data: attributions, isLoading: attributionsLoading } = useBoostAttributions(5);
  const { data: settings } = useBoostSettings();
  const pricing = useActivePricing();

  const isLoading = statusLoading || attributionsLoading;

  if (isLoading) {
    return (
      <StatsGrid columns={{ default: 2, lg: 5 }} gap="default">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </StatsGrid>
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
      {/* Stats Grid */}
      <StatsGrid columns={{ default: 2, lg: 5 }} gap="default">
        <MetricCard
          icon={Clock}
          label={t("boostStats.boostStatus")}
          value={boostActive ? remainingDays : t("boostStats.inactive")}
          unit={boostActive ? t("boostStats.days") : undefined}
          description={boostActive ? t("boostStats.remaining") : t("boostStats.purchaseToActivate")}
          color="primary"
          size="sm"
        />
        <MetricCard
          icon={Users}
          label={t("boostStats.clientsAcquired")}
          value={totalClients}
          description={t("boostStats.viaBoost")}
          color="green"
          size="sm"
        />
        <MetricCard
          icon={DollarSign}
          label={t("boostStats.commissionPaid")}
          value={pricing.formatPrice(totalFees)}
          description={t("boostStats.onNewClients")}
          color="purple"
          size="sm"
        />
        <MetricCard
          icon={TrendingUp}
          label={t("boostStats.estClientValue")}
          value={pricing.formatPrice(estimatedLifetimeValue)}
          description={t("boostStats.fromRepeatVisits")}
          color="cyan"
          size="sm"
        />
        <MetricCard
          icon={TrendingUp}
          label={t("boostStats.roi")}
          value={roi > 0 ? `+${Math.round(roi)}%` : "N/A"}
          description={t("boostStats.returnOnInvestment")}
          color={roi > 0 ? "green" : "primary"}
          size="sm"
        />
      </StatsGrid>

      {/* Recent Acquisitions */}
      <div className="space-y-3">
        <DashboardSectionHeader 
          title={t("boostStats.recentAcquisitions")}
        />
        <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-4">
          {/* Amber/gold accent line for recent acquisitions */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400/60 via-amber-500/40 to-transparent" />
          {attributions && attributions.length > 0 ? (
            <div className="space-y-4">
              {attributions.map((attribution) => {
                const clientName = attribution.client_profiles 
                  ? `${attribution.client_profiles.first_name || ""} ${attribution.client_profiles.last_name?.charAt(0) || ""}.`.trim()
                  : "Client";
                
                return (
                  <div key={attribution.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <UserAvatar 
                        src={attribution.client_profiles?.avatar_url} 
                        name={clientName} 
                        variant="squircle"
                        size="xs"
                      />
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
        </div>
      </div>

      {/* Fee Calculator */}
      {settings && (
        <div className="space-y-4">
          <DashboardSectionHeader 
            title={t("boostStats.feeCalculator")}
            description={t("boostStats.feeDescription", { 
              rate: Math.round(settings.commission_rate * 100),
              minFee: pricing.formatPrice(settings.min_fee * settings.commission_rate),
              minBooking: pricing.formatPrice(settings.min_fee),
              maxFee: pricing.formatPrice(settings.max_fee * settings.commission_rate),
              maxBooking: pricing.formatPrice(settings.max_fee)
            })}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[20, 50, 100, 150].map((amount) => {
              const fee = calculateBoostFee(amount, settings);
              return (
                <div key={amount} className="text-center py-3 px-2">
                  <p className="text-sm text-muted-foreground">{pricing.formatPrice(amount)} {t("boostStats.booking")}</p>
                  <p className="text-lg font-bold text-primary">{pricing.formatPrice(fee)} {t("boostStats.fee")}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
