import { Package, RefreshCcw, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCoachPackages, useCoachSubscriptionPlans } from "@/hooks/usePackages";
import { Skeleton } from "@/components/ui/skeleton";
import CheckoutButton from "@/components/payments/CheckoutButton";
import { useLocale } from "@/contexts/LocaleContext";

interface CoachPricingSectionProps {
  coachId: string;
  onSelectPackage?: (packageId: string) => void;
  onSelectPlan?: (planId: string) => void;
}

const CoachPricingSection = ({ coachId, onSelectPackage, onSelectPlan }: CoachPricingSectionProps) => {
  const { formatCurrency } = useLocale();
  const { data: packages = [], isLoading: packagesLoading } = useCoachPackages(coachId);
  const { data: plans = [], isLoading: plansLoading } = useCoachSubscriptionPlans(coachId);

  const isLoading = packagesLoading || plansLoading;
  const hasPackages = packages.length > 0;
  const hasPlans = plans.length > 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!hasPackages && !hasPlans) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Pricing & Packages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={hasPackages ? "packages" : "subscriptions"}>
          <TabsList className="mb-4">
            {hasPackages && (
              <TabsTrigger value="packages">
                Session Packages
              </TabsTrigger>
            )}
            {hasPlans && (
              <TabsTrigger value="subscriptions">
                Subscriptions
              </TabsTrigger>
            )}
          </TabsList>

          {hasPackages && (
            <TabsContent value="packages" className="space-y-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{pkg.name}</h4>
                      {pkg.description && (
                        <p className="text-sm text-muted-foreground">{pkg.description}</p>
                      )}
                    </div>
                    <Badge variant="secondary">{pkg.session_count} sessions</Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                    <div className="min-w-0">
                      <span className="text-2xl font-bold text-primary">{formatCurrency(pkg.price)}</span>
                      <span className="text-sm text-muted-foreground ml-2 block sm:inline">
                        ({formatCurrency(pkg.price / pkg.session_count)}/session)
                      </span>
                    </div>
                    <CheckoutButton
                      type="package"
                      itemId={pkg.id}
                      coachId={coachId}
                      label="Purchase"
                      size="sm"
                      className="w-full sm:w-auto"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Valid for {pkg.validity_days} days after purchase
                  </p>
                </div>
              ))}
            </TabsContent>
          )}

          {hasPlans && (
            <TabsContent value="subscriptions" className="space-y-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{plan.name}</h4>
                      {plan.description && (
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {plan.billing_period}
                    </Badge>
                  </div>

                  {plan.features && plan.features.length > 0 && (
                    <ul className="space-y-1 my-3">
                      {plan.features.slice(0, 4).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-3 w-3 text-primary" />
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 4 && (
                        <li className="text-xs text-muted-foreground">
                          +{plan.features.length - 4} more features
                        </li>
                      )}
                    </ul>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                    <div className="min-w-0">
                      <span className="text-2xl font-bold text-primary">{formatCurrency(plan.price)}</span>
                      <span className="text-sm text-muted-foreground">/{plan.billing_period}</span>
                    </div>
                    <CheckoutButton
                      type="subscription"
                      itemId={plan.id}
                      coachId={coachId}
                      label="Subscribe"
                      size="sm"
                      className="w-full sm:w-auto"
                    />
                  </div>
                </div>
              ))}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CoachPricingSection;
