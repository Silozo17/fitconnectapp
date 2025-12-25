import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CreditCard, ExternalLink, Loader2, CheckCircle, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { SUBSCRIPTION_TIERS, TierKey, normalizeTier } from "@/lib/stripe-config";
import { Link } from "react-router-dom";

interface StripeConnectButtonProps {
  coachId: string;
  onSuccess?: () => void;
}

const StripeConnectButton = ({ coachId, onSuccess }: StripeConnectButtonProps) => {
  const { t } = useTranslation("settings");
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Check if already connected
  const { data: coachProfile, refetch, isLoading: isProfileLoading } = useQuery({
    queryKey: ["coach-stripe-status", coachId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_profiles")
        .select("stripe_connect_id, stripe_connect_onboarded, subscription_tier")
        .eq("id", coachId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Get current commission rate based on tier - use centralized normalizer for legacy/invalid tiers
  const currentTier = normalizeTier(coachProfile?.subscription_tier);
  const tierData = SUBSCRIPTION_TIERS[currentTier];
  const commissionPercent = tierData.commissionPercent;

  const handleConnect = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const returnUrl = `${window.location.origin}/dashboard/coach/settings?tab=subscription&stripe=connect`;

      const { data, error } = await supabase.functions.invoke("stripe-connect-onboard", {
        body: {
          coachId,
          userId: user.id,
          returnUrl,
          // Pass existing account ID to avoid creating duplicates
          existingAccountId: coachProfile?.stripe_connect_id || null,
        },
      });

      if (error) throw error;

      if (data.onboardingUrl) {
        // Save the account ID before redirecting (only if new)
        if (!coachProfile?.stripe_connect_id) {
          await supabase
            .from("coach_profiles")
            .update({ stripe_connect_id: data.accountId })
            .eq("id", coachId);
        }

        // Redirect to Stripe onboarding
        window.location.href = data.onboardingUrl;
      }
    } catch (error) {
      console.error("Error connecting Stripe:", error);
      toast.error("Failed to start Stripe setup");
    } finally {
      setIsLoading(false);
    }
  };

  // Check URL params for returning from Stripe
  const urlParams = new URLSearchParams(window.location.search);
  const isReturningFromStripe = urlParams.get("stripe") === "connect";

  // Show loading skeleton while fetching profile
  if (isProfileLoading) {
    return (
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-4 w-44" />
          </div>
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-11 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (coachProfile?.stripe_connect_onboarded) {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="pt-4 sm:pt-6 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm sm:text-base">{t("stripeConnect.connected")}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t("stripeConnect.canReceivePayments")}
              </p>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-500/30 flex-shrink-0">
              {t("stripeConnect.active")}
            </Badge>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg glass-item">
            <Percent className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm">
              <span className="font-medium">{t("stripeConnect.platformFee", { percent: commissionPercent })}</span>
              <span className="text-muted-foreground ml-1">
                {t("stripeConnect.planLabel", { plan: tierData.name })}
              </span>
            </span>
          </div>
          {currentTier !== "enterprise" && (
            <p className="text-xs text-muted-foreground">
              <Link to="/pricing" className="text-primary hover:underline">{t("stripeConnect.upgradePlan")}</Link>
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show verification status when returning from Stripe (webhook will complete the verification)
  if (isReturningFromStripe && coachProfile?.stripe_connect_id && !coachProfile?.stripe_connect_onboarded) {
    return (
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="text-center space-y-4 py-2">
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto animate-spin" />
            <div>
              <h3 className="font-semibold text-sm sm:text-base">{t("stripeConnect.verifying")}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {t("stripeConnect.verifyingDesc")}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => refetch()} 
              disabled={isLoading}
              className="w-full sm:w-auto min-h-[44px]"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("stripeConnect.checkStatus")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <CreditCard className="h-5 w-5" />
          {t("stripeConnect.title")}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {t("stripeConnect.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
          <p>• {t("stripeConnect.acceptPayments")}</p>
          <p>• {t("stripeConnect.automaticTransfers")}</p>
          <p>• {t("stripeConnect.secureCompliant")}</p>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10">
          <Percent className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-xs sm:text-sm">
            <span className="font-medium">{t("stripeConnect.platformFee", { percent: commissionPercent })}</span>
            <span className="text-muted-foreground ml-1">
              {t("stripeConnect.planLabel", { plan: tierData.name })}
            </span>
          </span>
        </div>
        {currentTier !== "enterprise" && (
          <p className="text-xs text-muted-foreground">
            <Link to="/pricing" className="text-primary hover:underline">{t("stripeConnect.upgradePlan")}</Link>
          </p>
        )}
        
        <Button 
          onClick={handleConnect} 
          disabled={isLoading} 
          className="w-full min-h-[44px] text-sm sm:text-base"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4 mr-2" />
          )}
          {t("stripeConnect.connectButton")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StripeConnectButton;
