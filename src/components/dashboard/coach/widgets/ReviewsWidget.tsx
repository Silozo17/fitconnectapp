import { memo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentSection } from "@/components/shared/ContentSection";
import { Skeleton } from "@/components/ui/skeleton";

interface ReviewsWidgetProps {
  averageRating: number;
  totalReviews: number;
  isLoading?: boolean;
}

export const ReviewsWidget = memo(function ReviewsWidget({ averageRating, totalReviews, isLoading }: ReviewsWidgetProps) {
  const { t } = useTranslation("coach");

  return (
    <ContentSection colorTheme="green" padding="none" className="overflow-hidden h-full rounded-3xl">
      <div className="p-5 border-b border-border/50 flex items-center justify-between">
        <h2 className="font-display font-bold text-foreground">{t("dashboard.yourReviews")}</h2>
        <Link to="/dashboard/coach/reviews">
          <Button variant="ghost" size="sm" className="text-primary rounded-xl">
            {t("common:viewAll")} <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            {isLoading ? (
              <Skeleton className="h-10 w-12 rounded-xl" />
            ) : (
              <span className="text-4xl font-bold text-foreground">
                {averageRating > 0 ? averageRating.toFixed(1) : "—"}
              </span>
            )}
          </div>
          <div className="text-muted-foreground">
            {isLoading ? (
              <Skeleton className="h-4 w-24 rounded-lg" />
            ) : (
              <p className="text-sm">{totalReviews} {t("dashboard.totalReviews")}</p>
            )}
          </div>
        </div>
        {!isLoading && totalReviews === 0 && (
          <p className="text-muted-foreground text-center py-4">
            {t("dashboard.noReviewsYet")}
          </p>
        )}
      </div>
    </ContentSection>
  );
});
