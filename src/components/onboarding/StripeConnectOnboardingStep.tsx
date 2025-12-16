import { useState } from "react";
import { CreditCard, ExternalLink, Loader2, CheckCircle, AlertTriangle, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { SUBSCRIPTION_TIERS, TierKey } from "@/lib/stripe-config";

interface StripeConnectOnboardingStepProps {
  coachId: string;
  onComplete: () => void;
  onSkip: () => void;
}

const StripeConnectOnboardingStep = ({ coachId, onComplete, onSkip }: StripeConnectOnboardingStepProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSkipWarning, setShowSkipWarning] = useState(false);

  // Check if already connected
  const { data: coachProfile, refetch } = useQuery({
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
    enabled: !!coachId,
  });

  // Get current commission rate based on tier
  const rawTier = coachProfile?.subscription_tier || "free";
  const currentTier: TierKey = (rawTier in SUBSCRIPTION_TIERS) ? rawTier as TierKey : "free";
  const tierData = SUBSCRIPTION_TIERS[currentTier];
  const commissionPercent = tierData?.commissionPercent || 4;

  const handleConnect = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const returnUrl = `${window.location.origin}/onboarding/coach?stripe=returning`;

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

  const handleCompleteOnboarding = async () => {
    if (!coachProfile?.stripe_connect_id) return;

    setIsLoading(true);
    try {
      await supabase
        .from("coach_profiles")
        .update({ 
          stripe_connect_onboarded: true,
          onboarding_progress: supabase.rpc ? undefined : { stripe_connected: true }
        })
        .eq("id", coachId);

      toast.success("Stripe account connected successfully!");
      refetch();
      onComplete();
    } catch (error) {
      toast.error("Failed to complete setup");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipClick = () => {
    if (!showSkipWarning) {
      setShowSkipWarning(true);
      return;
    }
    onSkip();
  };

  // Check URL params for returning from Stripe
  const urlParams = new URLSearchParams(window.location.search);
  const isReturningFromStripe = urlParams.get("stripe") === "returning";
  const wasSuccessful = urlParams.get("success") === "true";

  if (coachProfile?.stripe_connect_onboarded) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Payment Setup Complete
          </h2>
          <p className="text-muted-foreground">Your Stripe account is connected and ready to receive payments.</p>
        </div>

        <div className="p-6 rounded-xl bg-green-500/10 border-2 border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Stripe Connected</p>
              <p className="text-sm text-muted-foreground">
                You can receive payments from clients
              </p>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-500/30">
              Active
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 p-4 rounded-xl bg-secondary">
          <Percent className="w-5 h-5 text-primary" />
          <span className="text-sm">
            <span className="font-medium">{commissionPercent}%</span> platform fee on transactions
            <span className="text-muted-foreground ml-1">({tierData?.name || 'Free'} plan)</span>
          </span>
        </div>

        <Button onClick={onComplete} className="w-full bg-primary text-primary-foreground">
          Continue
        </Button>
      </div>
    );
  }

  if (isReturningFromStripe && coachProfile?.stripe_connect_id) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Almost there!
          </h2>
          <p className="text-muted-foreground">Complete your Stripe setup to start receiving payments.</p>
        </div>

        <div className="p-6 rounded-xl bg-primary/10 border-2 border-primary/30 text-center">
          <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="font-medium text-foreground mb-2">Stripe account created</p>
          <p className="text-sm text-muted-foreground">
            Click below to finalize and activate your payment account
          </p>
        </div>

        <Button 
          onClick={handleCompleteOnboarding} 
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground"
        >
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Complete Setup
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Connect your payment account
        </h2>
        <p className="text-muted-foreground">
          Connect Stripe to receive payments directly to your bank account.
        </p>
      </div>

      <div className="p-6 rounded-xl bg-secondary">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#635BFF] flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground mb-2">Why connect Stripe?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                Accept credit/debit card payments instantly
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                Automatic transfers to your bank account
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                Secure, PCI-compliant payment processing
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-4 rounded-xl bg-primary/10">
        <Percent className="w-5 h-5 text-primary" />
        <span className="text-sm">
          <span className="font-medium">{commissionPercent}%</span> platform fee per transaction
          <span className="text-muted-foreground ml-1">({tierData?.name || 'Free'} plan)</span>
        </span>
      </div>

      {showSkipWarning && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-600">Are you sure?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Without Stripe, you won't be able to accept payments through FitConnect. 
                You can always set this up later in your settings.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleSkipClick}
          className="flex-1"
        >
          {showSkipWarning ? "Skip anyway" : "Set up later"}
        </Button>
        <Button 
          onClick={handleConnect} 
          disabled={isLoading}
          className="flex-1 bg-primary text-primary-foreground"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4 mr-2" />
          )}
          Connect Stripe
        </Button>
      </div>
    </div>
  );
};

export default StripeConnectOnboardingStep;
