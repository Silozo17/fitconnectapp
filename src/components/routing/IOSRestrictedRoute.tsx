/**
 * Component that blocks access to iOS-restricted routes.
 * Shows a friendly message and redirects to dashboard.
 */

import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useIOSRestrictions } from "@/hooks/useIOSRestrictions";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface IOSRestrictedRouteProps {
  children: ReactNode;
  /** Type of restriction - determines which check to use */
  restrictionType: "marketplace" | "checkout" | "pricing" | "coaches";
  /** Redirect path instead of showing message (optional) */
  redirectTo?: string;
}

export const IOSRestrictedRoute = ({
  children,
  restrictionType,
  redirectTo,
}: IOSRestrictedRouteProps) => {
  const { t } = useTranslation("common");
  const {
    isIOSNative,
    shouldHideCoachMarketplace,
    shouldHidePackagePurchasing,
    shouldHideWebPurchases,
    shouldHidePricingPage,
  } = useIOSRestrictions();

  // Determine if this route should be restricted
  const isRestricted = (() => {
    switch (restrictionType) {
      case "marketplace":
        return shouldHidePackagePurchasing;
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

  // If not iOS native or not restricted, render children normally
  if (!isIOSNative || !isRestricted) {
    return <>{children}</>;
  }

  // If redirect is specified, navigate there
  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  // Show friendly message for iOS users
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">
            {t("ios.featureNotAvailable", "Feature Not Available")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t(
              "ios.visitWebsite",
              "This feature is available on our website. Please visit getfitconnect.co.uk to access this content."
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

export default IOSRestrictedRoute;
