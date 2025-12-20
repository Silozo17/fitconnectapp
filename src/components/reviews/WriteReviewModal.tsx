import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("common");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const createReview = useCreateReview();

  const getRatingLabel = (rating: number) => {
    const labels: Record<number, string> = {
      1: t("reviews.ratingLabels.poor"),
      2: t("reviews.ratingLabels.fair"),
      3: t("reviews.ratingLabels.good"),
      4: t("reviews.ratingLabels.veryGood"),
      5: t("reviews.ratingLabels.excellent"),
    };
    return labels[rating] || "";
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error(t("reviews.selectRating"));
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
      toast.success(t("reviews.success"));
      onOpenChange(false);
      // Reset form
      setRating(0);
      setReviewText("");
      setIsPublic(true);
    } catch (error) {
      toast.error(t("reviews.error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("reviews.reviewCoach", { name: coachName })}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>{t("reviews.rating")}</Label>
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
              {getRatingLabel(rating)}
            </p>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="review">{t("reviews.yourReviewOptional")}</Label>
            <Textarea
              id="review"
              placeholder={t("reviews.placeholder")}
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
              <Label htmlFor="public">{t("reviews.makePublic")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("reviews.publicDescription")}
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
            {t("actions.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={createReview.isPending}>
            {createReview.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            {t("reviews.submitReview")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WriteReviewModal;
