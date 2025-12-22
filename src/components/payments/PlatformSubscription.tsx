import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { SUBSCRIPTION_TIERS, TierKey, normalizeTier, getTierPosition } from "@/lib/stripe-config";
import { useActivePricing } from "@/hooks/useActivePricing";

interface PlatformSubscriptionProps {
  coachId: string;
  currentTier?: string;
}

const PlatformSubscription = ({ coachId, currentTier = "free" }: PlatformSubscriptionProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const pricing = useActivePricing();

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

  const handleSubscribe = (tierKey: TierKey) => {
    navigate(`/subscribe?tier=${tierKey}&billing=monthly`);
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

  const activeTier = normalizeTier(subscription?.tier || currentTier);
  const currentPosition = getTierPosition(activeTier);

  const getButtonConfig = (tierKey: TierKey) => {
    const targetPosition = getTierPosition(tierKey);
    if (targetPosition > currentPosition) {
      return { text: "Upgrade", variant: "default" as const };
    }
    if (targetPosition < currentPosition) {
      return { text: "Downgrade", variant: "outline" as const };
    }
    return { text: "Current", variant: "outline" as const };
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.entries(SUBSCRIPTION_TIERS) as [TierKey, typeof SUBSCRIPTION_TIERS[TierKey]][])
            .filter(([tierKey, tier]) => !tier.adminOnly || activeTier === tierKey)
            .map(([tierKey, tier]) => {
              const isCurrentTier = activeTier === tierKey;
              const isLoading = loadingTier === tierKey;
              const buttonConfig = getButtonConfig(tierKey);
              const isFreeToFree = tierKey === "free" && activeTier === "free";

              return (
                <div
                  key={tierKey}
                  className={cn(
                    "border rounded-lg p-4 relative transition-all",
                    isCurrentTier 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50",
                    tier.highlighted && "ring-2 ring-primary"
                  )}
                >
                  {isCurrentTier && (
                    <Badge className="absolute -top-2 right-2">Current Plan</Badge>
                  )}
                  {tier.highlighted && !isCurrentTier && (
                    <Badge variant="secondary" className="absolute -top-2 right-2">Popular</Badge>
                  )}
                  
                  <h3 className="font-semibold text-lg mb-1">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold">
                      {tier.prices.monthly.amount === 0 
                        ? "Free" 
                        : (['starter', 'pro', 'enterprise'].includes(tierKey)
                            ? pricing.formatPrice(pricing.getSubscriptionPrice(tierKey as 'starter' | 'pro' | 'enterprise', 'monthly'))
                            : `${pricing.currencySymbol}${tier.prices.monthly.amount}`)}
                    </span>
                    {tier.prices.monthly.amount > 0 && (
                      <span className="text-muted-foreground">/month</span>
                    )}
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
                    activeTier !== "free" ? (
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
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    )
                  ) : tierKey === "free" ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleManageSubscription}
                      disabled={loadingTier === "manage"}
                    >
                      {loadingTier === "manage" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Downgrade
                    </Button>
                  ) : (
                    <Button
                      variant={buttonConfig.variant}
                      className="w-full"
                      onClick={() => handleSubscribe(tierKey)}
                      disabled={!!loadingTier}
                    >
                      {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {buttonConfig.text}
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
