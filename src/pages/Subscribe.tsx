import { useState, Suspense, useEffect } from "react";
import { Link, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, CheckCircle, Info, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { TierSelector, TierFeatures } from "@/components/payments/TierSelector";
import { BillingToggle } from "@/components/payments/BillingToggle";
import { PriceSummary } from "@/components/payments/PriceSummary";
import { SubscriptionCheckout, CheckoutLoading } from "@/components/payments/SubscriptionCheckout";
import { NativeSubscriptionButtons } from "@/components/payments/NativeSubscriptionButtons";
import { SUBSCRIPTION_TIERS, TierKey, BillingInterval } from "@/lib/stripe-config";
import { Button } from "@/components/ui/button";
import { getAvatarImageUrl } from "@/hooks/useAvatars";
import { toast } from "sonner";
import { isDespia } from "@/lib/despia";
import { usePlatformRestrictions } from "@/hooks/usePlatformRestrictions";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import BecomeCoachModal from "@/components/shared/BecomeCoachModal";
import { openExternalUrl, shouldOpenExternally } from "@/lib/external-links";
// Tier-to-avatar mapping - each tier gets a progressively better avatar
const TIER_AVATARS: Record<TierKey, string> = {
  free: "strongman_bear",
  starter: "deadlift_boar",
  pro: "powerlifter_gorilla",
  enterprise: "elite_personal_trainer_human",
  founder: "elite_personal_trainer_human",
};

// Helper to get the back navigation path based on where user came from
const getBackPath = (from: string | null): string => {
  switch (from) {
    case "onboarding":
      return "/onboarding/coach";
    case "settings":
      return "/dashboard/coach/settings";
    default:
      return "/pricing";
  }
};

export default function Subscribe() {
  const { user, role } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isIOSNative } = usePlatformRestrictions();
  const { currentTier } = useFeatureAccess();
  const [showBecomeCoachModal, setShowBecomeCoachModal] = useState(false);
  
  // Check if user is a client (not coach or admin)
  const isClient = role === "client";
  
  // Build return URL for auth redirect
  const currentUrl = `${location.pathname}${location.search}`;
  const encodedReturnUrl = encodeURIComponent(currentUrl);
  
  // Check if running in Despia native environment (iOS or Android)
  const isNativeApp = isDespia();
  
  // Read initial values from URL params
  const initialTier = (searchParams.get("tier") as TierKey) || "pro";
  const initialBilling = (searchParams.get("billing") as BillingInterval) || "monthly";
  const fromParam = searchParams.get("from");
  
  const [selectedTier, setSelectedTier] = useState<TierKey>(
    initialTier in SUBSCRIPTION_TIERS ? initialTier : "pro"
  );
  
  // Handle tier selection - just update the selection, no auto-redirect for free
  const handleTierChange = (tier: TierKey) => {
    setSelectedTier(tier);
  };
  
  // Handle confirming free tier selection
  const handleConfirmFreeTier = () => {
    toast.success("Continuing with the free plan");
    navigateBack();
  };
  
  // Navigate back to where user came from
  const navigateBack = () => {
    const backPath = getBackPath(fromParam);
    // If coming from onboarding, go to dashboard instead (onboarding complete)
    if (fromParam === "onboarding") {
      navigate("/dashboard/coach");
    } else {
      navigate(backPath);
    }
  };
  
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(
    initialBilling === "yearly" ? "yearly" : "monthly"
  );
  const [showMobileCheckout, setShowMobileCheckout] = useState(false);
  const [checkoutKey, setCheckoutKey] = useState(0);

  // Reset checkout when tier or billing changes
  useEffect(() => {
    setCheckoutKey(prev => prev + 1);
  }, [selectedTier, billingInterval]);

  // Note: We no longer redirect clients - they can view the page with an info message

  const tierData = SUBSCRIPTION_TIERS[selectedTier];
  const backPath = getBackPath(fromParam);

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden">
      {/* Left Side - Dark */}
      <div className="w-full md:w-1/2 bg-[#0D0D14] p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col relative overflow-hidden">
        
        {/* Back Link - Dynamic based on 'from' param */}
        <Link 
          to={backPath} 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              FitConnect
            </span>
          </div>
          <span className="px-2 py-1 text-xs font-bold bg-primary text-primary-foreground rounded">
            {tierData.name.toUpperCase()}
          </span>
        </div>

        {/* Description */}
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Subscribe to FitConnect {tierData.name}
        </h1>
        <p className="text-muted-foreground mb-8">
          {tierData.description}. Get access to all the tools you need to grow your coaching business.
        </p>

        {/* Tier Selector */}
        <div className="mb-8">
          <TierSelector
            selectedTier={selectedTier}
            onTierChange={handleTierChange}
            includeFreeTier={true}
          />
        </div>

        {/* Features + Avatar Row */}
        <div className="mb-8 flex items-start gap-4">
          {/* Features on the left */}
          <div className="flex-1">
            <TierFeatures tier={selectedTier} />
          </div>
          
          {/* Avatar on the right, beside features */}
          <div className="hidden md:block w-40 lg:w-48 h-56 lg:h-64 flex-shrink-0">
            <div 
              key={selectedTier}
              className="w-full h-full animate-fade-in"
            >
              <img
                src={getAvatarImageUrl(TIER_AVATARS[selectedTier])}
                alt={`${tierData.name} tier avatar`}
                className="w-full h-full object-contain drop-shadow-2xl"
                style={{ 
                  filter: 'drop-shadow(0 0 30px hsl(var(--primary) / 0.3))',
                }}
              />
            </div>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="mb-8">
          <p className="text-sm font-medium text-foreground mb-3">Choose billing cycle</p>
          <BillingToggle
            selectedTier={selectedTier}
            billingInterval={billingInterval}
            onIntervalChange={setBillingInterval}
          />
        </div>

        {/* CTA Button - Left side for desktop, full width for mobile */}
        <div className="hidden md:block relative z-10">
          {!user && (
            <Link to={`/auth?returnUrl=${encodedReturnUrl}`}>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6">
                Sign in to subscribe
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile CTA Button */}
        <div className="md:hidden">
          {!showMobileCheckout ? (
            <Button
              onClick={() => setShowMobileCheckout(true)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
              disabled={!user}
            >
              {user ? `Get started with ${tierData.name}` : "Sign in to subscribe"}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowMobileCheckout(false)}
              className="w-full"
            >
              Change plan
            </Button>
          )}
        </div>

        {/* Support Link */}
        <p className="text-xs text-muted-foreground mt-6">
          Already subscribed?{" "}
          <Link to="/contact" className="text-primary hover:underline">
            Contact Support
          </Link>
        </p>
      </div>

      {/* Right Side - Light - Side by side layout */}
      <div className="hidden md:flex w-1/2 bg-white p-4 md:p-6 lg:p-8 flex-col lg:flex-row gap-4 lg:gap-6 items-start overflow-y-auto">
        {/* Client info message - clients can view but not purchase */}
        {isClient ? (
          <div className="w-full max-w-md mx-auto">
            <div className="bg-blue-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Subscriptions are for Coach accounts
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Client accounts are always free. Premium subscriptions unlock advanced features for coaches to grow their business.
              </p>
              <Button 
                onClick={() => setShowBecomeCoachModal(true)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Switch to Coach Account
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                Becoming a coach lets you offer your services on FitConnect
              </p>
            </div>
          </div>
        ) : isNativeApp ? (
          /* Show native IAP ONLY for native app environments */
          <div className="w-full">
            <NativeSubscriptionButtons currentTier={currentTier} />
          </div>
        ) : selectedTier === "free" ? (
          /* Free tier confirmation panel */
          <div className="w-full max-w-md mx-auto">
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Free Plan Selected
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Start with the free plan to explore FitConnect's core features. You can upgrade anytime.
              </p>
              <Button 
                onClick={handleConfirmFreeTier}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
              >
                Continue with Free Plan
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                No credit card required
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* LEFT: Price Summary - Compact box */}
            <div className="w-full lg:w-64 xl:w-72 flex-shrink-0">
              <PriceSummary tier={selectedTier} billingInterval={billingInterval} />
            </div>

            {/* RIGHT: Checkout Form - Takes remaining space */}
            <div className="flex-1 min-w-0 w-full">
              {!user ? (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Sign in to continue
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    You need to be signed in to subscribe to a plan.
                  </p>
                  <Link to={`/auth?returnUrl=${encodedReturnUrl}`}>
                    <Button className="w-full bg-[#0D0D14] hover:bg-[#1a1a24] text-white">
                      Sign in
                    </Button>
                  </Link>
                  <p className="text-xs text-gray-500 mt-4">
                    Don't have an account?{" "}
                    <Link to={`/auth?mode=signup&returnUrl=${encodedReturnUrl}`} className="text-[#0D0D14] hover:underline font-medium">
                      Sign up
                    </Link>
                  </p>
                </div>
              ) : (
                <div>
                  <Suspense fallback={<CheckoutLoading />}>
                    <SubscriptionCheckout 
                      key={checkoutKey}
                      tier={selectedTier} 
                      billingInterval={billingInterval}
                    />
                  </Suspense>
                  <p className="text-xs text-gray-500 text-center mt-4">
                    By subscribing, you agree to our{" "}
                    {shouldOpenExternally() ? (
                      <>
                        <button 
                          onClick={() => openExternalUrl(`${window.location.origin}/terms`)}
                          className="underline hover:text-gray-700"
                        >
                          Terms of Service
                        </button>{" "}
                        and{" "}
                        <button 
                          onClick={() => openExternalUrl(`${window.location.origin}/privacy`)}
                          className="underline hover:text-gray-700"
                        >
                          Privacy Policy
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/terms" className="underline hover:text-gray-700">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="underline hover:text-gray-700">
                          Privacy Policy
                        </Link>
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Mobile Checkout Sheet - Only show on non-native or show native IAP */}
      {showMobileCheckout && user && (
        <div className="md:hidden fixed inset-0 z-50 bg-white overflow-auto">
          <div className="p-4 border-b sticky top-0 bg-white">
            <button
              onClick={() => setShowMobileCheckout(false)}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to plans</span>
            </button>
          </div>
          <div className="p-6">
            {isNativeApp ? (
              /* Native app: show only IAP buttons */
              <NativeSubscriptionButtons currentTier={currentTier} />
            ) : (
              /* Web: show Stripe checkout */
              <>
                <PriceSummary tier={selectedTier} billingInterval={billingInterval} />
                <div className="mt-6">
                  {user ? (
                    <Suspense fallback={<CheckoutLoading />}>
                      <SubscriptionCheckout 
                        key={`mobile-${checkoutKey}`}
                        tier={selectedTier} 
                        billingInterval={billingInterval}
                      />
                    </Suspense>
                  ) : (
                    <div className="text-center">
                      <Link to={`/auth?returnUrl=${encodedReturnUrl}`}>
                        <Button className="w-full">Sign in to subscribe</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      <BecomeCoachModal 
        open={showBecomeCoachModal} 
        onOpenChange={setShowBecomeCoachModal} 
      />
    </div>
  );
}
