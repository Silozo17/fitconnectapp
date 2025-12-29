import { useState } from "react";
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
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useCoachDashboardStats } from "@/hooks/useCoachDashboardStats";
import { useCoachProfileRealtime } from "@/hooks/useCoachProfileRealtime";
import { useCoachWidgets, useUpdateCoachWidget, useReorderCoachWidgets } from "@/hooks/useCoachWidgets";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";
import { cn } from "@/lib/utils";

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
  
  const { unreadCount: unreadMessages } = useUnreadMessages();
  const { data: dashboardData, isLoading: statsLoading, error, refetch } = useCoachDashboardStats();
  const { data: widgets, isLoading: widgetsLoading } = useCoachWidgets();
  const updateWidget = useUpdateCoachWidget();
  const reorderWidgets = useReorderCoachWidgets();
  
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

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
            onClick={() => setEditMode(!editMode)}
          >
            <Pencil className="w-4 h-4 mr-2" />
            {editMode ? t("dashboard.done", "Done") : t("dashboard.edit", "Edit")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCustomizerOpen(true)}>
            <Settings2 className="w-4 h-4 mr-2" />
            {t("dashboard.customize")}
          </Button>
        </div>
      </div>

      {/* Profile Completion */}
      <ProfileCompletionCard />

      {/* Dynamic Widget Grid */}
      {visibleWidgets.length > 0 ? (
        <DraggableWidgetGrid
          widgets={visibleWidgets}
          editMode={editMode}
          onReorder={handleReorder}
          onResize={handleResize}
          renderWidget={renderWidget}
          getSizeClasses={getSizeClasses}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-border rounded-xl bg-muted/20">
          <Settings2 className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t("dashboard.noWidgets", "No widgets enabled")}
          </h3>
          <p className="text-muted-foreground text-center mb-4">
            {t("dashboard.customizePrompt", "Customize your dashboard to add widgets")}
          </p>
          <Button onClick={() => setCustomizerOpen(true)}>
            <Settings2 className="w-4 h-4 mr-2" />
            {t("dashboard.customize")}
          </Button>
        </div>
      )}

      {/* Modals */}
      <CoachDashboardCustomizer open={customizerOpen} onOpenChange={setCustomizerOpen} />
      <AddClientModal open={addClientOpen} onOpenChange={setAddClientOpen} />
    </DashboardLayout>
  );
};

export default CoachOverview;
