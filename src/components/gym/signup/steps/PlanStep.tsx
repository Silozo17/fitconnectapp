import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Calendar, ArrowLeft } from "lucide-react";
import { useSignupWizard } from "../SignupWizardContext";

interface MembershipPlan {
  id: string;
  name: string;
  description: string | null;
  price_amount: number;
  currency: string;
  billing_interval: string | null;
  billing_interval_count: number;
  plan_type: string;
  features: string[] | null;
  class_credits: number | null;
  unlimited_classes: boolean;
  trial_days: number | null;
  locations_access: string[] | null;
}

interface PlanStepProps {
  plans: MembershipPlan[];
  isLoading: boolean;
  onNext: () => void;
  onBack: () => void;
}

export function PlanStep({ plans, isLoading, onNext, onBack }: PlanStepProps) {
  const { formData, updateFormData } = useSignupWizard();

  // Filter plans by selected location
  const filteredPlans = plans.filter((plan) => {
    if (!plan.locations_access || plan.locations_access.length === 0) {
      return true; // No location restriction
    }
    return plan.locations_access.includes(formData.locationId!);
  });

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

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (filteredPlans.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No membership plans available for this location.
            </p>
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choose Your Membership</h2>
        <p className="text-muted-foreground">Select the plan that suits you best</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {filteredPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`cursor-pointer transition-all ${
              formData.planId === plan.id
                ? "ring-2 ring-primary border-primary"
                : "hover:border-primary/50"
            }`}
            onClick={() => updateFormData({ planId: plan.id })}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {plan.trial_days && plan.trial_days > 0 && (
                  <Badge variant="secondary">{plan.trial_days} day trial</Badge>
                )}
              </div>
              {plan.description && (
                <CardDescription>{plan.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-bold">
                  {formatPrice(plan.price_amount, plan.currency)}
                </span>
                <span className="text-muted-foreground ml-1">
                  {formatInterval(plan.billing_interval, plan.billing_interval_count)}
                </span>
              </div>

              <div className="space-y-2">
                {plan.unlimited_classes ? (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Unlimited classes</span>
                  </div>
                ) : plan.class_credits ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{plan.class_credits} class credits</span>
                  </div>
                ) : null}

                {plan.features?.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant={formData.planId === plan.id ? "default" : "outline"}
                className="w-full"
              >
                {formData.planId === plan.id ? "Selected" : "Select Plan"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!formData.planId}>
          Continue
        </Button>
      </div>
    </div>
  );
}
