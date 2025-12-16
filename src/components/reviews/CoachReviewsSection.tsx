import { Star, MessageSquareText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCoachReviews, calculateAverageRating } from "@/hooks/useReviews";
import ReviewCard from "./ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";

interface CoachReviewsSectionProps {
  coachId: string;
}

const CoachReviewsSection = ({ coachId }: CoachReviewsSectionProps) => {
  const { data: reviews = [], isLoading } = useCoachReviews(coachId);
  const averageRating = calculateAverageRating(reviews);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5" />
            Reviews
          </CardTitle>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-full">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="font-semibold text-amber-600">{averageRating}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquareText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No reviews yet</p>
            <p className="text-sm text-muted-foreground">
              Be the first to leave a review!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoachReviewsSection;
