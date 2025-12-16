import { useState, Suspense, useEffect } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { TierSelector, TierFeatures } from "@/components/payments/TierSelector";
import { BillingToggle } from "@/components/payments/BillingToggle";
import { PriceSummary } from "@/components/payments/PriceSummary";
import { SubscriptionCheckout, CheckoutLoading } from "@/components/payments/SubscriptionCheckout";
import { SUBSCRIPTION_TIERS, TierKey, BillingInterval } from "@/lib/stripe-config";
import { Button } from "@/components/ui/button";
import { getAvatarImageUrl } from "@/hooks/useAvatars";

// Tier-to-avatar mapping - each tier gets a progressively better avatar
const TIER_AVATARS: Record<TierKey, string> = {
  free: "strongman-bear",
  starter: "deadlift-boar",
  pro: "powerlifter-gorilla",
  enterprise: "elite-personal-trainer-human",
};

export default function Subscribe() {
  const { user, role } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Read initial values from URL params
  const initialTier = (searchParams.get("tier") as TierKey) || "pro";
  const initialBilling = (searchParams.get("billing") as BillingInterval) || "monthly";
  
  const [selectedTier, setSelectedTier] = useState<TierKey>(
    initialTier in SUBSCRIPTION_TIERS && initialTier !== "free" ? initialTier : "pro"
  );
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(
    initialBilling === "yearly" ? "yearly" : "monthly"
  );
  const [showMobileCheckout, setShowMobileCheckout] = useState(false);
  const [checkoutKey, setCheckoutKey] = useState(0);

  // Reset checkout when tier or billing changes
  useEffect(() => {
    setCheckoutKey(prev => prev + 1);
  }, [selectedTier, billingInterval]);

  // Allow coaches and admins to view this page
  if (role && role !== "coach" && role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const tierData = SUBSCRIPTION_TIERS[selectedTier];

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left Side - Dark */}
      <div className="w-full lg:w-1/2 bg-[#0D0D14] p-8 lg:p-12 flex flex-col relative">
        
        {/* Back Link */}
        <Link 
          to="/pricing" 
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
            onTierChange={setSelectedTier}
          />
        </div>

        {/* Features with Avatar */}
        <div className="mb-8 flex-1 relative">
          <TierFeatures tier={selectedTier} />
          
          {/* Tier Avatar - Full opacity, positioned right of features */}
          <div className="hidden lg:block absolute -right-4 bottom-0 w-48 h-64 pointer-events-none">
            <div 
              key={selectedTier}
              className="w-full h-full animate-fade-in"
            >
              <img
                src={getAvatarImageUrl(TIER_AVATARS[selectedTier])}
                alt={`${tierData.name} tier avatar`}
                className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-700 ease-in-out hover:scale-105"
                style={{ 
                  filter: 'drop-shadow(0 0 30px hsl(var(--primary) / 0.4))',
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
        <div className="hidden lg:block">
          {!user && (
            <Link to="/auth">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6">
                Sign in to subscribe
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile CTA Button */}
        <div className="lg:hidden">
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

      {/* Right Side - Light - Checkout shows immediately */}
      <div className="hidden lg:flex w-1/2 bg-white p-8 lg:p-12 flex-col">
        {/* Price Summary */}
        <div className="mb-8">
          <PriceSummary tier={selectedTier} billingInterval={billingInterval} />
        </div>

        {/* Checkout Form - Show immediately when logged in */}
        {!user ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="bg-gray-50 rounded-xl p-8 max-w-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sign in to continue
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                You need to be signed in to subscribe to a plan.
              </p>
              <Link to="/auth">
                <Button className="w-full bg-[#0D0D14] hover:bg-[#1a1a24] text-white">
                  Sign in
                </Button>
              </Link>
              <p className="text-xs text-gray-500 mt-4">
                Don't have an account?{" "}
                <Link to="/auth?mode=signup" className="text-[#0D0D14] hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <Suspense fallback={<CheckoutLoading />}>
              <SubscriptionCheckout 
                key={checkoutKey}
                tier={selectedTier} 
                billingInterval={billingInterval}
              />
            </Suspense>
            <p className="text-xs text-gray-500 text-center mt-4">
              By subscribing, you agree to our{" "}
              <Link to="/terms" className="underline hover:text-gray-700">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline hover:text-gray-700">
                Privacy Policy
              </Link>
            </p>
          </div>
        )}
      </div>

      {/* Mobile Checkout Sheet */}
      {showMobileCheckout && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white overflow-auto">
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
                  <Link to="/auth">
                    <Button className="w-full">Sign in to subscribe</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
