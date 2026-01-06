import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Users, Calendar, MessageSquare, Star } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatsGrid } from "@/components/shared/StatsGrid";
import { Skeleton } from "@/components/ui/skeleton";

interface CoachStatsGridProps {
  activeClients: number;
  sessionsThisWeek: number;
  unreadMessages: number;
  averageRating: number;
  totalReviews: number;
  isLoading?: boolean;
}

/**
 * CoachStatsGrid - Compact 2x2 mobile stats grid for coach dashboard
 * 
 * Uses MetricCard + StatsGrid components for consistent styling
 * - 2 columns on mobile (compact layout)
 * - 4 columns on desktop
 */
export const CoachStatsGrid = memo(function CoachStatsGrid({
  activeClients,
  sessionsThisWeek,
  unreadMessages,
  averageRating,
  totalReviews,
  isLoading = false,
}: CoachStatsGridProps) {
  const { t } = useTranslation("coach");

  if (isLoading) {
    return (
      <StatsGrid columns={{ default: 2, md: 4 }} gap="default">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="relative bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 p-4">
            <Skeleton className="h-8 w-8 rounded-xl mb-2" />
            <Skeleton className="h-7 w-16 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </StatsGrid>
    );
  }

  return (
    <StatsGrid columns={{ default: 2, md: 4 }} gap="default">
      <MetricCard
        icon={Users}
        label={t("stats.activeClients")}
        value={activeClients}
        color="primary"
        size="default"
        trend={activeClients > 0 ? { value: activeClients, direction: "up", suffix: "" } : undefined}
        showTrend={false}
      />
      <MetricCard
        icon={Calendar}
        label={t("stats.sessionsScheduled")}
        value={sessionsThisWeek}
        color="blue"
        size="default"
        description={t("stats.thisWeek")}
      />
      <MetricCard
        icon={MessageSquare}
        label={t("stats.unreadMessages")}
        value={unreadMessages}
        color="orange"
        size="default"
        trend={unreadMessages > 0 ? { value: unreadMessages, direction: "up", suffix: " new" } : undefined}
      />
      <MetricCard
        icon={Star}
        label={t("stats.averageRating")}
        value={averageRating > 0 ? averageRating.toFixed(1) : "—"}
        color="green"
        size="default"
        description={totalReviews > 0 ? `${totalReviews} ${t("stats.reviews")}` : undefined}
      />
    </StatsGrid>
  );
});

CoachStatsGrid.displayName = "CoachStatsGrid";
