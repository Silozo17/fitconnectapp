import { useState } from "react";
import { CreditCard, ExternalLink, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface StripeConnectButtonProps {
  coachId: string;
  onSuccess?: () => void;
}

const StripeConnectButton = ({ coachId, onSuccess }: StripeConnectButtonProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Check if already connected
  const { data: coachProfile, refetch } = useQuery({
    queryKey: ["coach-stripe-status", coachId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_profiles")
        .select("stripe_connect_id, stripe_connect_onboarded")
        .eq("id", coachId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

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

  const handleCompleteOnboarding = async () => {
    if (!coachProfile?.stripe_connect_id) return;

    setIsLoading(true);
    try {
      // Mark as onboarded (in real scenario, this would be done by webhook)
      await supabase
        .from("coach_profiles")
        .update({ stripe_connect_onboarded: true })
        .eq("id", coachId);

      toast.success("Stripe account connected successfully!");
      refetch();
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to complete setup");
    } finally {
      setIsLoading(false);
    }
  };

  // Check URL params for returning from Stripe
  const urlParams = new URLSearchParams(window.location.search);
  const isReturningFromStripe = urlParams.get("stripe") === "connect";
  const wasSuccessful = urlParams.get("success") === "true";

  if (coachProfile?.stripe_connect_onboarded) {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
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
        </CardContent>
      </Card>
    );
  }

  if (isReturningFromStripe && wasSuccessful && coachProfile?.stripe_connect_id) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <h3 className="font-semibold">Almost there!</h3>
              <p className="text-sm text-muted-foreground">
                Click below to complete your Stripe setup
              </p>
            </div>
            <Button onClick={handleCompleteOnboarding} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Complete Setup
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
          Connect Stripe
        </CardTitle>
        <CardDescription>
          Connect your Stripe account to receive payments from clients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Accept credit/debit card payments</p>
          <p>• Automatic transfers to your bank account</p>
          <p>• Secure and PCI compliant</p>
          <p>• 15% platform fee on transactions</p>
        </div>
        
        <Button onClick={handleConnect} disabled={isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4 mr-2" />
          )}
          Connect with Stripe
        </Button>
      </CardContent>
    </Card>
  );
};

export default StripeConnectButton;
