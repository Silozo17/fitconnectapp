import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Star, Loader2 } from "lucide-react";
import { useCreateReview } from "@/hooks/useReviews";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WriteReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachId: string;
  coachName: string;
  sessionId?: string;
}

const WriteReviewModal = ({
  open,
  onOpenChange,
  coachId,
  coachName,
  sessionId,
}: WriteReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const createReview = useCreateReview();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      await createReview.mutateAsync({
        coach_id: coachId,
        session_id: sessionId,
        rating,
        review_text: reviewText.trim() || undefined,
        is_public: isPublic,
      });
      toast.success("Review submitted successfully!");
      onOpenChange(false);
      // Reset form
      setRating(0);
      setReviewText("");
      setIsPublic(true);
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review {coachName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      (hoverRating || rating) >= star
                        ? "fill-amber-500 text-amber-500"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="review">Your Review (Optional)</Label>
            <Textarea
              id="review"
              placeholder="Share your experience with this coach..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {reviewText.length}/1000
            </p>
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public">Make Review Public</Label>
              <p className="text-xs text-muted-foreground">
                Public reviews are visible on the coach's profile
              </p>
            </div>
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createReview.isPending}>
            {createReview.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WriteReviewModal;
