import { useState } from "react";
import { Package, RefreshCcw, Plus, Edit, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCoachPackages, useCoachSubscriptionPlans, useUpdatePackage, useUpdateSubscriptionPlan } from "@/hooks/usePackages";
import type { CoachPackage, CoachSubscriptionPlan } from "@/hooks/usePackages";
import CreatePackageModal from "@/components/packages/CreatePackageModal";
import CreateSubscriptionPlanModal from "@/components/packages/CreateSubscriptionPlanModal";
import { toast } from "sonner";
import { useLocale } from "@/contexts/LocaleContext";
import { useTranslation } from "@/hooks/useTranslation";

const CoachPackages = () => {
  const { t } = useTranslation('coach');
  const { formatCurrency } = useLocale();
  const { data: packages = [], isLoading: packagesLoading } = useCoachPackages();
  const { data: plans = [], isLoading: plansLoading } = useCoachSubscriptionPlans();
  const updatePackage = useUpdatePackage();
  const updatePlan = useUpdateSubscriptionPlan();

  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editPackage, setEditPackage] = useState<CoachPackage | null>(null);
  const [editPlan, setEditPlan] = useState<CoachSubscriptionPlan | null>(null);

  const handleTogglePackage = async (pkg: CoachPackage) => {
    try {
      await updatePackage.mutateAsync({ id: pkg.id, is_active: !pkg.is_active });
      toast.success(pkg.is_active ? t('packages.inactive') : t('packages.active'));
    } catch {
      toast.error(t('packages.failedToSave'));
    }
  };

  const handleTogglePlan = async (plan: CoachSubscriptionPlan) => {
    try {
      await updatePlan.mutateAsync({ id: plan.id, is_active: !plan.is_active });
      toast.success(plan.is_active ? t('subscriptionPlans.planUpdated') : t('subscriptionPlans.planUpdated'));
    } catch {
      toast.error(t('subscriptionPlans.failedToSave'));
    }
  };

  const PackageCard = ({ pkg }: { pkg: CoachPackage }) => (
    <Card className={!pkg.is_active ? "opacity-60" : ""}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{pkg.name}</h3>
              <Badge variant={pkg.is_active ? "default" : "secondary"}>
                {pkg.is_active ? t('packages.active') : t('packages.inactive')}
              </Badge>
            </div>
            {pkg.description && (
              <p className="text-sm text-muted-foreground">{pkg.description}</p>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('packages.editPackage')}
              onClick={() => {
                setEditPackage(pkg);
                setShowPackageModal(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={pkg.is_active ? t('packages.inactive') : t('packages.active')}
              onClick={() => handleTogglePackage(pkg)}
            >
              {pkg.is_active ? (
                <ToggleRight className="h-4 w-4 text-primary" />
              ) : (
                <ToggleLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t border-border">
          <div>
            <p className="text-2xl font-bold text-foreground">{pkg.session_count}</p>
            <p className="text-xs text-muted-foreground">{t('packagesPage.sessions')}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{formatCurrency(pkg.price)}</p>
            <p className="text-xs text-muted-foreground">{t('packagesPage.totalPrice')}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{pkg.validity_days}</p>
            <p className="text-xs text-muted-foreground">{t('packagesPage.daysValid')}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-3">
          {formatCurrency(pkg.price / pkg.session_count)} {t('packagesPage.perSession')}
        </p>
      </CardContent>
    </Card>
  );

  const SubscriptionCard = ({ plan }: { plan: CoachSubscriptionPlan }) => (
    <Card className={!plan.is_active ? "opacity-60" : ""}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{plan.name}</h3>
              <Badge variant={plan.is_active ? "default" : "secondary"}>
                {plan.is_active ? t('subscriptionPlans.active') : t('packages.inactive')}
              </Badge>
            </div>
            {plan.description && (
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditPlan(plan);
                setShowPlanModal(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleTogglePlan(plan)}
            >
              {plan.is_active ? (
                <ToggleRight className="h-4 w-4 text-primary" />
              ) : (
                <ToggleLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-3xl font-bold text-primary">{formatCurrency(plan.price)}</span>
          <span className="text-muted-foreground">/{plan.billing_period}</span>
        </div>

        {plan.sessions_per_period && (
          <p className="text-sm text-muted-foreground mb-3">
            {plan.sessions_per_period} {t('packagesPage.sessionsPer')} {plan.billing_period.replace("ly", "")}
          </p>
        )}

        {plan.features && plan.features.length > 0 && (
          <ul className="space-y-1 text-sm">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-muted-foreground">
                <span className="text-primary">✓</span> {feature}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );

  const isLoading = packagesLoading || plansLoading;

  return (
    <DashboardLayout title={t('packagesPage.title')} description={t('packagesPage.subtitle')}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('packagesPage.title')}</h1>
        <p className="text-muted-foreground">
          {t('packagesPage.subtitle')}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="packages" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="packages" className="gap-2">
                <Package className="h-4 w-4" />
                {t('packagesPage.packages')} ({packages.length})
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                {t('packagesPage.subscriptions')} ({plans.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="packages" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => { setEditPackage(null); setShowPackageModal(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                {t('packagesPage.createPackage')}
              </Button>
            </div>

            {packages.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{t('packagesPage.noPackages')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t('packagesPage.noPackagesDesc')}
                  </p>
                  <Button onClick={() => setShowPackageModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('packagesPage.createFirstPackage')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => { setEditPlan(null); setShowPlanModal(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                {t('packagesPage.createSubscriptionPlan')}
              </Button>
            </div>

            {plans.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <RefreshCcw className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{t('packagesPage.noSubscriptions')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t('packagesPage.noSubscriptionsDesc')}
                  </p>
                  <Button onClick={() => setShowPlanModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('packagesPage.createFirstPlan')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <SubscriptionCard key={plan.id} plan={plan} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <CreatePackageModal
        open={showPackageModal}
        onOpenChange={setShowPackageModal}
        editPackage={editPackage}
      />

      <CreateSubscriptionPlanModal
        open={showPlanModal}
        onOpenChange={setShowPlanModal}
        editPlan={editPlan}
      />
    </DashboardLayout>
  );
};

export default CoachPackages;