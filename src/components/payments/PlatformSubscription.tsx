import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
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
import { useNativePricing } from "@/hooks/useNativePricing";
import { useNativeIAP, SubscriptionTier } from "@/hooks/useNativeIAP";
import { isDespia } from "@/lib/despia";
import { IAPUnsuccessfulDialog } from "@/components/iap/IAPUnsuccessfulDialog";

interface PlatformSubscriptionProps {
  coachId: string;
  currentTier?: string;
}

// Helper to translate feature keys
const translateFeature = (featureKey: string, t: TFunction, tPages: TFunction): string => {
  // featureKeys are like "pricing.tierFeatures.free.clients"
  // We need to extract the path and use tPages
  const match = featureKey.match(/^pricing\.tierFeatures\.(.+)$/);
  if (match) {
    return tPages(`pricing.tierFeatures.${match[1]}`);
  }
  return featureKey;
};

const PlatformSubscription = ({ coachId, currentTier = "free" }: PlatformSubscriptionProps) => {
  const { t } = useTranslation("settings");
  const { t: tPages } = useTranslation("pages");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  
  // Platform detection and pricing
  const isNativeApp = isDespia();
  const webPricing = useActivePricing();
  const nativePricing = useNativePricing();
  const pricing = isNativeApp ? nativePricing : webPricing;
  
  // Native IAP hook
  const { purchase: nativePurchase, state: iapState, dismissUnsuccessfulModal } = useNativeIAP();

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
    if (isNativeApp && ['starter', 'pro', 'enterprise'].includes(tierKey)) {
      // Trigger native IAP directly
      nativePurchase(tierKey as SubscriptionTier, 'monthly');
    } else {
      // Navigate to web checkout
      navigate(`/subscribe?tier=${tierKey}&billing=monthly&from=settings`);
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

  const activeTier = normalizeTier(subscription?.tier || currentTier);
  const currentPosition = getTierPosition(activeTier);

  const getButtonConfig = (tierKey: TierKey) => {
    const targetPosition = getTierPosition(tierKey);
    if (targetPosition > currentPosition) {
      return { text: t("subscription.upgrade"), variant: "default" as const };
    }
    if (targetPosition < currentPosition) {
      return { text: t("subscription.downgrade"), variant: "outline" as const };
    }
    return { text: t("subscription.current"), variant: "outline" as const };
  };

  // Check if any purchase is in progress
  const isPurchasing = iapState.purchaseStatus === 'purchasing' || iapState.isPolling;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            {t("subscription.platformSubscription")}
          </CardTitle>
          <CardDescription>
            {t("subscription.platformDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.entries(SUBSCRIPTION_TIERS) as [TierKey, typeof SUBSCRIPTION_TIERS[TierKey]][])
              .filter(([tierKey, tier]) => !tier.adminOnly || activeTier === tierKey)
              .map(([tierKey, tier]) => {
                const isCurrentTier = activeTier === tierKey;
                const isLoading = loadingTier === tierKey || (isPurchasing && loadingTier === null);
                const buttonConfig = getButtonConfig(tierKey);
                const isPricedTier = ['starter', 'pro', 'enterprise'].includes(tierKey);

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
                      <Badge className="absolute -top-2 right-2">{t("subscription.currentPlan")}</Badge>
                    )}
                    {tier.highlighted && !isCurrentTier && (
                      <Badge variant="secondary" className="absolute -top-2 right-2">{t("subscription.popular")}</Badge>
                    )}
                    
                    <h3 className="font-semibold text-lg mb-1">{tier.name}</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold">
                        {tier.prices.monthly.amount === 0 
                          ? t("subscription.free")
                          : (isPricedTier
                              ? pricing.formatPrice(pricing.getSubscriptionPrice(tierKey as SubscriptionTier, 'monthly'))
                              : `${pricing.currencySymbol}${tier.prices.monthly.amount}`)}
                      </span>
                      {tier.prices.monthly.amount > 0 && (
                        <span className="text-muted-foreground">{t("subscription.perMonth")}</span>
                      )}
                    </div>

                    <ul className="space-y-2 mb-4">
                      {tier.featureKeys.slice(0, 5).map((featureKey, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">{translateFeature(featureKey, t, tPages)}</span>
                        </li>
                      ))}
                      {tier.featureKeys.length > 5 && (
                        <li className="text-xs text-muted-foreground">
                          +{tier.featureKeys.length - 5} more features
                        </li>
                      )}
                    </ul>
                    
                    <a 
                      href="/pricing" 
                      className="text-xs text-muted-foreground underline hover:text-primary block mb-3"
                    >
                      See full feature comparison
                    </a>

                    {isCurrentTier ? (
                      activeTier !== "free" ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleManageSubscription}
                          disabled={loadingTier === "manage"}
                        >
                          {loadingTier === "manage" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          {t("subscription.manageSubscription")}
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full" disabled>
                          {t("subscription.currentPlan")}
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
                        {t("subscription.downgrade")}
                      </Button>
                    ) : (
                      <Button
                        variant={buttonConfig.variant}
                        className="w-full"
                        onClick={() => handleSubscribe(tierKey)}
                        disabled={!!loadingTier || isPurchasing}
                      >
                        {(isLoading || isPurchasing) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {buttonConfig.text}
                      </Button>
                    )}
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Native IAP unsuccessful dialog */}
      <IAPUnsuccessfulDialog 
        open={iapState.showUnsuccessfulModal} 
        onOpenChange={dismissUnsuccessfulModal}
      />
    </>
  );
};

export default PlatformSubscription;
