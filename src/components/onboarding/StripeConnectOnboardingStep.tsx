import { useState, useEffect, useRef } from "react";
import { CreditCard, ExternalLink, Loader2, CheckCircle, AlertTriangle, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { SUBSCRIPTION_TIERS, TierKey } from "@/lib/stripe-config";
import { useTranslation } from "react-i18next";
import { OnboardingConfirmSheet } from "./OnboardingConfirmSheet";

type StripeStatus = "pending" | "connected" | "skipped";

interface StripeConnectOnboardingStepProps {
  coachId: string;
  onComplete: () => void;
  onSkip: () => void;
  onBack: () => void;
}

const StripeConnectOnboardingStep = ({ coachId, onComplete, onSkip, onBack }: StripeConnectOnboardingStepProps) => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<StripeStatus>("pending");
  const [isReturningFromStripe, setIsReturningFromStripe] = useState(false);
  
  // 2-phase skip pattern: pendingSkip triggers navigation after sheet closes
  const [pendingSkip, setPendingSkip] = useState(false);
  const skipCalledRef = useRef(false);
  
  // Store callbacks in refs to prevent stale closures and avoid useEffect re-triggers
  const onSkipRef = useRef(onSkip);
  const onBackRef = useRef(onBack);
  useEffect(() => {
    onSkipRef.current = onSkip;
    onBackRef.current = onBack;
  }, [onSkip, onBack]);

  // Parse URL params once on mount - not on every render
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isReturning = urlParams.get("stripe") === "returning";
    setIsReturningFromStripe(isReturning);
  }, []);

  // Only query Stripe status when not skipped
  const { data: coachProfile, refetch, isLoading: isProfileLoading } = useQuery({
    queryKey: ["coach-stripe-onboarding", coachId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_profiles")
        .select("stripe_connect_id, stripe_connect_onboarded, subscription_tier")
        .eq("id", coachId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!coachId && stripeStatus !== "skipped",
  });

  // Update stripeStatus when profile shows connected
  useEffect(() => {
    if (coachProfile?.stripe_connect_onboarded && stripeStatus === "pending") {
      setStripeStatus("connected");
    }
  }, [coachProfile?.stripe_connect_onboarded, stripeStatus]);

  // Phase 2: Execute skip AFTER sheet is fully closed
  // Uses double-RAF to ensure sheet animation completes before navigation
  useEffect(() => {
    if (pendingSkip && !showSkipWarning && !skipCalledRef.current) {
      skipCalledRef.current = true;
      // Double requestAnimationFrame ensures sheet animation is fully complete
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setStripeStatus("skipped");
          onSkipRef.current(); // Use ref to avoid stale closure
        });
      });
    }
    // Intentionally omit onSkip from deps - we use onSkipRef instead
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSkip, showSkipWarning]);

  // Get current commission rate based on tier
  const rawTier = coachProfile?.subscription_tier || "free";
  const currentTier: TierKey = (rawTier in SUBSCRIPTION_TIERS) ? rawTier as TierKey : "free";
  const tierData = SUBSCRIPTION_TIERS[currentTier];
  const commissionPercent = tierData?.commissionPercent || 4;

  const handleConnect = async () => {
    if (!user || stripeStatus === "skipped") return;

    setIsLoading(true);
    try {
      const returnUrl = `${window.location.origin}/onboarding/coach?stripe=returning`;

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
      toast.error(t('onboarding.failedStartStripe'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!coachProfile?.stripe_connect_id || stripeStatus === "skipped") return;

    setIsLoading(true);
    try {
      await supabase
        .from("coach_profiles")
        .update({ 
          stripe_connect_onboarded: true,
          onboarding_progress: supabase.rpc ? undefined : { stripe_connected: true }
        })
        .eq("id", coachId);

      toast.success(t('onboarding.stripeSuccess'));
      setStripeStatus("connected");
      refetch();
      onComplete();
    } catch (error) {
      toast.error(t('onboarding.failedCompleteSetup'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipClick = () => {
    setShowSkipWarning(true);
  };

  // Phase 1: Only close the sheet and set pending flag - DO NOT navigate here
  const handleConfirmSkip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close sheet first, set pending flag - navigation happens in useEffect
    setPendingSkip(true);
    setShowSkipWarning(false);
  };

  // Show minimal loading UI when skipped - prevents unmount-before-navigation issues
  if (stripeStatus === "skipped") {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show loading skeleton while fetching profile
  if (isProfileLoading) {
    return (
      <div className="space-y-5">
        <div className="mb-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-11 w-full" />
        <div className="flex gap-3">
          <Skeleton className="h-11 flex-1" />
          <Skeleton className="h-11 flex-1" />
        </div>
      </div>
    );
  }

  if (stripeStatus === "connected" || coachProfile?.stripe_connect_onboarded) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">
            {t('onboarding.paymentSetupComplete')}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">{t('onboarding.stripeReady')}</p>
        </div>

        <div className="p-4 sm:p-6 rounded-xl bg-green-500/10 border-2 border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm sm:text-base">{t('onboarding.stripeConnected')}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('onboarding.canReceivePayments')}
              </p>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-500/30 flex-shrink-0">
              {t('status.active')}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 sm:p-4 rounded-xl bg-secondary">
          <Percent className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          <span className="text-xs sm:text-sm">
            <span className="font-medium">{commissionPercent}%</span> {t('onboarding.platformFee', { percent: '' }).replace('{{percent}}%', '')}
            <span className="text-muted-foreground ml-1">({tierData?.name || 'Free'} {t('onboarding.plan')})</span>
          </span>
        </div>

        <Button onClick={onComplete} className="w-full bg-primary text-primary-foreground min-h-[44px]">
          {t('actions.continue')}
        </Button>
      </div>
    );
  }

  if (isReturningFromStripe && coachProfile?.stripe_connect_id) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">
            {t('onboarding.almostThere')}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">{t('onboarding.completeStripeSetup')}</p>
        </div>

        <div className="p-4 sm:p-6 rounded-xl bg-primary/10 border-2 border-primary/30 text-center">
          <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
          <p className="font-medium text-foreground mb-2 text-sm sm:text-base">{t('onboarding.stripeAccountCreated')}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t('onboarding.clickFinalize')}
          </p>
        </div>

        <Button 
          onClick={handleCompleteOnboarding} 
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground min-h-[44px]"
        >
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {t('onboarding.completeSetup')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="mb-3 sm:mb-4">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          {t('onboarding.connectPayment')}
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1.5">
          {t('onboarding.connectStripeDesc')}
        </p>
      </div>

      <div className="p-4 sm:p-6 rounded-xl bg-secondary">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#635BFF] flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground mb-2 text-sm sm:text-base">{t('onboarding.whyConnectStripe')}</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{t('onboarding.acceptCards')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{t('onboarding.automaticTransfers')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{t('onboarding.securePayments')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 sm:p-4 rounded-xl bg-primary/10">
        <Percent className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
        <span className="text-xs sm:text-sm">
          {t('onboarding.platformFee', { percent: commissionPercent })}
          <span className="text-muted-foreground ml-1">({tierData?.name || 'Free'} {t('onboarding.plan')})</span>
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <Button 
          type="button"
          onClick={handleConnect} 
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground min-h-[44px]"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4 mr-2" />
          )}
          {t('onboarding.connectStripe')}
        </Button>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onBackRef.current()}
            className="flex-1 min-h-[44px]"
          >
            {t('onboarding.goBack')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSkipClick}
            className="flex-1 min-h-[44px]"
          >
            {t('onboarding.setUpLater')}
          </Button>
        </div>
      </div>

      {/* Skip confirmation bottom sheet */}
      <OnboardingConfirmSheet
        open={showSkipWarning}
        onOpenChange={setShowSkipWarning}
        title={t('onboarding.skipWarningTitle')}
        description={t('onboarding.skipWarningMessage')}
        icon={<AlertTriangle className="w-6 h-6" />}
        variant="warning"
        confirmLabel={t('onboarding.skipAnyway')}
        cancelLabel={t('onboarding.goBack')}
        onConfirm={handleConfirmSkip}
        onCancel={() => setShowSkipWarning(false)}
      />
    </div>
  );
};

export default StripeConnectOnboardingStep;
