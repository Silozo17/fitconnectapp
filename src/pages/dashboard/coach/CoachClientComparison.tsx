import { useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users2, 
  TrendingUp, 
  Scale, 
  Percent,
  Calendar,
  Loader2,
  Download
} from "lucide-react";
import { useClientComparison } from "@/hooks/useClientComparison";
import { ClientComparisonSelector } from "@/components/coach/ClientComparisonSelector";
import { ComparisonCharts } from "@/components/coach/ComparisonCharts";
import { ComparisonTable } from "@/components/coach/ComparisonTable";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { subMonths } from "date-fns";

const CoachClientComparison = () => {
  const { t } = useTranslation("coach");
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });

  const {
    comparisonData,
    isLoading,
    availableClients,
  } = useClientComparison(selectedClientIds, dateRange);

  const handleClientToggle = (clientId: string) => {
    setSelectedClientIds((prev) => {
      if (prev.includes(clientId)) {
        return prev.filter((id) => id !== clientId);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, clientId];
    });
  };

  const handleClearSelection = () => {
    setSelectedClientIds([]);
  };

  return (
    <DashboardLayout
      title={t("clientComparison.title")}
      description={t("clientComparison.subtitle")}
    >
      <PageHelpBanner
        pageKey="coach_client_comparison"
        title="Compare Client Progress"
        description="Analyze and compare progress across multiple clients side by side"
      />

      {/* Selection & Filters */}
      <Card variant="glass" className="glass-card rounded-3xl mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users2 className="w-5 h-5 text-primary" />
              {t("clientComparison.selectClients")}
            </CardTitle>
            <div className="flex items-center gap-2">
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
              {selectedClientIds.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleClearSelection}>
                  {t("clientComparison.clearSelection")}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ClientComparisonSelector
            clients={availableClients}
            selectedIds={selectedClientIds}
            onToggle={handleClientToggle}
            maxSelection={4}
          />
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {selectedClientIds.length >= 2 ? (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Charts */}
              <Card variant="glass" className="glass-card rounded-3xl mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      {t("clientComparison.progressCharts")}
                    </CardTitle>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      {t("clientComparison.exportComparison")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ComparisonCharts data={comparisonData} />
                </CardContent>
              </Card>

              {/* Table */}
              <Card variant="glass" className="glass-card rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-primary" />
                    {t("clientComparison.metricsTable")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ComparisonTable data={comparisonData} />
                </CardContent>
              </Card>
            </>
          )}
        </>
      ) : (
        <Card variant="glass" className="glass-card rounded-3xl">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Users2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                {t("clientComparison.selectAtLeastTwo")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default CoachClientComparison;
