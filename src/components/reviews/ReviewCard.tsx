import { memo } from "react";
import { Star } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ThemedCard } from "@/components/shared/ThemedCard";
import type { Review } from "@/hooks/useReviews";

interface ReviewCardProps {
  review: Review;
  className?: string;
}

const ReviewCard = memo(function ReviewCard({ review, className }: ReviewCardProps) {
  const clientName = review.client
    ? [review.client.first_name, review.client.last_name]
        .filter(Boolean)
        .join(" ") || "Anonymous"
    : "Anonymous";

  return (
    <ThemedCard colorTheme="orange" className={className}>
      <div className="flex items-start gap-3">
        <UserAvatar
          src={review.client?.avatar_url}
          name={clientName}
          className="h-10 w-10"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-foreground truncate">{clientName}</p>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {format(new Date(review.created_at), "MMM d, yyyy")}
            </span>
          </div>
          
          {/* Star Rating */}
          <div className="flex gap-0.5 my-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-4 w-4",
                  review.rating >= star
                    ? "fill-amber-500 text-amber-500"
                    : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>

          {/* Review Text */}
          {review.review_text && (
            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
              {review.review_text}
            </p>
          )}
        </div>
      </div>
    </ThemedCard>
  );
});

export default ReviewCard;
