import { useRef } from "react";
import { Star, MessageSquareText } from "lucide-react";
import { ContentSection, ContentSectionHeader } from "@/components/shared/ContentSection";
import { useCoachReviews, calculateAverageRating } from "@/hooks/useReviews";
import ReviewCard from "./ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface CoachReviewsSectionProps {
  coachId: string;
}

const CoachReviewsSection = ({ coachId }: CoachReviewsSectionProps) => {
  const { t } = useTranslation('coaches');
  const { data: reviews = [], isLoading } = useCoachReviews(coachId);
  const averageRating = calculateAverageRating(reviews);
  const [showAll, setShowAll] = useState(false);

  // Create autoplay plugin with pause on hover/touch
  const autoplayPlugin = useRef(
    Autoplay({
      delay: 2000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      stopOnFocusIn: true,
    })
  );

  if (isLoading) {
    return (
      <ContentSection colorTheme="orange">
        <ContentSectionHeader
          icon={MessageSquareText}
          title={t('profile.reviews')}
        />
        <div className="space-y-3 pt-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </ContentSection>
    );
  }

  return (
    <ContentSection colorTheme="orange">
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
      
      <div className="pt-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquareText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{t('profile.noReviewsEmpty')}</p>
            <p className="text-sm text-muted-foreground">
              {t('profile.beFirstReview')}
            </p>
          </div>
        ) : showAll ? (
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => setShowAll(false)}
            >
              Show less
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div 
              className="w-full max-w-full overflow-hidden"
              onPointerDown={() => autoplayPlugin.current?.stop?.()}
              onPointerUp={() => autoplayPlugin.current?.reset?.()}
              onPointerLeave={() => autoplayPlugin.current?.reset?.()}
              onPointerCancel={() => autoplayPlugin.current?.reset?.()}
            >
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                plugins={[autoplayPlugin.current]}
                className="w-full max-w-full"
              >
                <CarouselContent className="ml-0 gap-0">
                  {reviews.map((review) => (
                    <CarouselItem 
                      key={review.id} 
                      className="pl-0 basis-full"
                    >
                      <ReviewCard review={review} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
            
            {reviews.length > 1 && (
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => setShowAll(true)}
              >
                View all {reviews.length} reviews
              </Button>
            )}
          </div>
        )}
      </div>
    </ContentSection>
  );
};

export default CoachReviewsSection;
