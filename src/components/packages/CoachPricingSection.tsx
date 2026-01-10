import { Package, Check } from "lucide-react";
import { ContentSection, ContentSectionHeader } from "@/components/shared/ContentSection";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCoachPackages, useCoachSubscriptionPlans } from "@/hooks/usePackages";
import { Skeleton } from "@/components/ui/skeleton";
import CheckoutButton from "@/components/payments/CheckoutButton";
import { formatCurrency, type CurrencyCode } from "@/lib/currency";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { useTranslation } from "@/hooks/useTranslation";

interface CoachPricingSectionProps {
  coachId: string;
  onSelectPackage?: (packageId: string) => void;
  onSelectPlan?: (planId: string) => void;
}

const CoachPricingSection = ({ coachId, onSelectPackage, onSelectPlan }: CoachPricingSectionProps) => {
  const { t } = useTranslation('coaches');
  const { convertForViewer } = useExchangeRates();
  const { data: packages = [], isLoading: packagesLoading } = useCoachPackages(coachId);
  const { data: plans = [], isLoading: plansLoading } = useCoachSubscriptionPlans(coachId);

  const isLoading = packagesLoading || plansLoading;
  const hasPackages = packages.length > 0;
  const hasPlans = plans.length > 0;

  if (isLoading) {
    return (
      <ContentSection colorTheme="green">
        <ContentSectionHeader
          icon={Package}
          title={t('profile.pricingPackages')}
        />
        <div className="space-y-4 pt-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </ContentSection>
    );
  }

  if (!hasPackages && !hasPlans) {
    return null;
  }

  return (
    <ContentSection colorTheme="green">
      <ContentSectionHeader
        icon={Package}
        title={t('profile.pricingPackages')}
      />
      
      <div className="pt-4">
        <Tabs defaultValue={hasPackages ? "packages" : "subscriptions"}>
          <TabsList className="mb-4">
            {hasPackages && (
              <TabsTrigger value="packages">
                {t('profile.sessionPackages')}
              </TabsTrigger>
            )}
            {hasPlans && (
              <TabsTrigger value="subscriptions">
                {t('profile.subscriptions')}
              </TabsTrigger>
            )}
          </TabsList>

          {hasPackages && (
            <TabsContent value="packages" className="space-y-3">
              {packages.map((pkg) => {
                const pkgCurrency = (pkg.currency as CurrencyCode) || 'GBP';
                const convertedPrice = convertForViewer(pkg.price, pkgCurrency);
                const convertedPerSession = convertForViewer(pkg.price / pkg.session_count, pkgCurrency);

                return (
                  <div
                    key={pkg.id}
                    className="bg-muted/30 rounded-xl p-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground">{pkg.name}</h4>
                        {pkg.description && (
                          <p className="text-sm text-muted-foreground">{pkg.description}</p>
                        )}
                      </div>
                      <Badge variant="secondary">{t('profile.sessions', { count: pkg.session_count })}</Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                      <div className="min-w-0">
                        <span className="text-2xl font-bold text-primary">
                          {formatCurrency(convertedPrice.amount, convertedPrice.currency)}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2 block sm:inline">
                          ({formatCurrency(convertedPerSession.amount, convertedPerSession.currency)}{t('profile.perSession')})
                        </span>
                        {convertedPrice.wasConverted && (
                          <span className="text-xs text-muted-foreground block">
                            {t('profile.original')}: {formatCurrency(convertedPrice.originalAmount, convertedPrice.originalCurrency)}
                          </span>
                        )}
                      </div>
                      <CheckoutButton
                        type="package"
                        itemId={pkg.id}
                        coachId={coachId}
                        label={t('profile.purchase')}
                        size="sm"
                        className="w-full sm:w-auto"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('profile.validForDays', { days: pkg.validity_days })}
                    </p>
                  </div>
                );
              })}
            </TabsContent>
          )}

          {hasPlans && (
            <TabsContent value="subscriptions" className="space-y-3">
              {plans.map((plan) => {
                const planCurrency = (plan.currency as CurrencyCode) || 'GBP';
                const convertedPrice = convertForViewer(plan.price, planCurrency);

                return (
                  <div
                    key={plan.id}
                    className="bg-muted/30 rounded-xl p-4 hover:bg-muted/40 transition-colors"
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
                            {t('profile.moreFeatures', { count: plan.features.length - 4 })}
                          </li>
                        )}
                      </ul>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                      <div className="min-w-0">
                        <span className="text-2xl font-bold text-primary">
                          {formatCurrency(convertedPrice.amount, convertedPrice.currency)}
                        </span>
                        <span className="text-sm text-muted-foreground">/{plan.billing_period}</span>
                        {convertedPrice.wasConverted && (
                          <span className="text-xs text-muted-foreground block">
                            {t('profile.original')}: {formatCurrency(convertedPrice.originalAmount, convertedPrice.originalCurrency)}
                          </span>
                        )}
                      </div>
                      <CheckoutButton
                        type="subscription"
                        itemId={plan.id}
                        coachId={coachId}
                        label={t('profile.subscribe')}
                        size="sm"
                        className="w-full sm:w-auto"
                      />
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </ContentSection>
  );
};

export default CoachPricingSection;
