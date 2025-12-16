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

const CoachPackages = () => {
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
      toast.success(pkg.is_active ? "Package deactivated" : "Package activated");
    } catch {
      toast.error("Failed to update package");
    }
  };

  const handleTogglePlan = async (plan: CoachSubscriptionPlan) => {
    try {
      await updatePlan.mutateAsync({ id: plan.id, is_active: !plan.is_active });
      toast.success(plan.is_active ? "Plan deactivated" : "Plan activated");
    } catch {
      toast.error("Failed to update plan");
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
                {pkg.is_active ? "Active" : "Inactive"}
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
            <p className="text-xs text-muted-foreground">Sessions</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">£{pkg.price}</p>
            <p className="text-xs text-muted-foreground">Total Price</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{pkg.validity_days}</p>
            <p className="text-xs text-muted-foreground">Days Valid</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-3">
          £{(pkg.price / pkg.session_count).toFixed(2)} per session
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
                {plan.is_active ? "Active" : "Inactive"}
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
          <span className="text-3xl font-bold text-primary">£{plan.price}</span>
          <span className="text-muted-foreground">/{plan.billing_period}</span>
        </div>

        {plan.sessions_per_period && (
          <p className="text-sm text-muted-foreground mb-3">
            {plan.sessions_per_period} sessions per {plan.billing_period.replace("ly", "")}
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
    <DashboardLayout title="Packages & Subscriptions" description="Manage your pricing packages">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Packages & Subscriptions</h1>
        <p className="text-muted-foreground">
          Create session packages and subscription plans for your clients
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
                Packages ({packages.length})
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Subscriptions ({plans.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="packages" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => { setEditPackage(null); setShowPackageModal(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Create Package
              </Button>
            </div>

            {packages.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No packages yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create session packages to offer bulk discounts to clients
                  </p>
                  <Button onClick={() => setShowPackageModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Package
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
                Create Subscription Plan
              </Button>
            </div>

            {plans.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <RefreshCcw className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No subscription plans yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create recurring subscription plans for ongoing coaching
                  </p>
                  <Button onClick={() => setShowPlanModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Plan
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
