import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  CheckCircle, 
  Dumbbell, 
  Calendar, 
  CreditCard, 
  ArrowRight,
  Loader2,
  Shield
} from "lucide-react";

interface MembershipPlan {
  id: string;
  name: string;
  description: string | null;
  price_amount: number;
  currency: string;
  billing_interval: string;
  billing_interval_count: number;
  plan_type: string;
  features: string[] | null;
  class_credits: number | null;
  unlimited_classes: boolean;
  trial_days: number | null;
  is_active: boolean;
}

interface GymProfile {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  stripe_account_status: string | null;
}

export default function GymMemberSignup() {
  const { gymSlug } = useParams<{ gymSlug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check for success/cancel from Stripe
  const sessionId = searchParams.get("session_id");
  const cancelled = searchParams.get("cancelled");

  // Fetch gym profile
  const { data: gym, isLoading: gymLoading } = useQuery({
    queryKey: ["public-gym", gymSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gym_profiles")
        .select("id, name, slug, logo_url, description, stripe_account_status")
        .eq("slug", gymSlug)
        .eq("status", "active")
        .single();

      if (error) throw error;
      return data as GymProfile;
    },
    enabled: !!gymSlug,
  });

  // Fetch membership plans
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["gym-plans", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return [];

      const { data, error } = await supabase
        .from("membership_plans")
        .select("*")
        .eq("gym_id", gym.id)
        .eq("is_active", true)
        .order("price_amount", { ascending: true });

      if (error) throw error;
      return data as MembershipPlan[];
    },
    enabled: !!gym?.id,
  });

  // Handle successful checkout return
  useEffect(() => {
    if (sessionId) {
      toast.success("Welcome! Your membership is now active.");
      // Clear the URL params
      navigate(`/club/${gymSlug}/signup?success=true`, { replace: true });
    }
    if (cancelled) {
      toast.info("Checkout was cancelled. You can try again.");
    }
  }, [sessionId, cancelled, gymSlug, navigate]);

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatInterval = (interval: string, count: number) => {
    if (count === 1) return `per ${interval}`;
    return `every ${count} ${interval}s`;
  };

  const handleCheckout = async () => {
    if (!selectedPlanId || !gym) return;

    if (!isAuthenticated) {
      // Redirect to auth with return URL
      toast.info("Please sign in or create an account to continue");
      navigate(`/auth?redirect=/club/${gymSlug}/signup`);
      return;
    }

    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("gym-create-membership-checkout", {
        body: {
          gymId: gym.id,
          planId: selectedPlanId,
          successUrl: `${window.location.origin}/club/${gymSlug}/signup`,
          cancelUrl: `${window.location.origin}/club/${gymSlug}/signup?cancelled=true`,
        },
      });

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

  if (gymLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Gym Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The gym you're looking for doesn't exist or is not active.
            </p>
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedPlan = plans?.find(p => p.id === selectedPlanId);
  const stripeReady = gym.stripe_account_status === "active";

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <div className="flex items-center gap-4">
            {gym.logo_url && (
              <img 
                src={gym.logo_url} 
                alt={gym.name} 
                className="h-16 w-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{gym.name}</h1>
              <p className="text-muted-foreground">Choose your membership plan</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto py-8 px-4">
        {searchParams.get("success") === "true" ? (
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Welcome to {gym.name}!</h2>
              <p className="text-muted-foreground mb-6">
                Your membership is now active. You're all set to start training!
              </p>
              <Button asChild>
                <Link to={`/gym-portal/${gym.id}`}>
                  Go to Member Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {!stripeReady && (
              <Card className="mb-6 border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-amber-600" />
                    <p className="text-amber-800">
                      This gym is still setting up online payments. Please contact them directly to sign up.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {plansLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2].map(i => <Skeleton key={i} className="h-80" />)}
              </div>
            ) : plans && plans.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {plans.map(plan => (
                    <Card 
                      key={plan.id}
                      className={`cursor-pointer transition-all ${
                        selectedPlanId === plan.id 
                          ? "ring-2 ring-primary border-primary" 
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => stripeReady && setSelectedPlanId(plan.id)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{plan.name}</CardTitle>
                          {plan.trial_days && plan.trial_days > 0 && (
                            <Badge variant="secondary">
                              {plan.trial_days} day trial
                            </Badge>
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
                          variant={selectedPlanId === plan.id ? "default" : "outline"}
                          className="w-full"
                          disabled={!stripeReady}
                        >
                          {selectedPlanId === plan.id ? "Selected" : "Select Plan"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {selectedPlan && stripeReady && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Complete Your Membership
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{selectedPlan.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatInterval(selectedPlan.billing_interval, selectedPlan.billing_interval_count)}
                            </p>
                          </div>
                          <p className="text-xl font-bold">
                            {formatPrice(selectedPlan.price_amount, selectedPlan.currency)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Checkbox 
                          id="terms" 
                          checked={agreedToTerms}
                          onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                        />
                        <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                          I agree to the membership terms and conditions, cancellation policy, 
                          and authorize recurring payments for my subscription.
                        </Label>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleCheckout}
                        disabled={!agreedToTerms || isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : isAuthenticated ? (
                          <>
                            Continue to Payment
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Sign In & Continue
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Membership Plans Available</h2>
                  <p className="text-muted-foreground">
                    This gym hasn't set up any membership plans yet. Please contact them directly.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
