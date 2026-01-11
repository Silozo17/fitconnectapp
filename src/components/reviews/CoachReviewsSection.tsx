import { Star, MessageSquareText } from "lucide-react";
import { ContentSectionHeader } from "@/components/shared/ContentSection";
import { useCoachReviews, calculateAverageRating } from "@/hooks/useReviews";
import ReviewCard from "./ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ThemedCard } from "@/components/shared/ThemedCard";
import { Carousel3D, Carousel3DItem } from "@/components/ui/carousel-3d";

interface CoachReviewsSectionProps {
  coachId: string;
}

const CoachReviewsSection = ({ coachId }: CoachReviewsSectionProps) => {
  const { t } = useTranslation('coaches');
  const { data: reviews = [], isLoading } = useCoachReviews(coachId);
  const averageRating = calculateAverageRating(reviews);
  const [showAll, setShowAll] = useState(false);

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <ContentSectionHeader
          icon={MessageSquareText}
          title={t('profile.reviews')}
        />
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ContentSectionHeader
        icon={MessageSquareText}
        title={t('profile.reviews')}
        badge={
          reviews.length > 0 ? (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-full">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="font-semibold text-amber-600">{averageRating}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({reviews.length} {reviews.length !== 1 ? t('profile.reviewPlural') : t('profile.review')})
              </span>
            </div>
          ) : null
        }
      />
      
      <div>
        {reviews.length === 0 ? (
          <ThemedCard colorTheme="orange">
            <div className="text-center py-4">
              <MessageSquareText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">{t('profile.noReviewsEmpty')}</p>
              <p className="text-sm text-muted-foreground">
                {t('profile.beFirstReview')}
              </p>
            </div>
          </ThemedCard>
        ) : (
          <>
            {/* Mobile: 3D Carousel */}
            <div className="md:hidden -mx-5">
              <Carousel3D gap={12} showPagination={displayedReviews.length > 2}>
                {displayedReviews.map((review) => (
                  <Carousel3DItem key={review.id} className="w-[300px]">
                    <ReviewCard review={review} />
                  </Carousel3DItem>
                ))}
              </Carousel3D>
            </div>

            {/* Desktop: List */}
            <div className="hidden md:block space-y-3">
              {displayedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {/* Show more/less buttons */}
            {reviews.length > 3 && !showAll && (
              <Button 
                variant="ghost" 
                className="w-full mt-3"
                onClick={() => setShowAll(true)}
              >
                View all {reviews.length} reviews
              </Button>
            )}
            {showAll && reviews.length > 3 && (
              <Button 
                variant="ghost" 
                className="w-full mt-3"
                onClick={() => setShowAll(false)}
              >
                Show less
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CoachReviewsSection;
