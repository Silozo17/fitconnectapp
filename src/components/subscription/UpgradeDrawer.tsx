import { useState, useCallback } from "react";
import { Check, X, Loader2, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
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
import { TierKey } from "@/lib/stripe-config";

const FEATURES = [
  "Manage unlimited clients",
  "AI-powered workout & meal plans",
  "Advanced analytics & insights",
  "Priority support & custom branding",
];

interface UpgradeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachId?: string;
}

export const UpgradeDrawer = ({ open, onOpenChange, coachId }: UpgradeDrawerProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [purchasedTier, setPurchasedTier] = useState<TierKey | null>(null);
  
  const { isNativeMobile } = usePlatformRestrictions();
  const nativePricing = useNativePricing();
  const queryClient = useQueryClient();
  
  // Default to Pro tier, monthly billing
  const selectedTier: SubscriptionTier = 'pro';
  const billingInterval: BillingInterval = 'monthly';
  const monthlyPrice = nativePricing.getSubscriptionPrice(selectedTier, billingInterval);
  const formattedPrice = nativePricing.formatPrice(monthlyPrice);
  
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
  
  const handleContinue = async () => {
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

  const handleSkip = () => {
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
            {/* Gradient overlay - starts at ~55% to show hero image at top */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/98 via-[55%] to-transparent" />
          </div>

          {/* Close button - top right */}
          <button
            onClick={handleSkip}
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

          {/* Content - positioned in lower portion */}
          <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-8 pt-[45vh]">
            {/* Logo/Brand */}
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Dumbbell className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">FitConnect</span>
            </div>

            {/* Main headline */}
            <h2 className="mb-1 text-3xl font-bold">
              <span className="text-primary">Unlimited Access</span>
            </h2>
            <p className="mb-6 text-2xl font-semibold text-foreground">
              to All Features
            </p>

            {/* Feature list */}
            <div className="mb-6 space-y-3">
              {FEATURES.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-base text-foreground/90">{feature}</span>
                </div>
              ))}
            </div>

            {/* Pricing text */}
            <p className="mb-4 text-center text-sm text-muted-foreground">
              7-day free trial, then {formattedPrice}/month
            </p>

            {/* Primary CTA */}
            <Button
              onClick={handleContinue}
              disabled={isSubmitting || isProcessingIAP}
              className="mb-3 h-14 w-full rounded-full bg-foreground text-lg font-semibold text-background hover:bg-foreground/90"
            >
              {(isSubmitting || isProcessingIAP) ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Continue"
              )}
            </Button>

            {/* Secondary action */}
            <button
              onClick={handleSkip}
              className="mb-4 py-2 text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Skip for now
            </button>

            {/* Legal footer */}
            <p className="text-center text-[10px] text-muted-foreground/70">
              {shouldOpenExternally() ? (
                <>
                  <button onClick={() => openExternalUrl(`${window.location.origin}/privacy`)} className="hover:underline">Privacy Policy</button>
                  {" · "}
                  <button onClick={() => openExternalUrl(`${window.location.origin}/terms`)} className="hover:underline">Terms of Use</button>
                </>
              ) : (
                <>
                  <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
                  {" · "}
                  <Link to="/terms" className="hover:underline">Terms of Use</Link>
                </>
              )}
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
