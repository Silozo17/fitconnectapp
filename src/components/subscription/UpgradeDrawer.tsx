import { useState, useCallback } from "react";
import { Check, ChevronDown, Loader2, Dumbbell, Users, Brain, TrendingUp, Infinity, Headphones, Cog, MessageSquare, Sparkles, Crown, Rocket } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNativeIAP } from "@/hooks/useNativeIAP";
import { useNativePricing } from "@/hooks/useNativePricing";
import { usePlatformRestrictions } from "@/hooks/usePlatformRestrictions";
import { useCoachProfileId } from "@/hooks/useCoachProfileId";
import { IAPUnsuccessfulDialog } from "@/components/iap/IAPUnsuccessfulDialog";
import { FeaturesActivatedModal } from "@/components/subscription/FeaturesActivatedModal";
import { openExternalUrl, shouldOpenExternally } from "@/lib/external-links";
import { triggerConfetti, confettiPresets } from "@/lib/confetti";
import { triggerHaptic, triggerRestorePurchases } from "@/lib/despia";
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
    { icon: Headphones, text: "Case study generator" },
    { icon: Cog, text: "Automations & AI insights" },
  ],
};

const DISPLAYABLE_TIERS: SubscriptionTier[] = ['starter', 'pro', 'enterprise'];

interface UpgradeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachId?: string;
  /** Mode: 'upgrade' for normal drawer, 'onboarding' for coach onboarding paywall */
  mode?: 'upgrade' | 'onboarding';
  /** Called when user skips during onboarding (pulls down or clicks skip) */
  onSkip?: () => void;
  /** Called when purchase succeeds in onboarding mode (for custom navigation) */
  onSuccess?: (tier: SubscriptionTier) => void;
}

export const UpgradeDrawer = ({ 
  open, 
  onOpenChange, 
  coachId,
  mode = 'upgrade',
  onSkip,
  onSuccess,
}: UpgradeDrawerProps) => {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('pro');
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [purchasedTier, setPurchasedTier] = useState<TierKey | null>(null);
  
  const { isNativeMobile } = usePlatformRestrictions();
  const nativePricing = useNativePricing();
  const queryClient = useQueryClient();
  
  // Fallback: Get coachId from hook if not provided as prop
  const { data: profileCoachId, isLoading: isCoachIdLoading } = useCoachProfileId();
  const effectiveCoachId = coachId || profileCoachId;
  
  // Get dynamic benefits for selected tier
  const benefits = TIER_BENEFITS[selectedTier] || TIER_BENEFITS.pro;
  
  // Handle IMMEDIATE success - fires the moment Apple confirms transaction
  // This provides instant UI feedback before any polling/verification
  const handleImmediateSuccess = useCallback((tier: SubscriptionTier) => {
    console.log('[UpgradeDrawer] Immediate success - closing drawer and showing celebration');
    
    // Celebrate immediately - Apple has already confirmed the transaction
    triggerConfetti(confettiPresets.medium);
    triggerHaptic('success');
    
    // Close drawer immediately for instant feedback
    onOpenChange(false);
    
    // Show features modal immediately
    setPurchasedTier(tier as TierKey);
    setShowFeaturesModal(true);
    setIsSubmitting(false);
  }, [onOpenChange]);
  
  // Handle database confirmation (called after polling/webhook confirms DB update)
  const handlePurchaseComplete = useCallback(async (tier: SubscriptionTier) => {
    console.log('[UpgradeDrawer] Database confirmed - invalidating queries');
    
    localStorage.removeItem(STORAGE_KEYS.CACHED_TIER);
    
    // Refresh queries now that DB is confirmed
    queryClient.invalidateQueries({ queryKey: ['coach-onboarding-status'] });
    queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
    queryClient.invalidateQueries({ queryKey: ['feature-access'] });
    queryClient.invalidateQueries({ queryKey: ['coach-profile'] });
    
    // In onboarding mode, call the custom success handler
    if (mode === 'onboarding' && onSuccess) {
      onSuccess(tier);
    }
  }, [queryClient, mode, onSuccess]);
  
  const { state: iapState, purchase: iapPurchase, dismissUnsuccessfulModal, reconcileSubscription } = useNativeIAP({
    onPurchaseComplete: handlePurchaseComplete,
    onImmediateSuccess: handleImmediateSuccess,
  });
  
  const isProcessingIAP = iapState.purchaseStatus === 'purchasing' || iapState.isPolling;
  
  const handleRestorePurchases = useCallback(async () => {
    if (!isNativeMobile) {
      toast.info('Restore purchases is only available on iOS/Android');
      return;
    }
    
    // Trigger native restore command first
    const triggered = triggerRestorePurchases();
    if (!triggered) {
      toast.error('Unable to trigger restore');
      return;
    }
    
    toast.info('Restoring purchases...', { duration: 4000 });
    
    // Wait for native restore + webhook processing
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Now reconcile with backend
    await reconcileSubscription();
  }, [isNativeMobile, reconcileSubscription]);
  
  const handlePurchase = async () => {
    console.log('[UpgradeDrawer] handlePurchase called', { 
      coachId,
      effectiveCoachId,
      isNativeMobile, 
      iapAvailable: iapState.isAvailable,
      selectedTier,
      billingInterval,
      windowIapSuccess: typeof (window as any).iapSuccess,
    });
    
    if (!effectiveCoachId) {
      console.error('[UpgradeDrawer] No coachId available (prop or hook)');
      toast.error('Unable to process purchase. Please try again.');
      return;
    }
    
    if (isNativeMobile) {
      // Native IAP flow - DO NOT use isSubmitting, rely on iapState.purchaseStatus
      if (!iapState.isAvailable) {
        console.error('[UpgradeDrawer] IAP not available on native device');
        toast.error('In-app purchases are not available. Please reinstall the app.');
        return;
      }
      
      try {
        console.log('[UpgradeDrawer] Triggering iapPurchase', { selectedTier, billingInterval });
        await iapPurchase(selectedTier, billingInterval);
        // Note: State is managed by useNativeIAP hook - no need for local isSubmitting
      } catch (error) {
        console.error('[UpgradeDrawer] IAP purchase failed:', error);
        toast.error('Purchase failed. Please try again.');
      }
    } else {
      // Web Stripe checkout flow - uses isSubmitting
      setIsSubmitting(true);
      try {
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
          body: {
            tier: selectedTier,
            interval: billingInterval,
            coachId: effectiveCoachId,
          },
        });
        
        if (error) throw error;
        if (data?.url) {
          window.open(data.url, '_blank');
        }
      } catch (error) {
        console.error('[UpgradeDrawer] Checkout creation failed:', error);
        toast.error('Failed to start checkout. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    // In onboarding mode, closing the drawer = skipping subscription
    if (mode === 'onboarding' && onSkip) {
      onSkip();
    } else {
      onOpenChange(false);
    }
  };
  
  const handleFeaturesModalClose = () => {
    setShowFeaturesModal(false);
    // In onboarding mode, call the custom success handler after modal closes
    if (mode === 'onboarding' && onSuccess && purchasedTier) {
      onSuccess(purchasedTier as SubscriptionTier);
    }
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

          {/* Close button - centered swipe down indicator */}
          <button
            onClick={handleClose}
            className={cn(
              "absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full bg-background/50 backdrop-blur-sm transition-colors hover:bg-background/70",
              isNativeMobile ? "top-[44px]" : "top-[26px]"
            )}
            aria-label="Swipe down to close"
          >
            <div className="w-8 h-1 rounded-full bg-foreground/30" />
            <ChevronDown className="h-4 w-4 text-foreground/70 animate-bounce" />
          </button>

          {/* Restore button - top left (native only) */}
          {isNativeMobile && (
            <button
              onClick={handleRestorePurchases}
              className="absolute left-4 top-[51px] z-20 rounded-full bg-background/50 px-3 py-2 text-xs font-medium text-foreground/70 backdrop-blur-sm transition-colors hover:bg-background/70"
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
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs transition-colors",
                  billingInterval === 'yearly' 
                    ? "bg-primary/20 text-primary" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                Save ~17%
              </Badge>
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

            {/* Primary CTA */}
            <Button
              onClick={handlePurchase}
              disabled={
                // Web: use isSubmitting
                // Native: use iapState.purchaseStatus (not isSubmitting)
                (isNativeMobile ? isProcessingIAP : isSubmitting) || 
                (isNativeMobile && isCoachIdLoading && !effectiveCoachId)
              }
              className="mb-1.5 h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {(isNativeMobile ? isProcessingIAP : isSubmitting) ? (
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

            {/* Continue without upgrading - only in onboarding mode */}
            {mode === 'onboarding' && (
              <button
                type="button"
                onClick={handleClose}
                disabled={isProcessingIAP || isSubmitting}
                className="w-full text-center text-[11px] text-muted-foreground hover:text-primary transition-colors py-1.5 disabled:opacity-50"
              >
                Continue without upgrading
              </button>
            )}

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
        error={iapState.error}
      />
      
      {/* Features Activated Modal */}
      <FeaturesActivatedModal
        isOpen={showFeaturesModal}
        onClose={handleFeaturesModalClose}
        tier={purchasedTier || 'starter'}
      />
    </>
  );
};

export default UpgradeDrawer;
