import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsRatingWidgetProps {
  averageRating: number;
  totalReviews: number;
  isLoading?: boolean;
}

export const StatsRatingWidget = memo(function StatsRatingWidget({ averageRating, totalReviews, isLoading }: StatsRatingWidgetProps) {
  const { t } = useTranslation("coach");

  if (isLoading) {
    return <Skeleton className="h-[120px] w-full rounded-2xl" />;
  }

  return (
    <MetricCard
      icon={Star}
      label={t("stats.averageRating")}
      value={averageRating > 0 ? averageRating.toFixed(1) : "—"}
      color="green"
      size="default"
      description={totalReviews > 0 ? `${totalReviews} ${t("stats.reviews")}` : undefined}
    />
  );
});
