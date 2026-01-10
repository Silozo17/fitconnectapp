import { Star, MessageSquareText } from "lucide-react";
import { ContentSection, ContentSectionHeader } from "@/components/shared/ContentSection";
import { useCoachReviews, calculateAverageRating } from "@/hooks/useReviews";
import ReviewCard from "./ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface CoachReviewsSectionProps {
  coachId: string;
}

const CoachReviewsSection = ({ coachId }: CoachReviewsSectionProps) => {
  const { t } = useTranslation('coaches');
  const { data: reviews = [], isLoading } = useCoachReviews(coachId);
  const averageRating = calculateAverageRating(reviews);

  if (isLoading) {
    return (
      <ContentSection colorTheme="orange">
        <ContentSectionHeader
          icon={MessageSquareText}
          title={t('profile.reviews')}
        />
        <div className="space-y-4 pt-4">
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
            <div className="flex items-center gap-2">
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
      
      <div className="pt-4 overflow-hidden">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquareText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{t('profile.noReviewsEmpty')}</p>
            <p className="text-sm text-muted-foreground">
              {t('profile.beFirstReview')}
            </p>
          </div>
        ) : reviews.length <= 2 ? (
          // Show as stack for 1-2 reviews
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          // Carousel for 3+ reviews
          <Carousel
            opts={{
              align: "start",
              loop: reviews.length > 3,
            }}
            className="w-full max-w-full"
          >
            <CarouselContent className="-ml-2">
              {reviews.map((review) => (
                <CarouselItem key={review.id} className="pl-2 basis-[85%] sm:basis-1/2 lg:basis-1/3">
                  <ReviewCard review={review} className="h-full" />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex items-center justify-center gap-2 mt-4">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>
        )}
      </div>
    </ContentSection>
  );
};

export default CoachReviewsSection;
