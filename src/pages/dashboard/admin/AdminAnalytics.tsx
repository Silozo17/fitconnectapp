import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, ChevronDown, LayoutDashboard, PoundSterling, Heart, Settings2 } from "lucide-react";
import { arrayToCSV, downloadCSV } from "@/lib/csv-export";
import { toast } from "sonner";
import { DateRangeFilter } from "@/components/shared/DateRangeFilter";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { AnalyticsOverviewTab } from "@/components/admin/analytics/AnalyticsOverviewTab";
import { AnalyticsMonetisationTab } from "@/components/admin/analytics/AnalyticsMonetisationTab";
import { AnalyticsEngagementTab } from "@/components/admin/analytics/AnalyticsEngagementTab";
import { AnalyticsOperationalTab } from "@/components/admin/analytics/AnalyticsOperationalTab";
import { format } from "date-fns";

const AdminAnalytics = () => {
  const { t } = useTranslation("admin");
  const { analytics, comparison, userGrowthData, sessionData, loading, dateRange } = useAdminAnalytics();

  const handleExport = () => {
    const csv = arrayToCSV(
      [
        { metric: t("analytics.totalClients"), value: analytics.totalClients },
        { metric: t("analytics.totalCoaches"), value: analytics.totalCoaches },
        { metric: t("analytics.totalSessions"), value: analytics.totalSessions },
        { metric: t("analytics.messagesSent"), value: analytics.totalMessages },
        { metric: t("analytics.totalGMV"), value: `£${analytics.totalGMV.toFixed(2)}` },
        { metric: t("analytics.platformCommission"), value: `£${analytics.platformCommission.toFixed(2)}` },
        { metric: t("analytics.coachMRR"), value: `£${analytics.coachSubscriptionMRR.toFixed(2)}` },
        { metric: t("analytics.averageRating"), value: analytics.averageRating.toFixed(1) },
        { metric: t("analytics.totalReviews"), value: analytics.totalReviews },
        { metric: t("analytics.repeatBookingRate"), value: `${analytics.repeatBookingRate.toFixed(1)}%` },
        { metric: t("analytics.sessionCompletionRate"), value: `${analytics.sessionCompletionRate.toFixed(1)}%` },
        { metric: t("analytics.sessionNoShowRate"), value: `${analytics.sessionNoShowRate.toFixed(1)}%` },
        { metric: t("analytics.bookingConversion"), value: `${analytics.bookingConversionRate.toFixed(1)}%` },
        { metric: t("analytics.connectionAcceptance"), value: `${analytics.connectionAcceptanceRate.toFixed(1)}%` },
        { metric: t("analytics.verifiedCoaches"), value: `${analytics.verifiedCoachRate.toFixed(1)}%` },
      ],
      [
        { key: "metric", header: "Metric" },
        { key: "value", header: "Value" }
      ]
    );
    downloadCSV(csv, `analytics-${format(new Date(), "yyyy-MM-dd")}.csv`);
    toast.success(t("common:exported"));
  };

  const showComp = dateRange.compareMode !== 'none' && comparison !== null;

  return (
    <>
      <Helmet><title>{t("analytics.title")} | Admin</title></Helmet>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{t("analytics.title")}</h1>
              <p className="text-muted-foreground">{t("analytics.subtitle")}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  {t("analytics.export")}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExport}>{t("analytics.exportSummary")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <DateRangeFilter 
            preset={dateRange.preset} 
            startDate={dateRange.startDate} 
            endDate={dateRange.endDate} 
            compareMode={dateRange.compareMode} 
            dateRangeLabel={dateRange.dateRangeLabel} 
            comparisonLabel={dateRange.comparisonLabel} 
            onPresetChange={dateRange.setPreset} 
            onCustomRangeChange={dateRange.setCustomRange} 
            onCompareModeChange={dateRange.setCompareMode} 
          />

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 lg:w-auto lg:inline-grid h-auto">
                <TabsTrigger value="overview" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <LayoutDashboard className="h-4 w-4 hidden sm:block" />
                  {t("analytics.tabOverview")}
                </TabsTrigger>
                <TabsTrigger value="monetisation" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <PoundSterling className="h-4 w-4 hidden sm:block" />
                  {t("analytics.tabMonetisation")}
                </TabsTrigger>
                <TabsTrigger value="engagement" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <Heart className="h-4 w-4 hidden sm:block" />
                  {t("analytics.tabEngagement")}
                </TabsTrigger>
                <TabsTrigger value="operational" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <Settings2 className="h-4 w-4 hidden sm:block" />
                  {t("analytics.tabOperational")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <AnalyticsOverviewTab 
                  analytics={analytics} 
                  comparison={comparison} 
                  userGrowthData={userGrowthData} 
                  sessionData={sessionData} 
                  showComparison={showComp} 
                />
              </TabsContent>

              <TabsContent value="monetisation">
                <AnalyticsMonetisationTab 
                  analytics={analytics} 
                  comparison={comparison} 
                  showComparison={showComp} 
                />
              </TabsContent>

              <TabsContent value="engagement">
                <AnalyticsEngagementTab 
                  analytics={analytics} 
                  comparison={comparison} 
                  showComparison={showComp} 
                />
              </TabsContent>

              <TabsContent value="operational">
                <AnalyticsOperationalTab 
                  analytics={analytics} 
                  comparison={comparison} 
                  showComparison={showComp} 
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminAnalytics;
