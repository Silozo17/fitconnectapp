import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CoachDashboardWidget } from "@/hooks/useCoachWidgets";
import { Wallet, Package, CreditCard, Users } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ContentSection } from "@/components/shared/ContentSection";
import {
  CoachStatsGrid,
  StatsClientsWidget,
  StatsSessionsWidget,
  StatsMessagesWidget,
  StatsRatingWidget,
  QuickActionsWidget,
  UpcomingSessionsWidget,
  ReviewsWidget,
  ConnectionRequestsWidget,
  PipelineWidget,
  EngagementScoreWidget,
  RevenueForecastWidget,
  ClientLTVWidget,
  EnhancedChurnWidget,
  PlateauDetectionWidget,
  UpsellInsightsWidget,
  GoalAdherenceWidget,
  PendingSummariesWidget,
  PackageAnalyticsWidget,
} from "./widgets";
import { ClientRiskWidget } from "./ClientRiskWidget";
import { AIClientInsightsWidget } from "./AIClientInsightsWidget";
import { CheckInSuggestionsWidget } from "./CheckInSuggestionsWidget";
import { isFeatureEnabled } from "@/lib/coach-feature-flags";

interface UpcomingSession {
  id: string;
  client: string;
  type: string;
  time: string;
  avatar: string;
}

interface CoachStats {
  displayName: string;
  activeClients: number;
  sessionsThisWeek: number;
  averageRating: number;
  totalReviews: number;
}

interface CoachWidgetRendererProps {
  widget: CoachDashboardWidget;
  stats?: CoachStats | null;
  upcomingSessions?: UpcomingSession[];
  unreadMessages?: number;
  isLoading?: boolean;
  onAddClient?: () => void;
}

/**
 * OPTIMIZED: Memoized widget renderer to prevent unnecessary re-renders
 * when parent dashboard state changes
 */
export const CoachWidgetRenderer = memo(function CoachWidgetRenderer({
  widget,
  stats,
  upcomingSessions = [],
  unreadMessages = 0,
  isLoading = false,
  onAddClient,
}: CoachWidgetRendererProps) {
  const { t } = useTranslation("coach");
  
  // Memoize stats values to prevent child re-renders
  const memoizedStats = useMemo(() => ({
    activeClients: stats?.activeClients || 0,
    sessionsThisWeek: stats?.sessionsThisWeek || 0,
    averageRating: stats?.averageRating || 0,
    totalReviews: stats?.totalReviews || 0,
  }), [stats?.activeClients, stats?.sessionsThisWeek, stats?.averageRating, stats?.totalReviews]);

  switch (widget.widget_type) {
    // New: Combined stats overview for compact mobile layout
    case "stats_overview":
      return (
        <CoachStatsGrid
          activeClients={memoizedStats.activeClients}
          sessionsThisWeek={memoizedStats.sessionsThisWeek}
          unreadMessages={unreadMessages}
          averageRating={memoizedStats.averageRating}
          totalReviews={memoizedStats.totalReviews}
          isLoading={isLoading}
        />
      );

    case "stats_clients":
      return (
        <StatsClientsWidget
          activeClients={memoizedStats.activeClients}
          isLoading={isLoading}
        />
      );

    case "stats_sessions":
      return (
        <StatsSessionsWidget
          sessionsThisWeek={memoizedStats.sessionsThisWeek}
          isLoading={isLoading}
        />
      );

    case "stats_messages":
      return <StatsMessagesWidget unreadMessages={unreadMessages} />;

    case "stats_rating":
      return (
        <StatsRatingWidget
          averageRating={memoizedStats.averageRating}
          totalReviews={memoizedStats.totalReviews}
          isLoading={isLoading}
        />
      );

    case "quick_actions":
      return (
        <QuickActionsWidget 
          onAddClient={onAddClient || (() => {})} 
          activeClients={memoizedStats.activeClients}
          unreadMessages={unreadMessages}
        />
      );

    case "list_upcoming":
      return (
        <UpcomingSessionsWidget
          sessions={upcomingSessions}
          isLoading={isLoading}
        />
      );

    case "engagement_reviews":
      return (
        <ReviewsWidget
          averageRating={memoizedStats.averageRating}
          totalReviews={memoizedStats.totalReviews}
          isLoading={isLoading}
        />
      );

    case "engagement_connection_requests":
      return <ConnectionRequestsWidget />;

    case "list_pipeline":
      return <PipelineWidget />;

    case "intelligence_client_risk":
      // Use enhanced churn widget if feature enabled, otherwise fallback to basic
      return isFeatureEnabled("ENHANCED_CHURN_PREDICTION") ? <EnhancedChurnWidget /> : <ClientRiskWidget />;

    case "intelligence_ai_insights":
      return <AIClientInsightsWidget />;

    case "intelligence_checkin_suggestions":
      return <CheckInSuggestionsWidget />;

    case "intelligence_engagement_score":
      return isFeatureEnabled("CLIENT_ENGAGEMENT_SCORING") ? <EngagementScoreWidget /> : null;

    case "business_revenue_forecast":
      return isFeatureEnabled("REVENUE_FORECASTING") ? <RevenueForecastWidget /> : null;

    case "business_client_ltv":
      return isFeatureEnabled("CLIENT_LTV") ? <ClientLTVWidget /> : null;

    // Phase 2 Widgets
    case "intelligence_plateau_detection":
      return isFeatureEnabled("AI_PLATEAU_DETECTION") ? <PlateauDetectionWidget /> : null;

    case "intelligence_upsell_insights":
      return isFeatureEnabled("UPSELL_INSIGHTS") ? <UpsellInsightsWidget /> : null;

    case "intelligence_goal_adherence":
      return isFeatureEnabled("GOAL_ADHERENCE_TRACKER") ? <GoalAdherenceWidget /> : null;

    case "intelligence_pending_summaries":
      return isFeatureEnabled("AI_CLIENT_SUMMARY") ? <PendingSummariesWidget /> : null;

    case "business_package_analytics":
      return isFeatureEnabled("PACKAGE_ANALYTICS") ? <PackageAnalyticsWidget /> : null;

    case "business_earnings":
      return (
        <ContentSection colorTheme="green" className="h-full flex items-center justify-center p-6 rounded-3xl">
          <EmptyState
            icon={Wallet}
            title={t("widgets.emptyStates.earnings.title")}
            description={t("widgets.emptyStates.earnings.description")}
            variant="compact"
          />
        </ContentSection>
      );

    case "business_packages":
      return (
        <ContentSection colorTheme="purple" className="h-full flex items-center justify-center p-6 rounded-3xl">
          <EmptyState
            icon={Package}
            title={t("widgets.emptyStates.packages.title")}
            description={t("widgets.emptyStates.packages.description")}
            variant="compact"
          />
        </ContentSection>
      );

    case "business_subscriptions":
      return (
        <ContentSection colorTheme="cyan" className="h-full flex items-center justify-center p-6 rounded-3xl">
          <EmptyState
            icon={CreditCard}
            title={t("widgets.emptyStates.subscriptions.title")}
            description={t("widgets.emptyStates.subscriptions.description")}
            variant="compact"
          />
        </ContentSection>
      );

    case "list_recent_clients":
      return (
        <ContentSection colorTheme="primary" className="h-full flex items-center justify-center p-6 rounded-3xl">
          <EmptyState
            icon={Users}
            title={t("widgets.emptyStates.recentClients.title")}
            description={t("widgets.emptyStates.recentClients.description")}
            variant="compact"
          />
        </ContentSection>
      );

    default:
      return null;
  }
});

CoachWidgetRenderer.displayName = "CoachWidgetRenderer";
