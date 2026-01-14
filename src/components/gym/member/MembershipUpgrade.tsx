import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGym } from "@/contexts/GymContext";
import { useMyGymMembership, useGymCustomerPortal } from "@/hooks/gym/useGymMembership";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreditCard,
  Check,
  ArrowRight,
  Star,
  Loader2,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";

interface MembershipPlan {
  id: string;
  name: string;
  description: string | null;
  price_amount: number;
  currency: string;
  billing_interval: string;
  features: string[] | null;
  is_featured: boolean;
  class_credits: number | null;
  unlimited_classes: boolean;
}

export function MembershipUpgrade() {
  const { user } = useAuth();
  const { gym } = useGym();
  const { data: currentMembership, isLoading: loadingMembership } = useMyGymMembership();
  const customerPortal = useGymCustomerPortal();

  // Fetch available plans
  const { data: plans, isLoading: loadingPlans } = useQuery({
    queryKey: ["gym-membership-plans", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return [];

      const { data, error } = await supabase
        .from("membership_plans")
        .select(`
          id,
          name,
          description,
          price_amount,
          currency,
          billing_interval,
          features,
          is_featured,
          class_credits,
          unlimited_classes
        `)
        .eq("gym_id", gym.id)
        .eq("is_active", true)
        .order("price_amount", { ascending: true });

      if (error) throw error;
      return (data || []) as MembershipPlan[];
    },
    enabled: !!gym?.id,
  });

  const isLoading = loadingMembership || loadingPlans;
  const currentPlanId = currentMembership?.plan?.id;

  const handleManageSubscription = () => {
    customerPortal.mutate({ returnUrl: window.location.href });
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Membership</CardTitle>
          <CardDescription>
            Your active membership plan and billing details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingMembership ? (
            <Skeleton className="h-24" />
          ) : currentMembership ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {currentMembership.plan?.name || "Membership"}
                    <Badge variant="default">Active</Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentMembership.plan?.billing_interval === "month" 
                      ? "Billed monthly" 
                      : currentMembership.plan?.billing_interval === "year"
                      ? "Billed annually"
                      : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Next billing</p>
                  <p className="font-medium">
                    {currentMembership.current_period_end
                      ? format(new Date(currentMembership.current_period_end), "MMM d, yyyy")
                      : "—"}
                  </p>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleManageSubscription}
                disabled={customerPortal.isPending}
              >
                {customerPortal.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Manage Billing & Payment
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No active membership</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Available Plans</h2>
          <p className="text-muted-foreground">
            Upgrade or change your membership plan
          </p>
        </div>

        {loadingPlans ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)}
          </div>
        ) : plans && plans.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlanId;
              const features = Array.isArray(plan.features) ? plan.features : [];

              return (
                <Card 
                  key={plan.id}
                  className={`relative ${plan.is_featured ? "border-primary shadow-md" : ""} ${isCurrent ? "ring-2 ring-primary" : ""}`}
                >
                  {plan.is_featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="gap-1">
                        <Star className="h-3 w-3" />
                        Popular
                      </Badge>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3 right-4">
                      <Badge variant="secondary">Current Plan</Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pt-6">
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-3xl font-bold">
                        {formatPrice(plan.price_amount / 100, plan.currency)}
                      </span>
                      <span className="text-muted-foreground">
                        /{plan.billing_interval}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {plan.unlimited_classes && (
                        <div className="flex items-center gap-2 text-sm">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="font-medium">Unlimited classes</span>
                        </div>
                      )}
                      {plan.class_credits && !plan.unlimited_classes && (
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>{plan.class_credits} credits per {plan.billing_interval}</span>
                        </div>
                      )}
                      {features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    {isCurrent ? (
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button 
                        variant={plan.is_featured ? "default" : "outline"} 
                        className="w-full"
                        onClick={handleManageSubscription}
                        disabled={customerPortal.isPending}
                      >
                        {customerPortal.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            {currentPlanId ? "Switch Plan" : "Get Started"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>No membership plans available at this time.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
