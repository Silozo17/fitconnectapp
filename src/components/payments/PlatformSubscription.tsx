import { useState } from "react";
import { Crown, Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface PlatformTier {
  name: string;
  price: number;
  features: string[];
}

interface PlatformSubscriptionProps {
  coachId: string;
  currentTier?: string;
}

const TIERS: Record<string, PlatformTier> = {
  starter: {
    name: "Starter",
    price: 19,
    features: ["Up to 10 clients", "Basic analytics", "Email support"],
  },
  pro: {
    name: "Pro",
    price: 49,
    features: ["Unlimited clients", "Advanced analytics", "Priority support", "Custom branding"],
  },
  enterprise: {
    name: "Enterprise",
    price: 99,
    features: ["Everything in Pro", "API access", "Dedicated account manager", "White-label options"],
  },
};

const PlatformSubscription = ({ coachId, currentTier = "free" }: PlatformSubscriptionProps) => {
  const { user } = useAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const { data: subscription } = useQuery({
    queryKey: ["platform-subscription", coachId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_subscriptions")
        .select("*")
        .eq("coach_id", coachId)
        .maybeSingle();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  const handleSubscribe = async (tier: string) => {
    if (!user) return;

    setLoadingTier(tier);
    try {
      const successUrl = `${window.location.origin}/dashboard/coach/settings?subscription=success`;
      const cancelUrl = `${window.location.origin}/dashboard/coach/settings?subscription=cancelled`;

      const { data, error } = await supabase.functions.invoke("stripe-platform-subscription", {
        body: {
          action: "create-checkout",
          coachId,
          userId: user.id,
          email: user.email,
          tier,
          successUrl,
          cancelUrl,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to start subscription");
    } finally {
      setLoadingTier(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setLoadingTier("manage");
    try {
      const returnUrl = `${window.location.origin}/dashboard/coach/settings`;

      const { data, error } = await supabase.functions.invoke("stripe-platform-subscription", {
        body: {
          action: "get-portal-link",
          coachId,
          email: user.email,
          successUrl: returnUrl,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
      toast.error("Failed to open billing portal");
    } finally {
      setLoadingTier(null);
    }
  };

  const activeTier = subscription?.tier || currentTier;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Platform Subscription
        </CardTitle>
        <CardDescription>
          Choose a plan to unlock more features and grow your coaching business
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(TIERS).map(([tierKey, tier]) => {
            const isCurrentTier = activeTier === tierKey;
            const isLoading = loadingTier === tierKey;

            return (
              <div
                key={tierKey}
                className={cn(
                  "border rounded-lg p-4 relative transition-all",
                  isCurrentTier 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                )}
              >
                {isCurrentTier && (
                  <Badge className="absolute -top-2 right-2">Current Plan</Badge>
                )}
                
                <h3 className="font-semibold text-lg mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold">£{tier.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>

                <ul className="space-y-2 mb-4">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentTier ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleManageSubscription}
                    disabled={loadingTier === "manage"}
                  >
                    {loadingTier === "manage" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Manage Subscription
                  </Button>
                ) : (
                  <Button
                    variant={tierKey === "pro" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleSubscribe(tierKey)}
                    disabled={!!loadingTier}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {activeTier === "free" ? "Subscribe" : "Upgrade"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformSubscription;
