import { useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatsGrid } from "@/components/shared/StatsGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Activity, 
  Heart, 
  Moon, 
  Flame, 
  AlertTriangle,
  Search,
  RefreshCw,
  Loader2,
  TrendingDown,
  Clock
} from "lucide-react";
import { useCoachWearableAggregates } from "@/hooks/useCoachWearableAggregates";
import { ClientWearableRow } from "@/components/coach/ClientWearableRow";
import { WearableAlerts } from "@/components/coach/WearableAlerts";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";
import { FeatureGate } from "@/components/FeatureGate";

const CoachWearableDashboard = () => {
  const { t } = useTranslation("coach");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);

  const {
    clientsWithData,
    aggregates,
    alerts,
    isLoading,
    refetch,
    isRefetching,
  } = useCoachWearableAggregates();

  const filteredClients = clientsWithData.filter((client) => {
    const matchesSearch = 
      !searchQuery ||
      `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (showAlertsOnly) {
      return matchesSearch && alerts.some((a) => a.client_id === client.id);
    }
    return matchesSearch;
  });

  return (
    <DashboardLayout
      title={t("wearableDashboard.title")}
      description={t("wearableDashboard.subtitle")}
    >
      <FeatureGate feature="wearable_dashboard">
      <PageHelpBanner
        pageKey="coach_wearable_dashboard"
        title="Client Wearable Insights"
        description="Monitor health data from your clients' connected devices"
      />

      {/* Stats Cards */}
      <StatsGrid columns={{ default: 2, sm: 3, lg: 5 }} gap="sm" className="mb-6">
        <MetricCard
          icon={Activity}
          label={t("wearableDashboard.avgSteps")}
          value={aggregates.avgSteps?.toLocaleString() || "—"}
          color="primary"
          size="sm"
        />
        <MetricCard
          icon={Heart}
          label={t("wearableDashboard.avgHeartRate")}
          value={aggregates.avgHeartRate || "—"}
          unit="bpm"
          color="red"
          size="sm"
        />
        <MetricCard
          icon={Moon}
          label={t("wearableDashboard.avgSleep")}
          value={aggregates.avgSleep ? `${aggregates.avgSleep}` : "—"}
          unit="h"
          color="purple"
          size="sm"
        />
        <MetricCard
          icon={Flame}
          label={t("wearableDashboard.avgCalories")}
          value={aggregates.avgCalories?.toLocaleString() || "—"}
          color="orange"
          size="sm"
        />
        <MetricCard
          icon={Activity}
          label={t("wearableDashboard.clientsConnected")}
          value={aggregates.connectedClients || 0}
          color="green"
          size="sm"
        />
      </StatsGrid>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <WearableAlerts alerts={alerts} className="mb-6" />
      )}

      {/* Client List */}
      <Card variant="glass" className="glass-card rounded-2xl sm:rounded-3xl">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              {t("wearableDashboard.clientData")}
            </CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("wearableDashboard.searchClients")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={showAlertsOnly ? "default" : "outline"}
                  size="sm"
                  className="flex-1 sm:flex-none"
                  onClick={() => setShowAlertsOnly(!showAlertsOnly)}
                >
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">{t("wearableDashboard.alerts")}</span> ({alerts.length})
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => refetch()}
                  disabled={isRefetching}
                >
                  <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                {searchQuery || showAlertsOnly
                  ? t("wearableDashboard.noMatchingClients")
                  : t("wearableDashboard.noConnectedClients")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredClients.map((client) => (
                <ClientWearableRow
                  key={client.id}
                  client={client}
                  hasAlert={alerts.some((a) => a.client_id === client.id)}
                  alertType={alerts.find((a) => a.client_id === client.id)?.type}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </FeatureGate>
    </DashboardLayout>
  );
};

export default CoachWearableDashboard;
