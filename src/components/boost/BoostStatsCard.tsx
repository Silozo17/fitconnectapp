import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Calendar, Clock } from "lucide-react";
import { useCoachBoostStatus, useBoostAttributions, useBoostSettings, calculateBoostFee, isBoostActive, getBoostRemainingDays } from "@/hooks/useCoachBoost";
import { formatCurrency } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Badge } from "@/components/ui/badge";

export const BoostStatsCard = () => {
  const { data: boostStatus, isLoading: statusLoading } = useCoachBoostStatus();
  const { data: attributions, isLoading: attributionsLoading } = useBoostAttributions(5);
  const { data: settings } = useBoostSettings();

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
              Boost Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {boostActive ? (
              <>
                <p className="text-2xl font-bold text-primary">{remainingDays} days</p>
                <p className="text-xs text-muted-foreground">remaining</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-muted-foreground">Inactive</p>
                <p className="text-xs text-muted-foreground">Purchase to activate</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clients Acquired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalClients}</p>
            <p className="text-xs text-muted-foreground">via Boost</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Commission Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalFees, "GBP")}</p>
            <p className="text-xs text-muted-foreground">on new clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Est. Client Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(estimatedLifetimeValue, "GBP")}</p>
            <p className="text-xs text-muted-foreground">from repeat visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${roi > 0 ? "text-green-500" : "text-muted-foreground"}`}>
              {roi > 0 ? `+${Math.round(roi)}%` : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">return on investment</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Acquisitions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Acquisitions</CardTitle>
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
                          ? formatCurrency(attribution.booking_amount, "GBP") 
                          : "Pending booking"}
                      </p>
                      {attribution.fee_amount && (
                        <Badge 
                          variant={attribution.fee_status === "charged" ? "secondary" : attribution.fee_status === "waived" ? "outline" : "default"}
                          className="text-xs"
                        >
                          Fee: {formatCurrency(attribution.fee_amount, "GBP")}
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
              No clients acquired via Boost yet. Purchase Boost for £5 to start appearing first in search results for 30 days!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Fee Calculator */}
      {settings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fee Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Fee is {Math.round(settings.commission_rate * 100)}% of booking value. 
              Minimum fee: {formatCurrency(settings.min_fee * settings.commission_rate, "GBP")} (on bookings under {formatCurrency(settings.min_fee, "GBP")}). 
              Maximum fee: {formatCurrency(settings.max_fee * settings.commission_rate, "GBP")} (on bookings over {formatCurrency(settings.max_fee, "GBP")}).
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[20, 50, 100, 150].map((amount) => {
                const fee = calculateBoostFee(amount, settings);
                return (
                  <div key={amount} className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground">{formatCurrency(amount, "GBP")} booking</p>
                    <p className="text-lg font-bold text-primary">{formatCurrency(fee, "GBP")} fee</p>
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
