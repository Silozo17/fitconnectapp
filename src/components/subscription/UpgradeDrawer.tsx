import { useState, useCallback } from "react";
import { Check, X, Loader2, Dumbbell, Users, Brain, TrendingUp, Infinity, Headphones, Cog, MessageSquare, Sparkles, Crown, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNativeIAP } from "@/hooks/useNativeIAP";
import { useNativePricing } from "@/hooks/useNativePricing";
import { usePlatformRestrictions } from "@/hooks/usePlatformRestrictions";
import { IAPUnsuccessfulDialog } from "@/components/iap/IAPUnsuccessfulDialog";
import { FeaturesActivatedModal } from "@/components/subscription/FeaturesActivatedModal";
import { openExternalUrl, shouldOpenExternally } from "@/lib/external-links";
import { triggerConfetti, confettiPresets } from "@/lib/confetti";
import { triggerHaptic } from "@/lib/despia";
import { useQueryClient } from "@tanstack/react-query";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { supabase } from "@/integrations/supabase/client";
import { TierKey, SUBSCRIPTION_TIERS } from "@/lib/stripe-config";
import { SubscriptionTier, BillingInterval } from "@/lib/pricing-config";
import { cn } from "@/lib/utils";

// Tier configuration for display
const TIER_CONFIG: Record<SubscriptionTier, { icon: typeof Rocket; name: string; description: string; popular?: boolean }> = {
  starter: {
    icon: Rocket,
    name: "Starter",
    description: "Perfect for new coaches",
  },
  pro: {
    icon: Crown,
    name: "Pro",
    description: "For established coaches",
    popular: true,
  },
  enterprise: {
    icon: Sparkles,
    name: "Enterprise",
    description: "For elite coaches & gyms",
  },
};

// Dynamic benefits based on selected tier
const TIER_BENEFITS = {
  starter: [
    { icon: Users, text: "Manage up to 10 clients" },
    { icon: Dumbbell, text: "Workout plan builder" },
    { icon: MessageSquare, text: "Client messaging & scheduling" },
  ],
  pro: [
    { icon: Users, text: "Manage up to 50 clients" },
    { icon: Brain, text: "AI workout & meal planners" },
    { icon: TrendingUp, text: "Advanced analytics & insights" },
  ],
  enterprise: [
    { icon: Infinity, text: "Unlimited clients" },
    { icon: Headphones, text: "Priority support & account manager" },
    { icon: Cog, text: "Custom integrations & white-label" },
  ],
};

const DISPLAYABLE_TIERS: SubscriptionTier[] = ['starter', 'pro', 'enterprise'];

interface UpgradeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachId?: string;
}

export const UpgradeDrawer = ({ open, onOpenChange, coachId }: UpgradeDrawerProps) => {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('pro');
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [purchasedTier, setPurchasedTier] = useState<TierKey | null>(null);
  
  const { isNativeMobile } = usePlatformRestrictions();
  const nativePricing = useNativePricing();
  const queryClient = useQueryClient();
  
  // Get dynamic benefits for selected tier
  const benefits = TIER_BENEFITS[selectedTier] || TIER_BENEFITS.pro;
  
  // Handle successful IAP purchase
  const handleIAPSuccess = useCallback(async (tier: SubscriptionTier) => {
    triggerConfetti(confettiPresets.medium);
    triggerHaptic('success');
    
    localStorage.removeItem(STORAGE_KEYS.CACHED_TIER);
    
    queryClient.invalidateQueries({ queryKey: ['coach-onboarding-status'] });
    queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
    queryClient.invalidateQueries({ queryKey: ['feature-access'] });
    queryClient.invalidateQueries({ queryKey: ['coach-profile'] });
    
    setPurchasedTier(tier as TierKey);
    setShowFeaturesModal(true);
    setIsSubmitting(false);
    onOpenChange(false);
  }, [queryClient, onOpenChange]);
  
  const { state: iapState, purchase: iapPurchase, dismissUnsuccessfulModal, reconcileSubscription } = useNativeIAP({
    onPurchaseComplete: handleIAPSuccess,
  });
  
  const isProcessingIAP = iapState.purchaseStatus === 'purchasing' || iapState.isPolling;
  
  const handleRestorePurchases = useCallback(async () => {
    await reconcileSubscription();
  }, [reconcileSubscription]);
  
  const handlePurchase = async () => {
    if (!coachId) return;
    
    setIsSubmitting(true);
    
    if (isNativeMobile && iapState.isAvailable) {
      // Native IAP flow
      try {
        await iapPurchase(selectedTier, billingInterval);
      } catch (error) {
        console.error('[UpgradeDrawer] IAP purchase failed:', error);
        setIsSubmitting(false);
      }
    } else {
      // Web Stripe checkout flow
      try {
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
          body: {
            tier: selectedTier,
            interval: billingInterval,
            coachId,
          },
        });
        
        if (error) throw error;
        if (data?.url) {
          window.open(data.url, '_blank');
        }
      } catch (error) {
        console.error('[UpgradeDrawer] Checkout creation failed:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };
  
  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[100dvh] max-h-[100dvh] rounded-none border-0 bg-transparent">
          {/* Full-screen background image */}
          <div className="absolute inset-0">
            <img
              src="https://ntgfihgneyoxxbwmtceq.supabase.co/storage/v1/object/public/website-images/iap_image.webp"
              alt=""
              className="h-full w-full object-cover object-top"
            />
            {/* Gradient overlay - starts at ~45% to show hero image at top */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/98 via-[45%] to-transparent" />
          </div>

          {/* Close button - top right */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-20 rounded-full bg-background/50 p-2 backdrop-blur-sm transition-colors hover:bg-background/70"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-foreground/70" />
          </button>

          {/* Restore button - top left (native only) */}
          {isNativeMobile && (
            <button
              onClick={handleRestorePurchases}
              className="absolute left-4 top-4 z-20 rounded-full bg-background/50 px-3 py-2 text-xs font-medium text-foreground/70 backdrop-blur-sm transition-colors hover:bg-background/70"
            >
              Restore
            </button>
          )}

          {/* Content - positioned in lower portion, no scroll */}
          <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-5">
            {/* Logo/Brand */}
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Dumbbell className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-base font-semibold text-foreground">FitConnect</span>
            </div>

            {/* Main headline */}
            <h2 className="mb-3 text-xl font-bold">
              <span className="text-primary">Unlock all coaching features</span>
            </h2>

            {/* Dynamic feature list based on selected tier */}
            <div className="mb-3 space-y-1.5">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                    <benefit.icon className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm text-foreground/90">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* Billing toggle */}
            <div className="mb-3 flex items-center justify-center gap-3">
              <span className={cn(
                "text-sm font-medium transition-colors",
                billingInterval === 'monthly' ? "text-foreground" : "text-muted-foreground"
              )}>
                Monthly
              </span>
              <Switch
                checked={billingInterval === 'yearly'}
                onCheckedChange={(checked) => setBillingInterval(checked ? 'yearly' : 'monthly')}
              />
              <span className={cn(
                "text-sm font-medium transition-colors",
                billingInterval === 'yearly' ? "text-foreground" : "text-muted-foreground"
              )}>
                Yearly
              </span>
              {billingInterval === 'yearly' && (
                <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
                  Save ~17%
                </Badge>
              )}
            </div>

            {/* Tier selection cards - compact */}
            <div className="mb-3 space-y-1.5">
              {DISPLAYABLE_TIERS.map((tier) => {
                const config = TIER_CONFIG[tier];
                const TierIcon = config.icon;
                const price = nativePricing.getSubscriptionPrice(tier, billingInterval);
                const formattedPrice = nativePricing.formatPrice(price);
                const isSelected = selectedTier === tier;
                
                return (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={cn(
                      "w-full flex items-center gap-2.5 p-2.5 rounded-xl border-2 transition-all text-left",
                      isSelected 
                        ? "border-primary bg-primary/10" 
                        : "border-border/50 bg-background/50 hover:border-border"
                    )}
                  >
                    {/* Radio indicator */}
                    <div className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                    )}>
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    
                    {/* Icon */}
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      isSelected ? "bg-primary" : "bg-muted"
                    )}>
                      <TierIcon className={cn(
                        "h-4 w-4",
                        isSelected ? "text-primary-foreground" : "text-muted-foreground"
                      )} />
                    </div>
                    
                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-foreground">{config.name}</span>
                        {config.popular && (
                          <Badge variant="secondary" className="bg-primary/20 text-primary text-[10px] px-1.5 py-0">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{config.description}</p>
                    </div>
                    
                    {/* Price */}
                    <div className="text-right shrink-0">
                      <span className="font-bold text-sm text-foreground">{formattedPrice}</span>
                      <span className="text-[11px] text-muted-foreground">/{billingInterval === 'yearly' ? 'yr' : 'mo'}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* IAP Cancelled Alert */}
            {iapState.purchaseStatus === 'cancelled' && (
              <Alert className="mb-2 border-amber-500/50 bg-amber-500/10">
                <AlertDescription className="text-xs text-amber-200">
                  Purchase was cancelled. Tap below to try again.
                </AlertDescription>
              </Alert>
            )}

            {/* Primary CTA */}
            <Button
              onClick={handlePurchase}
              disabled={isSubmitting || isProcessingIAP}
              className="mb-1.5 h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {(isSubmitting || isProcessingIAP) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Start 7-day free trial"
              )}
            </Button>

            {/* Cancel anytime text */}
            <p className="mb-2 text-center text-[11px] text-muted-foreground">
              Cancel anytime. After 7 days, charged {billingInterval === 'yearly' ? 'yearly' : 'monthly'}.
            </p>

            {/* Legal footer */}
            <div className="space-y-1 text-center">
              {isNativeMobile && (
                <button
                  onClick={handleRestorePurchases}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Restore Purchases
                </button>
              )}
              <p className="text-[10px] text-muted-foreground/70">
                By continuing, you agree to our{" "}
                {shouldOpenExternally() ? (
                  <>
                    <button onClick={() => openExternalUrl(`${window.location.origin}/terms`)} className="underline hover:text-foreground/70">Terms</button>
                    {", "}
                    <button onClick={() => openExternalUrl(`${window.location.origin}/privacy`)} className="underline hover:text-foreground/70">Privacy</button>
                    {" & "}
                    <button onClick={() => openExternalUrl(`${window.location.origin}/eula`)} className="underline hover:text-foreground/70">EULA</button>
                  </>
                ) : (
                  <>
                    <Link to="/terms" className="underline hover:text-foreground/70">Terms</Link>
                    {", "}
                    <Link to="/privacy" className="underline hover:text-foreground/70">Privacy</Link>
                    {" & "}
                    <Link to="/eula" className="underline hover:text-foreground/70">EULA</Link>
                  </>
                )}
              </p>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
      
      {/* IAP Unsuccessful Modal */}
      <IAPUnsuccessfulDialog 
        open={iapState.showUnsuccessfulModal} 
        onOpenChange={dismissUnsuccessfulModal}
      />
      
      {/* Features Activated Modal */}
      <FeaturesActivatedModal
        isOpen={showFeaturesModal}
        onClose={() => setShowFeaturesModal(false)}
        tier={purchasedTier || 'starter'}
      />
    </>
  );
};

export default UpgradeDrawer;
