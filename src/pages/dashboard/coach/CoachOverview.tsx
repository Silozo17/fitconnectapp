import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Settings2, AlertCircle, RefreshCw, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ProfileCompletionCard } from "@/components/dashboard/coach/ProfileCompletionCard";
import { CoachDashboardCustomizer } from "@/components/dashboard/coach/CoachDashboardCustomizer";
import { CoachWidgetRenderer } from "@/components/dashboard/coach/CoachWidgetRenderer";
import { DraggableWidgetGrid, WidgetItem } from "@/components/dashboard/DraggableWidgetGrid";
import { AddClientModal } from "@/components/dashboard/clients/AddClientModal";
import { DashboardSectionHeader } from "@/components/shared/DashboardSectionHeader";
import { ContentSection } from "@/components/shared/ContentSection";
import { ClientQuickViewCarousel } from "@/components/dashboard/coach/ClientQuickViewCarousel";
import { ClientQuickViewModal } from "@/components/dashboard/coach/ClientQuickViewModal";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useCoachDashboardStats } from "@/hooks/useCoachDashboardStats";
import { useCoachProfileRealtime } from "@/hooks/useCoachProfileRealtime";
import { useAutoAwardCoachBadges } from "@/hooks/useAutoAwardCoachBadges";
import { useCoachWidgets, useUpdateCoachWidget, useReorderCoachWidgets } from "@/hooks/useCoachWidgets";
import { useCoachClients } from "@/hooks/useCoachClients";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";

// Widget section definitions for grouping
const WIDGET_SECTIONS = {
  clients: { key: "clients", title: "Client Quickview", description: "Quick access to client stats" },
  stats: { key: "stats", title: "Dashboard Overview", description: "Your key metrics at a glance" },
  activity: { key: "activity", title: "Client Activity", description: "Client activity and sessions" },
  actions: { key: "actions", title: "Quick Actions", description: "Common tasks" },
  engagement: { key: "engagement", title: "Client Engagement", description: "Reviews and connections" },
  intelligence: { key: "intelligence", title: "Smart Insights", description: "AI-powered insights" },
  business: { key: "business", title: "Business Analytics", description: "Revenue and analytics" },
} as const;

// Map widget types to sections
const getWidgetSection = (widgetType: string): string => {
  if (widgetType.startsWith("stats_") || widgetType === "stats_overview") return "stats";
  if (widgetType === "quick_actions") return "actions";
  if (widgetType.startsWith("list_") || widgetType === "engagement_connection_requests") return "activity";
  if (widgetType.startsWith("engagement_")) return "engagement";
  if (widgetType.startsWith("intelligence_")) return "intelligence";
  if (widgetType.startsWith("business_")) return "business";
  return "activity";
};

const getSizeClasses = (size: string | null | undefined): string => {
  switch (size) {
    case "small":
      return "col-span-1";
    case "medium":
      return "col-span-1 md:col-span-2";
    case "large":
      return "col-span-1 md:col-span-2 xl:col-span-3";
    case "full":
      return "col-span-1 md:col-span-2 xl:col-span-4";
    default:
      return "col-span-1";
  }
};

const CoachOverview = () => {
  const { t } = useTranslation("coach");
  
  // Subscribe to real-time coach profile updates (e.g., tier changes by admin)
  useCoachProfileRealtime();
  
  // OPTIMIZED: Badge awarding moved here from layout (prevents queries on every navigation)
  useAutoAwardCoachBadges();
  
  const { unreadCount: unreadMessages } = useUnreadMessages();
  const { data: dashboardData, isLoading: statsLoading, error, refetch } = useCoachDashboardStats();
  const { data: widgets, isLoading: widgetsLoading } = useCoachWidgets();
  const updateWidget = useUpdateCoachWidget();
  const reorderWidgets = useReorderCoachWidgets();
  
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [quickViewClientId, setQuickViewClientId] = useState<string | null>(null);
  
  // Fetch active clients for quick view carousel
  const { data: clients } = useCoachClients();
  const activeClients = useMemo(
    () => (clients || []).filter((c) => c.status === "active"),
    [clients]
  );

  const stats = dashboardData?.stats;
  const upcomingSessions = dashboardData?.upcomingSessions || [];
  
  // Transform widgets to WidgetItem format and filter visible ones
  const visibleWidgets: WidgetItem[] = (widgets || [])
    .filter((w) => w.is_visible)
    .sort((a, b) => a.position - b.position)
    .map((w) => ({
      id: w.id,
      widget_type: w.widget_type,
      title: w.title,
      position: w.position,
      size: w.size,
      is_visible: w.is_visible,
      config: w.config || {},
    }));

  // Group widgets by section for organized rendering
  const groupedWidgets = useMemo(() => {
    const groups: Record<string, WidgetItem[]> = {};
    const sectionOrder = ["stats", "clients", "activity", "actions", "engagement", "intelligence", "business"];
    
    visibleWidgets.forEach((widget) => {
      const section = getWidgetSection(widget.widget_type);
      if (!groups[section]) groups[section] = [];
      groups[section].push(widget);
    });

    // Return sections in order, filtering out empty ones
    return sectionOrder
      .filter((key) => groups[key]?.length > 0)
      .map((key) => ({ key, widgets: groups[key] }));
  }, [visibleWidgets]);

  const handleReorder = (reorderedWidgets: WidgetItem[]) => {
    reorderWidgets.mutate(
      reorderedWidgets.map((w) => ({ id: w.id, position: w.position }))
    );
  };

  const handleResize = (widgetId: string, size: "small" | "medium" | "large" | "full") => {
    updateWidget.mutate({ widgetId, updates: { size } });
  };

  const renderWidget = (widget: WidgetItem) => (
    <CoachWidgetRenderer
      widget={{
        id: widget.id,
        coach_id: null,
        widget_type: widget.widget_type,
        title: widget.title,
        position: widget.position,
        size: widget.size,
        is_visible: widget.is_visible,
        config: widget.config,
      }}
      stats={stats}
      upcomingSessions={upcomingSessions}
      unreadMessages={unreadMessages}
      isLoading={statsLoading}
      onAddClient={() => setAddClientOpen(true)}
    />
  );

  const isLoading = statsLoading || widgetsLoading;

  return (
    <DashboardLayout title={t("dashboard.overview")} description={t("dashboard.description")}>
      {/* Page Help Banner */}
      <PageHelpBanner
        pageKey="coach_overview"
        title="Your Coaching Hub"
        description="See client activity, upcoming sessions, and key stats at a glance."
      />

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{t("dashboard.failedToLoad")}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t("dashboard.retry")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Welcome & Actions */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {(() => {
              const hour = new Date().getHours();
              const greeting = hour < 12 ? t("dashboard.greeting.morning", "Good morning") 
                : hour < 18 ? t("dashboard.greeting.afternoon", "Good afternoon") 
                : t("dashboard.greeting.evening", "Good evening");
              return stats?.displayName ? (
                <>{greeting}, <span className="gradient-text">{stats.displayName}</span></>
              ) : (
                <>{greeting}!</>
              );
            })()}
          </h1>
          <p className="text-muted-foreground">{t("dashboard.whatsHappening")}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={editMode ? "default" : "outline"}
            size="sm"
            className="rounded-xl"
            onClick={() => setEditMode(!editMode)}
          >
            <Pencil className="w-4 h-4 mr-2" />
            {editMode ? t("dashboard.done", "Done") : t("dashboard.edit", "Edit")}
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setCustomizerOpen(true)}>
            <Settings2 className="w-4 h-4 mr-2" />
            {t("dashboard.customize")}
          </Button>
        </div>
      </div>

      {/* Profile Completion */}
      <div className="mb-11">
        <ProfileCompletionCard />
      </div>

      {/* Sectioned Widget Grid with Client Quickview integrated */}
      {groupedWidgets.length > 0 || activeClients.length > 0 ? (
        <div className="space-y-11">
          {/* Render sections in order from sectionOrder */}
          {["stats", "clients", "activity", "actions", "engagement", "intelligence", "business"].map((sectionKey) => {
            // Special handling for clients section - render carousel
            if (sectionKey === "clients" && activeClients.length > 0) {
              return (
                <div key={sectionKey}>
                  <DashboardSectionHeader
                    title={WIDGET_SECTIONS.clients.title}
                    description={WIDGET_SECTIONS.clients.description}
                  />
                  <ClientQuickViewCarousel
                    clients={activeClients}
                    onClientClick={(clientId) => setQuickViewClientId(clientId)}
                  />
                </div>
              );
            }
            
            // Regular widget sections
            const sectionWidgets = groupedWidgets.find(g => g.key === sectionKey)?.widgets;
            if (!sectionWidgets || sectionWidgets.length === 0) return null;
            
            return (
              <div key={sectionKey}>
                <DashboardSectionHeader
                  title={WIDGET_SECTIONS[sectionKey as keyof typeof WIDGET_SECTIONS]?.title || sectionKey}
                  description={WIDGET_SECTIONS[sectionKey as keyof typeof WIDGET_SECTIONS]?.description}
                />
                <DraggableWidgetGrid
                  widgets={sectionWidgets}
                  editMode={editMode}
                  onReorder={handleReorder}
                  onResize={handleResize}
                  renderWidget={renderWidget}
                  getSizeClasses={getSizeClasses}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <ContentSection colorTheme="muted" className="py-16 text-center border-dashed rounded-3xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-muted/50 flex items-center justify-center">
            <Settings2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t("dashboard.noWidgets", "No widgets enabled")}
          </h3>
          <p className="text-muted-foreground text-center mb-4">
            {t("dashboard.customizePrompt", "Customize your dashboard to add widgets")}
          </p>
          <Button className="rounded-xl" onClick={() => setCustomizerOpen(true)}>
            <Settings2 className="w-4 h-4 mr-2" />
            {t("dashboard.customize")}
          </Button>
        </ContentSection>
      )}

      {/* Modals */}
      <CoachDashboardCustomizer open={customizerOpen} onOpenChange={setCustomizerOpen} />
      <AddClientModal open={addClientOpen} onOpenChange={setAddClientOpen} />
      <ClientQuickViewModal
        clientId={quickViewClientId}
        open={!!quickViewClientId}
        onClose={() => setQuickViewClientId(null)}
      />
    </DashboardLayout>
  );
};

export default CoachOverview;
