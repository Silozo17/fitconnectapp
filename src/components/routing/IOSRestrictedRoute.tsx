/**
 * Component that blocks access to platform-restricted routes.
 * Shows a friendly message for iOS, Android, and PWA users.
 */

import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { usePlatformRestrictions } from "@/hooks/usePlatformRestrictions";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface PlatformRestrictedRouteProps {
  children: ReactNode;
  /** Type of restriction - determines which check to use */
  restrictionType: "marketplace" | "checkout" | "pricing" | "coaches";
  /** Redirect path instead of showing message (optional) */
  redirectTo?: string;
}

export const PlatformRestrictedRoute = ({
  children,
  restrictionType,
  redirectTo,
}: PlatformRestrictedRouteProps) => {
  const { t } = useTranslation("common");
  const {
    shouldHideMarketplace,
    shouldHideWebPurchases,
    shouldHidePricingPage,
    shouldHideCoachMarketplace,
  } = usePlatformRestrictions();

  // Determine if this route should be restricted
  const isRestricted = (() => {
    switch (restrictionType) {
      case "marketplace":
        return shouldHideMarketplace;
      case "checkout":
        return shouldHideWebPurchases;
      case "pricing":
        return shouldHidePricingPage;
      case "coaches":
        return shouldHideCoachMarketplace;
      default:
        return false;
    }
  })();

  // If not restricted, render children normally
  if (!isRestricted) {
    return <>{children}</>;
  }

  // If redirect is specified, navigate there
  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  // Show friendly message for restricted platform users
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">
            {t("platform.webOnly.title", "Only available on website")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t(
              "platform.webOnly.routeDescription",
              "This feature is available on our website. Please visit getfitconnect.co.uk in your browser to access this content."
            )}
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/dashboard/client">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("ios.backToDashboard", "Back to Dashboard")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Backwards compatibility alias
export const IOSRestrictedRoute = PlatformRestrictedRoute;

export default PlatformRestrictedRoute;
