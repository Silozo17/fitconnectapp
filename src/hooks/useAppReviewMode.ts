import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "react-router-dom";

// App Review test account email for Apple App Store review
const APP_REVIEW_EMAIL = "appstore.review@fitconnect.app";

/**
 * Hook to detect if the app is running in App Review mode
 * Used for Apple App Store review process
 * 
 * Detection methods:
 * 1. Check if logged in user email matches App Review account
 * 2. Check for ?appReview=true URL parameter (for testing)
 */
export function useAppReviewMode() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Check URL parameter for testing
  const hasAppReviewParam = searchParams.get("appReview") === "true";

  // Check if logged in as App Review account
  const isAppReviewAccount = user?.email === APP_REVIEW_EMAIL;

  // App review mode is active if either condition is true
  const isAppReviewMode = hasAppReviewParam || isAppReviewAccount;

  return {
    isAppReviewMode,
    isAppReviewAccount,
    appReviewEmail: APP_REVIEW_EMAIL,
  };
}

/**
 * App Review Credentials for Apple App Store Review:
 * 
 * Email: appstore.review@fitconnect.app
 * Password: FitConnect2024!Review
 * 
 * Features accessible:
 * - Full client experience
 * - Connected to a verified coach
 * - Active subscription (pro tier)
 * - Sample workout plans
 * - Sample nutrition plans  
 * - Sample progress entries
 * - Messaging with coach
 * - Apple Health integration
 */
