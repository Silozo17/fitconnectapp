import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsRatingWidgetProps {
  averageRating: number;
  totalReviews: number;
  isLoading?: boolean;
}

export function StatsRatingWidget({ averageRating, totalReviews, isLoading }: StatsRatingWidgetProps) {
  const { t } = useTranslation("coach");

  return (
    <Card variant="glass" className="p-6 hover:shadow-float transition-all h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
          <Star className="w-7 h-7 text-success" />
        </div>
        {!isLoading && totalReviews > 0 && (
          <span className="text-xs text-muted-foreground">
            {totalReviews} {t("stats.reviews")}
          </span>
        )}
      </div>
      {isLoading ? (
        <Skeleton className="h-9 w-16 mb-1 rounded-xl" />
      ) : (
        <p className="text-3xl font-display font-bold text-foreground">
          {averageRating > 0 ? averageRating.toFixed(1) : "—"}
        </p>
      )}
      <p className="text-sm text-muted-foreground">{t("stats.averageRating")}</p>
    </Card>
  );
}
