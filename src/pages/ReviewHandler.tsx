import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import WriteReviewModal from "@/components/reviews/WriteReviewModal";

/**
 * ReviewHandler - Handles deep links from review request emails
 * 
 * URL format: /review?sessionId=xxx&coachId=xxx&coachName=xxx
 * 
 * Flow:
 * 1. If user is not authenticated, redirect to /auth with return URL
 * 2. If authenticated, show the WriteReviewModal automatically
 * 3. After review submission or modal close, redirect to sessions page
 */
const ReviewHandler = () => {
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const sessionId = searchParams.get("sessionId") || undefined;
  const coachId = searchParams.get("coachId") || "";
  const coachName = decodeURIComponent(searchParams.get("coachName") || "Your Coach");

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // If not logged in, redirect to auth with return URL
    if (!user) {
      const returnUrl = `/review?${searchParams.toString()}`;
      navigate(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`, { replace: true });
      return;
    }

    // If we have a coach ID, show the modal
    if (coachId) {
      setShowModal(true);
    } else {
      // No coach ID provided, redirect to sessions
      navigate("/dashboard/client/sessions", { replace: true });
    }
  }, [user, authLoading, coachId, navigate, searchParams]);

  const handleModalClose = (open: boolean) => {
    setShowModal(open);
    if (!open) {
      // After closing the modal, redirect to sessions page
      navigate("/dashboard/client/sessions", { replace: true });
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, the useEffect will handle redirect
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <WriteReviewModal
        open={showModal}
        onOpenChange={handleModalClose}
        coachId={coachId}
        coachName={coachName}
        sessionId={sessionId}
      />
      {!showModal && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading review...</p>
        </div>
      )}
    </div>
  );
};

export default ReviewHandler;
