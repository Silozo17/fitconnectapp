import { useState, Suspense } from "react";
import { useSearchParams, useNavigate, Link, useLocation } from "react-router-dom";
import { ArrowLeft, Zap, Package, ShoppingBag, CalendarCheck, BookOpen, Video, FileText, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useCheckoutItem, CheckoutType } from "@/hooks/useCheckoutItem";
import { ProductPriceSummary } from "@/components/payments/ProductPriceSummary";
import { UnifiedEmbeddedCheckout, CheckoutLoading } from "@/components/payments/UnifiedEmbeddedCheckout";

const TYPE_CONFIG: Record<CheckoutType, { label: string; icon: typeof Package }> = {
  "digital-product": { label: "DIGITAL PRODUCT", icon: BookOpen },
  "digital-bundle": { label: "BUNDLE", icon: Layers },
  "package": { label: "SESSION PACKAGE", icon: Package },
  "subscription": { label: "SUBSCRIPTION", icon: CalendarCheck },
};

const CONTENT_TYPE_ICONS: Record<string, typeof Video> = {
  video: Video,
  ebook: BookOpen,
  pdf: FileText,
  audio: Video,
};

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showMobileCheckout, setShowMobileCheckout] = useState(false);

  // Build return URL for auth redirect
  const currentUrl = `${location.pathname}${location.search}`;
  const encodedReturnUrl = encodeURIComponent(currentUrl);

  const type = searchParams.get("type") as CheckoutType;
  const itemId = searchParams.get("itemId");
  const coachId = searchParams.get("coachId");
  const clientId = searchParams.get("clientId");
  const returnUrl = searchParams.get("returnUrl") || "/";

  const { data: item, isLoading, error } = useCheckoutItem(type, itemId, coachId);

  // Determine success/cancel URLs based on type
  const getSuccessUrl = () => {
    switch (type) {
      case "digital-product":
      case "digital-bundle":
        return `${window.location.origin}/dashboard/client/library?purchased=${itemId}`;
      case "package":
      case "subscription":
        return `${window.location.origin}/dashboard/client/coaches?payment=success`;
      default:
        return `${window.location.origin}/dashboard/client`;
    }
  };

  const getCancelUrl = () => {
    return `${window.location.origin}${returnUrl}`;
  };

  // Validate required params
  if (!type || !itemId) {
    return (
      <div className="min-h-screen bg-[#0D0D14] flex items-center justify-center p-4">
        <div className="bg-card rounded-xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Invalid Checkout</h1>
          <p className="text-muted-foreground mb-6">
            Missing required checkout information.
          </p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 bg-[#0D0D14] p-6 sm:p-8 md:p-10 lg:p-12">
          <Skeleton className="h-6 w-24 mb-8 bg-white/10" />
          <Skeleton className="h-8 w-48 mb-6 bg-white/10" />
          <Skeleton className="h-10 w-full mb-4 bg-white/10" />
          <Skeleton className="h-20 w-full mb-8 bg-white/10" />
          <Skeleton className="h-48 w-full bg-white/10" />
        </div>
        <div className="w-full md:w-1/2 bg-white p-6 md:p-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !item) {
    return (
      <div className="min-h-screen bg-[#0D0D14] flex items-center justify-center p-4">
        <div className="bg-card rounded-xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The item you're trying to purchase could not be found.
          </p>
          <Button onClick={() => navigate(returnUrl)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const typeConfig = TYPE_CONFIG[type];
  const TypeIcon = typeConfig.icon;
  const ContentIcon = item.contentType ? CONTENT_TYPE_ICONS[item.contentType] || BookOpen : BookOpen;

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden">
      {/* Left Side - Dark */}
      <div className="w-full md:w-1/2 bg-[#0D0D14] p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col relative overflow-hidden">
        
        {/* Back Link */}
        <button
          onClick={() => navigate(returnUrl)}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              FitConnect
            </span>
          </div>
          <span className="px-2 py-1 text-xs font-bold bg-primary text-primary-foreground rounded">
            {typeConfig.label}
          </span>
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          {item.name}
        </h1>
        {item.description && (
          <p className="text-muted-foreground mb-6 line-clamp-3">
            {item.description}
          </p>
        )}

        {/* Product Image or Icon */}
        <div className="mb-6">
          {item.imageUrl ? (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-white/5 max-w-md">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-xl bg-white/5 flex items-center justify-center">
              <TypeIcon className="h-16 w-16 text-primary/50" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-3 mb-8">
          {item.type === "digital-product" && (
            <>
              {item.contentType && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ContentIcon className="h-4 w-4" />
                  <span className="capitalize">{item.contentType}</span>
                </div>
              )}
              {item.durationMinutes && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Video className="h-4 w-4" />
                  <span>{item.durationMinutes} minutes</span>
                </div>
              )}
              {item.pageCount && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{item.pageCount} pages</span>
                </div>
              )}
            </>
          )}
          
          {item.type === "digital-bundle" && item.productCount && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="h-4 w-4" />
              <span>{item.productCount} products included</span>
            </div>
          )}

          {item.type === "package" && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>{item.sessionCount} sessions</span>
              </div>
              {item.validityDays && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarCheck className="h-4 w-4" />
                  <span>Valid for {item.validityDays} days</span>
                </div>
              )}
            </>
          )}

          {item.type === "subscription" && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarCheck className="h-4 w-4" />
                <span className="capitalize">{item.billingPeriod} billing</span>
              </div>
              {item.sessionsPerPeriod && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>{item.sessionsPerPeriod} sessions per {item.billingPeriod === "monthly" ? "month" : "period"}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Coach Info */}
        {item.coach && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 mb-8">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={item.coach.profileImageUrl || undefined} alt={item.coach.displayName} />
              <AvatarFallback className="bg-primary/20 text-primary">
                {item.coach.displayName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Created by</p>
              <p className="text-foreground font-semibold">{item.coach.displayName}</p>
            </div>
          </div>
        )}

        {/* Mobile CTA Button */}
        <div className="md:hidden mt-auto">
          {!showMobileCheckout ? (
            <Button
              onClick={() => setShowMobileCheckout(true)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
              disabled={!user}
            >
              {user ? "Continue to payment" : "Sign in to purchase"}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowMobileCheckout(false)}
              className="w-full"
            >
              Back to details
            </Button>
          )}
        </div>

        {/* Support Link */}
        <p className="text-xs text-muted-foreground mt-6">
          Need help?{" "}
          <Link to="/contact" className="text-primary hover:underline">
            Contact Support
          </Link>
        </p>
      </div>

      {/* Right Side - Light - Side by side layout */}
      <div className="hidden md:flex w-1/2 bg-white p-4 md:p-6 lg:p-8 flex-col lg:flex-row gap-4 lg:gap-6 items-start overflow-y-auto">
        {/* LEFT: Price Summary - Compact box */}
        <div className="w-full lg:w-64 xl:w-72 flex-shrink-0">
          <ProductPriceSummary item={item} />
        </div>

        {/* RIGHT: Checkout Form - Takes remaining space */}
        <div className="flex-1 min-w-0 w-full">
          {!user ? (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sign in to continue
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                You need to be signed in to complete your purchase.
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
                <UnifiedEmbeddedCheckout
                  checkoutType={type}
                  itemId={itemId}
                  coachId={coachId || item.coach?.id || undefined}
                  clientId={clientId || undefined}
                  successUrl={getSuccessUrl()}
                  cancelUrl={getCancelUrl()}
                />
              </Suspense>
              <p className="text-xs text-gray-500 text-center mt-4">
                By purchasing, you agree to our{" "}
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
      </div>

      {/* Mobile Checkout Sheet */}
      {showMobileCheckout && user && (
        <div className="md:hidden fixed inset-0 z-50 bg-white overflow-auto">
          <div className="p-4 border-b sticky top-0 bg-white">
            <button
              onClick={() => setShowMobileCheckout(false)}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to details</span>
            </button>
          </div>
          <div className="p-6">
            <ProductPriceSummary item={item} />
            <div className="mt-6">
              <Suspense fallback={<CheckoutLoading />}>
                <UnifiedEmbeddedCheckout
                  checkoutType={type}
                  itemId={itemId}
                  coachId={coachId || item.coach?.id || undefined}
                  clientId={clientId || undefined}
                  successUrl={getSuccessUrl()}
                  cancelUrl={getCancelUrl()}
                />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
