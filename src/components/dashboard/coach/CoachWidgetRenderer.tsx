import { useTranslation } from "react-i18next";
import { CoachDashboardWidget } from "@/hooks/useCoachWidgets";
import {
  StatsClientsWidget,
  StatsSessionsWidget,
  StatsMessagesWidget,
  StatsRatingWidget,
  QuickActionsWidget,
  UpcomingSessionsWidget,
  ReviewsWidget,
  ConnectionRequestsWidget,
  PipelineWidget,
} from "./widgets";

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

export function CoachWidgetRenderer({
  widget,
  stats,
  upcomingSessions = [],
  unreadMessages = 0,
  isLoading = false,
  onAddClient,
}: CoachWidgetRendererProps) {
  const { t } = useTranslation("coach");

  switch (widget.widget_type) {
    case "stats_clients":
      return (
        <StatsClientsWidget
          activeClients={stats?.activeClients || 0}
          isLoading={isLoading}
        />
      );

    case "stats_sessions":
      return (
        <StatsSessionsWidget
          sessionsThisWeek={stats?.sessionsThisWeek || 0}
          isLoading={isLoading}
        />
      );

    case "stats_messages":
      return <StatsMessagesWidget unreadMessages={unreadMessages} />;

    case "stats_rating":
      return (
        <StatsRatingWidget
          averageRating={stats?.averageRating || 0}
          totalReviews={stats?.totalReviews || 0}
          isLoading={isLoading}
        />
      );

    case "quick_actions":
      return <QuickActionsWidget onAddClient={onAddClient || (() => {})} />;

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
          averageRating={stats?.averageRating || 0}
          totalReviews={stats?.totalReviews || 0}
          isLoading={isLoading}
        />
      );

    case "engagement_connection_requests":
      return <ConnectionRequestsWidget />;

    case "list_pipeline":
      return <PipelineWidget />;

    // Placeholder widgets for business category (can be implemented later)
    case "business_earnings":
    case "business_packages":
    case "business_subscriptions":
    case "list_recent_clients":
      return (
        <div className="h-full flex items-center justify-center p-6 bg-muted/30 rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">
            {widget.title} - {t("widgets.comingSoon")}
          </p>
        </div>
      );

    default:
      return null;
  }
}
