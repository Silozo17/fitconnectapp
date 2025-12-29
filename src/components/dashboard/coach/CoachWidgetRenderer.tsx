import { useTranslation } from "react-i18next";
import { CoachDashboardWidget } from "@/hooks/useCoachWidgets";
import { Wallet, Package, CreditCard, Users } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";
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

    case "business_earnings":
      return (
        <Card variant="glass" className="h-full flex items-center justify-center p-6">
          <EmptyState
            icon={Wallet}
            title={t("widgets.emptyStates.earnings.title")}
            description={t("widgets.emptyStates.earnings.description")}
            variant="compact"
          />
        </Card>
      );

    case "business_packages":
      return (
        <Card variant="glass" className="h-full flex items-center justify-center p-6">
          <EmptyState
            icon={Package}
            title={t("widgets.emptyStates.packages.title")}
            description={t("widgets.emptyStates.packages.description")}
            variant="compact"
          />
        </Card>
      );

    case "business_subscriptions":
      return (
        <Card variant="glass" className="h-full flex items-center justify-center p-6">
          <EmptyState
            icon={CreditCard}
            title={t("widgets.emptyStates.subscriptions.title")}
            description={t("widgets.emptyStates.subscriptions.description")}
            variant="compact"
          />
        </Card>
      );

    case "list_recent_clients":
      return (
        <Card variant="glass" className="h-full flex items-center justify-center p-6">
          <EmptyState
            icon={Users}
            title={t("widgets.emptyStates.recentClients.title")}
            description={t("widgets.emptyStates.recentClients.description")}
            variant="compact"
          />
        </Card>
      );

    default:
      return null;
  }
}
