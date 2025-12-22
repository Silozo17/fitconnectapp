import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CreditCard, ExternalLink, Loader2, CheckCircle, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const { data: coachProfile, refetch } = useQuery({
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
      const returnUrl = `${window.location.origin}/dashboard/coach/settings?stripe=connect`;

      const { data, error } = await supabase.functions.invoke("stripe-connect-onboard", {
        body: {
          coachId,
          userId: user.id,
          returnUrl,
        },
      });

      if (error) throw error;

      if (data.onboardingUrl) {
        // Save the account ID before redirecting
        await supabase
          .from("coach_profiles")
          .update({ stripe_connect_id: data.accountId })
          .eq("id", coachId);

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

  if (coachProfile?.stripe_connect_onboarded) {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{t("stripeConnect.connected")}</p>
              <p className="text-sm text-muted-foreground">
                {t("stripeConnect.canReceivePayments")}
              </p>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-500/30">
              {t("stripeConnect.active")}
            </Badge>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Percent className="w-4 h-4 text-primary" />
            <span className="text-sm">
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
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
            <div>
              <h3 className="font-semibold">{t("stripeConnect.verifying")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("stripeConnect.verifyingDesc")}
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t("stripeConnect.title")}
        </CardTitle>
        <CardDescription>
          {t("stripeConnect.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• {t("stripeConnect.acceptPayments")}</p>
          <p>• {t("stripeConnect.automaticTransfers")}</p>
          <p>• {t("stripeConnect.secureCompliant")}</p>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10">
          <Percent className="w-4 h-4 text-primary" />
            <span className="text-sm">
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
        
        <Button onClick={handleConnect} disabled={isLoading} className="w-full">
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
