import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Settings2, Loader2, Move, Check } from "lucide-react";
import { useAdminWidgets, useDashboardStats, useReorderWidgets, WIDGET_TYPES, DashboardWidget } from "@/hooks/useAdminWidgets";
import { useUserProfile } from "@/hooks/useUserProfile";
import { StatWidget } from "@/components/admin/widgets/StatWidget";
import { ActivityWidget } from "@/components/admin/widgets/ActivityWidget";
import { QuickActionsWidget } from "@/components/admin/widgets/QuickActionsWidget";
import { ListWidget } from "@/components/admin/widgets/ListWidget";
import { ChartWidget } from "@/components/admin/widgets/ChartWidget";
import { RevenueWidget } from "@/components/admin/widgets/RevenueWidget";
import { AnalyticsWidget } from "@/components/admin/widgets/AnalyticsWidget";
import { IntegrationHealthWidget } from "@/components/admin/widgets/IntegrationHealthWidget";
import { IntegrationStatWidget } from "@/components/admin/widgets/IntegrationStatWidget";
import { DashboardCustomizer } from "@/components/admin/DashboardCustomizer";
import { DraggableWidgetGrid, WidgetItem } from "@/components/dashboard/DraggableWidgetGrid";
import { StatsGrid } from "@/components/shared";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { WidgetDisplayFormat } from "@/lib/widget-formats";

const getSizeClasses = (size: string | null | undefined) => {
  switch (size) {
    case "small":
      return "col-span-1";
    case "medium":
      return "col-span-1 md:col-span-2";
    case "large":
      return "col-span-1 md:col-span-2 lg:col-span-3";
    case "full":
      return "col-span-full";
    default:
      return "col-span-1 md:col-span-2";
  }
};

const AdminDashboard = () => {
  const { t } = useTranslation('dashboard');
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const { data: widgets, isLoading: widgetsLoading } = useAdminWidgets();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { displayName } = useUserProfile();
  const reorderWidgets = useReorderWidgets();

  const isLoading = widgetsLoading || statsLoading;

  const visibleWidgets = widgets?.filter(w => w.is_visible) || [];

  const handleReorder = async (reorderedWidgets: WidgetItem[]) => {
    try {
      await reorderWidgets.mutateAsync(
        reorderedWidgets.map((w, index) => ({ id: w.id, position: index }))
      );
      toast.success("Widget order saved");
    } catch (error) {
      toast.error("Failed to save widget order");
    }
  };

  const handleResize = async (widgetId: string, size: "small" | "medium" | "large" | "full") => {
    // This will be handled by the customizer or we can add a mutation here
    toast.info("Use the Customize dialog to change widget sizes");
  };

  const renderWidgetContent = (widget: DashboardWidget | WidgetItem) => {
    const widgetType = widget.widget_type as keyof typeof WIDGET_TYPES;
    const displayFormat = (widget.config?.displayFormat as WidgetDisplayFormat) || "number";
    
    switch (widgetType) {
      // Stats widgets
      case "stats_users":
        return <StatWidget type="stats_users" title={t('admin.widgets.totalUsers')} value={stats?.totalUsers || 0} size={widget.size} displayFormat={displayFormat} />;
      case "stats_coaches":
        return <StatWidget type="stats_coaches" title={t('admin.widgets.activeCoaches')} value={stats?.totalCoaches || 0} size={widget.size} displayFormat={displayFormat} />;
      case "stats_sessions":
        return <StatWidget type="stats_sessions" title={t('admin.widgets.scheduledSessions')} value={stats?.activeSessions || 0} size={widget.size} displayFormat={displayFormat} />;
      case "stats_revenue":
        return <StatWidget type="stats_revenue" title={t('admin.widgets.monthlyRevenue')} value={stats?.monthlyRevenue || 0} size={widget.size} displayFormat={displayFormat} />;
      case "stats_messages":
        return <StatWidget type="stats_messages" title={t('admin.widgets.totalMessages')} value={stats?.totalMessages || 0} size={widget.size} displayFormat={displayFormat} />;
      case "stats_reviews":
        return <StatWidget type="stats_reviews" title={t('admin.widgets.totalReviews')} value={stats?.totalReviews || 0} size={widget.size} displayFormat={displayFormat} />;

      // Revenue widgets
      case "revenue_mrr":
        return <RevenueWidget type="revenue_mrr" stats={stats || {}} />;
      case "revenue_commissions":
        return <RevenueWidget type="revenue_commissions" stats={stats || {}} />;
      case "revenue_active_subs":
        return <RevenueWidget type="revenue_active_subs" stats={stats || {}} />;
      case "revenue_tier_distribution":
        return <RevenueWidget type="revenue_tier_distribution" stats={stats || {}} />;

      // Analytics widgets
      case "analytics_growth_rate":
        return <AnalyticsWidget type="analytics_growth_rate" stats={stats || {}} />;
      case "analytics_session_rate":
        return <AnalyticsWidget type="analytics_session_rate" stats={stats || {}} />;
      case "analytics_engagement":
        return <AnalyticsWidget type="analytics_engagement" stats={stats || {}} />;
      case "analytics_coach_ratio":
        return <AnalyticsWidget type="analytics_coach_ratio" stats={stats || {}} />;

      // Chart widgets
      case "chart_signups":
        return <ChartWidget type="area" title={t('admin.widgets.userSignups')} data={stats?.signupChartData || []} />;
      case "chart_revenue":
        return <ChartWidget type="line" title={t('admin.widgets.revenue7Days')} data={stats?.revenueChartData || []} color="hsl(var(--chart-2))" />;
      case "chart_sessions":
        return <ChartWidget type="bar" title={t('admin.widgets.sessions7Days')} data={stats?.sessionChartData || []} color="hsl(var(--chart-3))" />;

      // Integration widgets
      case "integration_health":
        return <IntegrationHealthWidget health={(stats?.integrationHealth || []) as any} />;
      case "integration_video":
        return <IntegrationStatWidget type="integration_video" stats={stats?.integrationStats || {}} />;
      case "integration_calendar":
        return <IntegrationStatWidget type="integration_calendar" stats={stats?.integrationStats || {}} />;
      case "integration_wearables":
        return <IntegrationStatWidget type="integration_wearables" stats={stats?.integrationStats || {}} />;
      case "integration_grocery":
        return <IntegrationStatWidget type="integration_grocery" stats={stats?.integrationStats || {}} />;

      // List widgets
      case "recent_activity":
        return <ActivityWidget activities={stats?.recentActivity || []} />;
      case "quick_actions":
        return <QuickActionsWidget />;
      case "pending_verifications":
        return <ListWidget type="pending_verifications" items={stats?.pendingVerifications || []} />;
      case "recent_signups":
        return <ListWidget type="recent_signups" items={stats?.recentSignups || []} />;
      case "recent_transactions":
        return <ListWidget type="recent_transactions" items={stats?.recentTransactions || []} />;
      case "recent_reviews":
        return <ListWidget type="recent_reviews" items={stats?.recentReviews || []} />;
      case "top_coaches":
        return <ListWidget type="top_coaches" items={stats?.topCoaches || []} />;
      case "flagged_documents":
        return <ListWidget type="flagged_documents" items={stats?.flaggedDocuments || []} />;

      default:
        return null;
    }
  };

  const renderWidget = (widget: WidgetItem) => {
    const content = renderWidgetContent(widget as DashboardWidget);
    if (!content) return null;
    return <div className="h-full">{content}</div>;
  };

  // Convert DashboardWidget to WidgetItem for the grid
  const widgetItems: WidgetItem[] = visibleWidgets.map(w => ({
    id: w.id,
    widget_type: w.widget_type,
    title: w.title,
    position: w.position,
    size: w.size as "small" | "medium" | "large" | "full",
    is_visible: w.is_visible,
    config: w.config,
  }));

  // Categorize widgets for grouped rendering
  const { statWidgets, revenueWidgets, otherWidgets } = useMemo(() => {
    const statTypes = ["stats_users", "stats_coaches", "stats_sessions", "stats_revenue", "stats_messages", "stats_reviews"];
    const revenueTypes = ["revenue_mrr", "revenue_commissions", "revenue_active_subs", "revenue_tier_distribution"];
    
    const sorted = [...widgetItems].sort((a, b) => a.position - b.position);
    
    return {
      statWidgets: sorted.filter(w => statTypes.includes(w.widget_type)),
      revenueWidgets: sorted.filter(w => revenueTypes.includes(w.widget_type)),
      otherWidgets: sorted.filter(w => !statTypes.includes(w.widget_type) && !revenueTypes.includes(w.widget_type)),
    };
  }, [widgetItems]);

  return (
    <>
      <Helmet>
        <title>{t('admin.overview.title')} | FitConnect</title>
        <meta name="description" content={t('admin.overview.description')} />
      </Helmet>

      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground font-display tracking-tight">
                {(() => {
                  const hour = new Date().getHours();
                  const greeting = hour < 12 ? t("admin.greeting.morning", "Good morning") 
                    : hour < 18 ? t("admin.greeting.afternoon", "Good afternoon") 
                    : t("admin.greeting.evening", "Good evening");
                  return displayName ? (
                    <>{greeting}, <span className="gradient-text">{displayName}</span></>
                  ) : (
                    <>{greeting}!</>
                  );
                })()}
              </h1>
              <p className="text-muted-foreground mt-1">{t('admin.overview.description')}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                variant={editMode ? "default" : "outline"} 
                onClick={() => setEditMode(!editMode)}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                {editMode ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {t('admin.overview.done')}
                  </>
                ) : (
                  <>
                    <Move className="h-4 w-4 mr-2" />
                    {t('admin.overview.editLayout')}
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCustomizerOpen(true)} className="flex-1 sm:flex-none">
                <Settings2 className="h-4 w-4 mr-2" />
                {t('admin.overview.customize')}
              </Button>
            </div>
          </div>

          {editMode && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm text-primary">
              {t('admin.overview.dragToReorder')}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : widgetItems.length > 0 ? (
            editMode ? (
              <DraggableWidgetGrid
                widgets={widgetItems.sort((a, b) => a.position - b.position)}
                editMode={editMode}
                onReorder={handleReorder}
                onResize={handleResize}
                renderWidget={renderWidget}
                getSizeClasses={getSizeClasses}
              />
            ) : (
              <div className="space-y-6">
                {/* Stat Widgets - 2 column grid */}
                {statWidgets.length > 0 && (
                  <StatsGrid columns={2}>
                    {statWidgets.map(widget => (
                      <div key={widget.id}>{renderWidget(widget)}</div>
                    ))}
                  </StatsGrid>
                )}

                {/* Quick Actions - full width */}
                {otherWidgets.find(w => w.widget_type === "quick_actions") && (
                  <QuickActionsWidget />
                )}

                {/* Revenue Widgets - 2 column grid */}
                {revenueWidgets.length > 0 && (
                  <StatsGrid columns={2}>
                    {revenueWidgets.map(widget => (
                      <div key={widget.id}>{renderWidget(widget)}</div>
                    ))}
                  </StatsGrid>
                )}

                {/* Other Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {otherWidgets
                    .filter(w => w.widget_type !== "quick_actions")
                    .map(widget => (
                      <div key={widget.id} className={getSizeClasses(widget.size)}>
                        {renderWidget(widget)}
                      </div>
                    ))}
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>{t('admin.overview.noWidgets')}</p>
            </div>
          )}
        </div>

        <DashboardCustomizer open={customizerOpen} onOpenChange={setCustomizerOpen} />
      </AdminLayout>
    </>
  );
};

export default AdminDashboard;
