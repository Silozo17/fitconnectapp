import { useState, useCallback } from "react";
import { Crown, Zap, Star, Users, Dumbbell, Brain, TrendingUp, MessageSquare, Infinity, Headphones, Cog, Check, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SUBSCRIPTION_TIERS, TierKey } from "@/lib/stripe-config";
import { useNativeIAP, SubscriptionTier, BillingInterval } from "@/hooks/useNativeIAP";
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

// Map tier icons for display
const TIER_ICONS: Record<TierKey, typeof Crown> = {
  free: Zap,
  starter: Zap,
  pro: Star,
  enterprise: Crown,
  founder: Crown,
};

// Get displayable tiers (exclude admin-only tiers AND free tier for paywall)
const getDisplayableTiers = () => {
  return (Object.entries(SUBSCRIPTION_TIERS) as [TierKey, typeof SUBSCRIPTION_TIERS.free][])
    .filter(([key, config]) => {
      if (config.adminOnly) return false;
      if (key === 'free') return false;
      return true;
    })
    .map(([key, config]) => ({
      id: key,
      name: config.name,
      description: config.description,
      features: config.features,
      icon: TIER_ICONS[key],
      popular: config.highlighted,
      clientLimit: config.clientLimit,
    }));
};

// Dynamic benefits per tier
const tierBenefits = {
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

interface UpgradeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachId?: string;
}

export const UpgradeDrawer = ({ open, onOpenChange, coachId }: UpgradeDrawerProps) => {
  const [selectedTier, setSelectedTier] = useState<TierKey>('pro');
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [purchasedTier, setPurchasedTier] = useState<TierKey | null>(null);
  
  const { isNativeMobile } = usePlatformRestrictions();
  const nativePricing = useNativePricing();
  const queryClient = useQueryClient();
  
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
  
  const paidTiers = getDisplayableTiers();
  const isProcessingIAP = iapState.purchaseStatus === 'purchasing' || iapState.isPolling;
  
  // Use selected tier benefits or default to Pro
  const selectedTierKey = selectedTier as keyof typeof tierBenefits;
  const benefits = tierBenefits[selectedTierKey] || tierBenefits.pro;
  
  const handleRestorePurchases = useCallback(async () => {
    await reconcileSubscription();
  }, [reconcileSubscription]);
  
  const handlePurchase = async () => {
    if (!coachId) return;
    
    setIsSubmitting(true);
    
    if (isNativeMobile && iapState.isAvailable) {
      // Native IAP flow
      try {
        await iapPurchase(selectedTier as SubscriptionTier, billingInterval);
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
  
  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh] pb-safe-bottom">
          {/* Hero Image */}
          <div className="w-full aspect-[16/9] relative overflow-hidden">
            <img 
              src="https://ntgfihgneyoxxbwmtceq.supabase.co/storage/v1/object/public/website-images/iap_image.webp"
              alt="Upgrade to Pro"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="px-4 pt-3 pb-2 flex flex-col overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 pb-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg">FitConnect</span>
            </div>

            {/* Title */}
            <DrawerHeader className="p-0 text-center mb-2">
              <DrawerTitle className="font-display text-xl font-bold">
                Unlock all coaching features
              </DrawerTitle>
              <DrawerDescription className="text-sm mt-1">
                Start your 7-day free trial today
              </DrawerDescription>
            </DrawerHeader>

            {/* Dynamic benefits list */}
            <div className="space-y-2 mb-3">
              {benefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">{benefit.text}</p>
                  </div>
                );
              })}
            </div>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className={`text-sm font-medium transition-colors ${billingInterval === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <Switch 
                checked={billingInterval === 'yearly'}
                onCheckedChange={(checked) => setBillingInterval(checked ? 'yearly' : 'monthly')}
              />
              <span className={`text-sm font-medium transition-colors ${billingInterval === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Yearly
              </span>
              <Badge 
                variant={billingInterval === 'yearly' ? 'default' : 'secondary'} 
                className={`ml-1 text-xs ${billingInterval === 'monthly' ? 'opacity-60' : ''}`}
              >
                Save ~17%
              </Badge>
            </div>

            {/* Tier cards */}
            <div className="space-y-2 flex-1 min-h-0 overflow-y-auto">
              {paidTiers.map((tier) => {
                const Icon = tier.icon;
                const isSelected = selectedTier === tier.id;
                const price = billingInterval === 'monthly' 
                  ? nativePricing.getSubscriptionPrice(tier.id as SubscriptionTier, 'monthly')
                  : nativePricing.getSubscriptionPrice(tier.id as SubscriptionTier, 'yearly');
                const monthlyEquivalent = billingInterval === 'yearly' 
                  ? Math.round(price / 12) 
                  : price;
                
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTier(tier.id as TierKey)}
                    className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    {/* Radio-style indicator */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    
                    {/* Tier icon */}
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-primary" : "bg-secondary"
                    }`}>
                      <Icon className={`w-4 h-4 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    </div>
                    
                    {/* Tier info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground text-sm">{tier.name}</h3>
                        {tier.popular && (
                          <Badge variant="secondary" className="text-xs py-0">Popular</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{tier.description}</p>
                    </div>
                    
                    {/* Price */}
                    <div className="text-right shrink-0">
                      <span className="font-bold text-primary text-sm">
                        {nativePricing.formatPrice(monthlyEquivalent)}
                      </span>
                      <span className="text-xs text-muted-foreground">/mo</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Purchase cancelled alert */}
            {iapState.purchaseStatus === 'cancelled' && (
              <Alert className="mt-2 border-muted bg-muted/50">
                <AlertDescription className="text-sm text-muted-foreground text-center">
                  Purchase cancelled. Select a plan to try again.
                </AlertDescription>
              </Alert>
            )}

            {/* CTA Section */}
            <div className="mt-3 space-y-2">
              <Button 
                className="w-full py-5 text-base font-semibold"
                onClick={handlePurchase}
                disabled={isSubmitting || isProcessingIAP}
              >
                {(isSubmitting || isProcessingIAP) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Start 7-day free trial
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Cancel anytime. After 7 days, charged {billingInterval === 'monthly' ? 'monthly' : 'yearly'}.
              </p>
            </div>

            {/* Legal footer */}
            <p className="text-xs text-muted-foreground text-center mt-3 pb-1">
              {isNativeMobile && (
                <>
                  <button 
                    type="button"
                    onClick={handleRestorePurchases}
                    className="text-primary hover:underline"
                  >
                    Restore Purchases
                  </button>
                  {" · "}
                </>
              )}
              By continuing, you agree to our{" "}
              {shouldOpenExternally() ? (
                <>
                  <button onClick={() => openExternalUrl(`${window.location.origin}/terms`)} className="text-primary hover:underline">Terms</button>,{" "}
                  <button onClick={() => openExternalUrl(`${window.location.origin}/privacy`)} className="text-primary hover:underline">Privacy</button>{" "}
                  & <button onClick={() => openExternalUrl(`${window.location.origin}/terms#eula`)} className="text-primary hover:underline">EULA</button>
                </>
              ) : (
                <>
                  <Link to="/terms" target="_blank" className="text-primary hover:underline">Terms</Link>,{" "}
                  <Link to="/privacy" target="_blank" className="text-primary hover:underline">Privacy</Link>{" "}
                  & <Link to="/terms#eula" target="_blank" className="text-primary hover:underline">EULA</Link>
                </>
              )}.
            </p>
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
