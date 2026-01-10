import { Star, MessageSquareText } from "lucide-react";
import { useCoachReviews, calculateAverageRating } from "@/hooks/useReviews";
import ReviewCard from "./ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-500/15">
            <MessageSquareText className="w-5 h-5 text-orange-500" />
          </div>
          <h2 className="text-xl font-semibold">{t('profile.reviews')}</h2>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section Heading */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="p-2 rounded-xl bg-orange-500/15">
          <MessageSquareText className="w-5 h-5 text-orange-500" />
        </div>
        <h2 className="text-xl font-semibold">{t('profile.reviews')}</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-full">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span className="font-semibold text-amber-600">{averageRating}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({reviews.length} {reviews.length !== 1 ? t('profile.reviewPlural') : t('profile.review')})
            </span>
          </div>
        )}
      </div>
      
      {/* Reviews */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-2xl">
          <MessageSquareText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">{t('profile.noReviewsEmpty')}</p>
          <p className="text-sm text-muted-foreground">
            {t('profile.beFirstReview')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          {reviews.length > 3 && !showAll && (
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => setShowAll(true)}
            >
              View all {reviews.length} reviews
            </Button>
          )}
          {showAll && reviews.length > 3 && (
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => setShowAll(false)}
            >
              Show less
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CoachReviewsSection;
