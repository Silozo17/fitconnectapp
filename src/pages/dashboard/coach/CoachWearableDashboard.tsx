import { useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-6">
        <Card variant="glass" className="glass-card rounded-xl sm:rounded-2xl">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <p className="text-base sm:text-xl font-bold">{aggregates.avgSteps?.toLocaleString() || "—"}</p>
                <p className="text-xs text-muted-foreground">{t("wearableDashboard.avgSteps")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass" className="glass-card rounded-xl sm:rounded-2xl">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-rose-500/10 flex items-center justify-center">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />
              </div>
              <div>
                <p className="text-base sm:text-xl font-bold">{aggregates.avgHeartRate || "—"}</p>
                <p className="text-xs text-muted-foreground">{t("wearableDashboard.avgHeartRate")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass" className="glass-card rounded-xl sm:rounded-2xl">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
              </div>
              <div>
                <p className="text-base sm:text-xl font-bold">{aggregates.avgSleep ? `${aggregates.avgSleep}h` : "—"}</p>
                <p className="text-xs text-muted-foreground">{t("wearableDashboard.avgSleep")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass" className="glass-card rounded-xl sm:rounded-2xl">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-base sm:text-xl font-bold">{aggregates.avgCalories?.toLocaleString() || "—"}</p>
                <p className="text-xs text-muted-foreground">{t("wearableDashboard.avgCalories")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass" className="glass-card rounded-xl sm:rounded-2xl col-span-2 sm:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-success/10 flex items-center justify-center">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
              </div>
              <div>
                <p className="text-base sm:text-xl font-bold">{aggregates.connectedClients || 0}</p>
                <p className="text-xs text-muted-foreground">{t("wearableDashboard.clientsConnected")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
