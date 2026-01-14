import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CreditCard, Loader2, CheckCircle, Calendar, MapPin } from "lucide-react";
import { useSignupWizard } from "../SignupWizardContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleCheckout = async () => {
    if (!plan || !gymId) return;

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke(
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
            successUrl: `${window.location.origin}/club/${gymSlug}/signup?success=true`,
            cancelUrl: `${window.location.origin}/club/${gymSlug}/signup?cancelled=true`,
          },
        }
      );

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!plan) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Complete Your Membership</h2>
        <p className="text-muted-foreground">Review your details and proceed to payment</p>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
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
          <div className="space-y-2 text-sm">
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
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>{formData.signedContractIds.length} agreement(s) accepted</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Secure Payment via Stripe</p>
              <p className="text-sm text-muted-foreground">
                You'll be redirected to our secure payment page to complete your membership.
                Your payment details are handled securely by Stripe.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button size="lg" onClick={handleCheckout} disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              {plan.trial_days && plan.trial_days > 0
                ? "Start Free Trial"
                : "Complete Payment"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
