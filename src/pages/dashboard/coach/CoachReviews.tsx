import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, Flag, MessageSquareText, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  client_id: string;
  rating: number;
  review_text: string | null;
  is_public: boolean;
  created_at: string;
  client?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

interface ReviewDispute {
  id: string;
  review_id: string;
  status: string;
  reason: string;
  admin_notes: string | null;
  created_at: string;
}

const CoachReviews = () => {
  const { t } = useTranslation("coach");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [disputeReason, setDisputeReason] = useState("");

  // Fetch coach profile
  const { data: coachProfile } = useQuery({
    queryKey: ["my-coach-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["my-coach-reviews", coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile) return [];
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          client:client_profiles!reviews_client_id_fkey (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq("coach_id", coachProfile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as Review[];
    },
    enabled: !!coachProfile,
  });

  const { data: disputes = [] } = useQuery({
    queryKey: ["my-review-disputes", coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile) return [];
      const { data, error } = await supabase
        .from("review_disputes")
        .select("*")
        .eq("coach_id", coachProfile.id);

      if (error) throw error;
      return data as ReviewDispute[];
    },
    enabled: !!coachProfile,
  });

  const createDisputeMutation = useMutation({
    mutationFn: async ({ reviewId, reason }: { reviewId: string; reason: string }) => {
      if (!coachProfile) throw new Error("No coach profile");
      
      const { data, error } = await supabase
        .from("review_disputes")
        .insert({
          review_id: reviewId,
          coach_id: coachProfile.id,
          reason,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Dispute submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["my-review-disputes"] });
      setDisputeModalOpen(false);
      setSelectedReview(null);
      setDisputeReason("");
    },
    onError: (error) => {
      toast.error("Failed to submit dispute");
      console.error(error);
    },
  });

  const getDisputeForReview = (reviewId: string) => {
    return disputes.find((d) => d.review_id === reviewId);
  };

  const handleOpenDispute = (review: Review) => {
    setSelectedReview(review);
    setDisputeModalOpen(true);
  };

  const handleSubmitDispute = () => {
    if (!selectedReview || !disputeReason.trim()) return;
    createDisputeMutation.mutate({
      reviewId: selectedReview.id,
      reason: disputeReason,
    });
  };

  const averageRating = reviews.length
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  return (
    <DashboardLayout title={t("reviewsPage.title")} description={t("reviewsPage.subtitle")}>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <Star className="w-7 h-7 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averageRating}</p>
                <p className="text-sm text-muted-foreground">{t("reviewsPage.averageRating")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MessageSquareText className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reviews.length}</p>
                <p className="text-sm text-muted-foreground">{t("reviewsPage.totalReviews")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center">
                <Flag className="w-7 h-7 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{disputes.filter((d) => d.status === "pending").length}</p>
                <p className="text-sm text-muted-foreground">{t("reviewsPage.pendingDisputes")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card className="rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{t("reviewsPage.allReviews")}</CardTitle>
        </CardHeader>
        <CardContent>
          {reviewsLoading ? (
            <div className="text-center py-12 text-muted-foreground">{t("reviewsPage.loading")}</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <MessageSquareText className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">{t("reviewsPage.noReviews")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                const dispute = getDisputeForReview(review.id);
                const clientName = review.client
                  ? [review.client.first_name, review.client.last_name].filter(Boolean).join(" ") || t("reviewsPage.anonymous")
                  : t("reviewsPage.anonymous");

                return (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <UserAvatar
                          src={review.client?.avatar_url}
                          name={clientName}
                          className="h-10 w-10"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">{clientName}</p>
                              {!review.is_public && (
                                <Badge variant="outline" className="text-xs">{t("reviewsPage.private")}</Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
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

                          {review.review_text && (
                            <p className="text-sm text-muted-foreground mt-2">{review.review_text}</p>
                          )}

                          {/* Dispute Status or Action */}
                          <div className="mt-3 flex items-center gap-2">
                            {dispute ? (
                              <Badge
                                variant={
                                  dispute.status === "approved"
                                    ? "default"
                                    : dispute.status === "rejected"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="flex items-center gap-1"
                              >
                                {dispute.status === "pending" && <Clock className="w-3 h-3" />}
                                {dispute.status === "approved" && <CheckCircle className="w-3 h-3" />}
                                {dispute.status === "rejected" && <AlertTriangle className="w-3 h-3" />}
                                {t(`reviewsPage.disputeStatus.${dispute.status}`)}
                              </Badge>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDispute(review)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <Flag className="w-4 h-4 mr-1" />
                                {t("reviewsPage.disputeReview")}
                              </Button>
                            )}
                          </div>

                          {/* Show admin notes if dispute was resolved */}
                          {dispute?.admin_notes && (
                            <div className="mt-2 p-2 bg-muted rounded text-sm">
                              <p className="font-medium text-xs text-muted-foreground mb-1">{t("reviewsPage.adminResponse")}:</p>
                              <p>{dispute.admin_notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dispute Modal */}
      <Dialog open={disputeModalOpen} onOpenChange={setDisputeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("reviewsPage.disputeReview")}</DialogTitle>
            <DialogDescription>
              {t("reviewsPage.disputeDescription")}
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      selectedReview.rating >= star
                        ? "fill-amber-500 text-amber-500"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              {selectedReview.review_text && (
                <p className="text-sm text-muted-foreground">{selectedReview.review_text}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("reviewsPage.reasonForDispute")}</label>
            <Textarea
              placeholder={t("reviewsPage.disputePlaceholder")}
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDisputeModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSubmitDispute}
              disabled={!disputeReason.trim() || createDisputeMutation.isPending}
            >
              {createDisputeMutation.isPending ? t("reviewsPage.submitting") : t("reviewsPage.submitDispute")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CoachReviews;
