import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CreditCard, Loader2, CheckCircle, Calendar, MapPin, AlertCircle } from "lucide-react";
import { useSignupWizard } from "../SignupWizardContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";

interface MembershipPlan {
  id: string;
  name: string;
  description: string | null;
  price_amount: number;
  currency: string;
  billing_interval: string | null;
  billing_interval_count: number;
  trial_days: number | null;
}

interface Location {
  id: string;
  name: string;
}

interface PaymentStepProps {
  plan: MembershipPlan | undefined;
  location: Location | undefined;
  gymId: string;
  gymSlug: string;
  onBack: () => void;
}

export function PaymentStep({ plan, location, gymId, gymSlug, onBack }: PaymentStepProps) {
  const { formData } = useSignupWizard();
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
  const [isLoadingStripe, setIsLoadingStripe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatInterval = (interval: string | null, count: number) => {
    if (!interval) return "";
    if (count === 1) return `per ${interval}`;
    return `every ${count} ${interval}s`;
  };

  // Initialize Stripe
  useEffect(() => {
    async function initStripe() {
      try {
        setIsLoadingStripe(true);
        const { data, error: configError } = await supabase.functions.invoke("get-stripe-config");
        
        if (configError) throw configError;
        if (!data?.publishableKey) throw new Error("Failed to get Stripe configuration");

        const stripe = await loadStripe(data.publishableKey);
        setStripePromise(Promise.resolve(stripe));
      } catch (err) {
        console.error("Failed to initialize Stripe:", err);
        setError("Failed to initialize payment system. Please try again.");
      } finally {
        setIsLoadingStripe(false);
      }
    }

    initStripe();
  }, []);

  // Create checkout session and get client secret
  const fetchClientSecret = useCallback(async () => {
    if (!plan || !gymId) {
      throw new Error("Missing plan or gym information");
    }

    try {
      const { data, error: checkoutError } = await supabase.functions.invoke(
        "gym-create-membership-checkout",
        {
          body: {
            gymId,
            planId: plan.id,
            locationId: formData.locationId,
            memberData: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              dateOfBirth: formData.dateOfBirth || null,
              gender: formData.gender || null,
              medicalConditions: formData.hasMedicalConditions ? formData.medicalConditions : null,
              injuries: formData.hasInjuries ? formData.injuries : null,
              emergencyContactName: formData.emergencyContactName,
              emergencyContactPhone: formData.emergencyContactPhone,
              emergencyContactRelation: formData.emergencyContactRelation || null,
              referredByEmail: formData.referredByEmail || null,
              marketingSource: formData.marketingSource,
              marketingSourceOther: formData.marketingSourceOther || null,
            },
            contractIds: formData.signedContractIds,
            signatureData: {
              name: formData.signatureName,
              date: formData.signatureDate,
              signature: formData.signatureData,
              type: formData.signatureType,
            },
            emailVerified: formData.emailVerified,
            embedded: true,
            successUrl: `${window.location.origin}/club/${gymSlug}/signup?success=true`,
            cancelUrl: `${window.location.origin}/club/${gymSlug}/signup?cancelled=true`,
          },
        }
      );

      if (checkoutError) throw checkoutError;
      
      if (data?.requiresOtp) {
        throw new Error("Email verification required. Please go back and verify your email.");
      }

      if (!data?.clientSecret) {
        throw new Error("Failed to create checkout session");
      }

      return data.clientSecret;
    } catch (err) {
      console.error("Checkout error:", err);
      const message = err instanceof Error ? err.message : "Failed to start checkout";
      toast.error(message);
      throw err;
    }
  }, [plan, gymId, gymSlug, formData]);

  if (!plan) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Complete Your Membership</h2>
        <p className="text-muted-foreground">Review your details and complete payment</p>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location */}
          {location && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{location.name}</span>
            </div>
          )}

          {/* Plan Details */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-lg">{plan.name}</p>
                {plan.description && (
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {formatPrice(plan.price_amount, plan.currency)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatInterval(plan.billing_interval, plan.billing_interval_count)}
                </p>
              </div>
            </div>

            {plan.trial_days && plan.trial_days > 0 && (
              <div className="flex items-center gap-2 mt-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-md border border-green-200 dark:border-green-800">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-400">
                  Includes a {plan.trial_days}-day free trial. You won't be charged until it ends.
                </span>
              </div>
            )}
          </div>

          {/* Member Info Summary */}
          <div className="space-y-2 text-sm border-t pt-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member:</span>
              <span>{formData.firstName} {formData.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span>{formData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span>{formData.phone}</span>
            </div>
          </div>

          {/* Contracts Signed */}
          {formData.signedContractIds.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-600 border-t pt-4">
              <CheckCircle className="h-4 w-4" />
              <span>{formData.signedContractIds.length} agreement(s) accepted</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Embedded Checkout */}
      <Card>
        <CardContent className="pt-6">
          {isLoadingStripe ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading payment form...</p>
            </div>
          ) : stripePromise ? (
            <div className="min-h-[400px]">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ fetchClientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load payment form. Please refresh and try again.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    </div>
  );
}
