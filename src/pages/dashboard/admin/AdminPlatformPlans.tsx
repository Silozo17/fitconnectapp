import { useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePlatformSettings, useUpdatePlatformSetting, useTierFeatures, usePlatformFeatures, useUpdateTierFeature } from "@/hooks/useAdminData";
import { Plus, Edit, Trash2, Check, X, Crown, Zap, Rocket, Star } from "lucide-react";
import { toast } from "sonner";

interface PlanTier {
  id: string;
  name: string;
  price: number;
  billingPeriod: string;
  description: string;
  isActive: boolean;
  icon: string;
}

const defaultTiers: PlanTier[] = [
  { id: "free", name: "Free", price: 0, billingPeriod: "monthly", description: "Basic features for getting started", isActive: true, icon: "star" },
  { id: "starter", name: "Starter", price: 19, billingPeriod: "monthly", description: "For coaches just starting out", isActive: true, icon: "zap" },
  { id: "pro", name: "Pro", price: 49, billingPeriod: "monthly", description: "For growing coaching businesses", isActive: true, icon: "rocket" },
  { id: "enterprise", name: "Enterprise", price: 99, billingPeriod: "monthly", description: "For established coaching practices", isActive: true, icon: "crown" },
];

const tierIcons: Record<string, any> = {
  star: Star,
  zap: Zap,
  rocket: Rocket,
  crown: Crown,
};

const AdminPlatformPlans = () => {
  const { data: settings, isLoading: settingsLoading } = usePlatformSettings();
  const { data: tierFeatures } = useTierFeatures();
  const { data: platformFeatures } = usePlatformFeatures();
  const updateSetting = useUpdatePlatformSetting();
  const updateTierFeature = useUpdateTierFeature();
  
  const [editingTier, setEditingTier] = useState<PlanTier | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Ensure tiers is always a valid array
  const rawTiers = settings?.subscription_tiers;
  const tiers: PlanTier[] = Array.isArray(rawTiers) 
    ? rawTiers 
    : (typeof rawTiers === 'string' ? JSON.parse(rawTiers) : defaultTiers);

  const handleSaveTier = async () => {
    if (!editingTier) return;
    
    const updatedTiers = tiers.map((t: PlanTier) => 
      t.id === editingTier.id ? editingTier : t
    );
    
    await updateSetting.mutateAsync({
      key: "subscription_tiers",
      value: updatedTiers,
      description: "Platform subscription tier configuration",
    });
    
    setIsDialogOpen(false);
    setEditingTier(null);
    toast.success("Plan updated successfully");
  };

  const handleToggleTier = async (tierId: string, isActive: boolean) => {
    const updatedTiers = tiers.map((t: PlanTier) => 
      t.id === tierId ? { ...t, isActive } : t
    );
    
    await updateSetting.mutateAsync({
      key: "subscription_tiers",
      value: updatedTiers,
      description: "Platform subscription tier configuration",
    });
  };

  const getFeatureValue = (tier: string, featureId: string) => {
    const tf = tierFeatures?.find(
      (tf: any) => tf.tier === tier && tf.feature_id === featureId
    );
    return tf?.value;
  };

  const handleFeatureChange = async (tier: string, featureId: string, value: any) => {
    await updateTierFeature.mutateAsync({ tier, featureId, value });
  };

  if (settingsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Platform Plans | Admin</title>
      </Helmet>

      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Platform Pricing Plans</h1>
              <p className="text-muted-foreground mt-1">Manage subscription tiers and pricing</p>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier: PlanTier) => {
              const IconComponent = tierIcons[tier.icon] || Star;
              return (
                <Card key={tier.id} className={!tier.isActive ? "opacity-60" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{tier.name}</CardTitle>
                      </div>
                      <Switch 
                        checked={tier.isActive} 
                        onCheckedChange={(checked) => handleToggleTier(tier.id, checked)}
                      />
                    </div>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">£{tier.price}</span>
                      <span className="text-muted-foreground">/{tier.billingPeriod}</span>
                    </div>
                    
                    <Dialog open={isDialogOpen && editingTier?.id === tier.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) setEditingTier(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setEditingTier(tier)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Plan
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit {tier.name} Plan</DialogTitle>
                          <DialogDescription>
                            Update the pricing and details for this tier
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Plan Name</Label>
                            <Input 
                              value={editingTier?.name || ""} 
                              onChange={(e) => setEditingTier(prev => prev ? {...prev, name: e.target.value} : null)}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Price (£)</Label>
                              <Input 
                                type="number"
                                value={editingTier?.price || 0} 
                                onChange={(e) => setEditingTier(prev => prev ? {...prev, price: Number(e.target.value)} : null)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Billing Period</Label>
                              <Select 
                                value={editingTier?.billingPeriod}
                                onValueChange={(value) => setEditingTier(prev => prev ? {...prev, billingPeriod: value} : null)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea 
                              value={editingTier?.description || ""} 
                              onChange={(e) => setEditingTier(prev => prev ? {...prev, description: e.target.value} : null)}
                            />
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {
                            setIsDialogOpen(false);
                            setEditingTier(null);
                          }}>
                            Cancel
                          </Button>
                          <Button onClick={handleSaveTier}>Save Changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Feature Matrix */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Access by Tier</CardTitle>
              <CardDescription>Configure which features are available for each subscription tier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Feature</th>
                      {tiers.filter((t: PlanTier) => t.isActive).map((tier: PlanTier) => (
                        <th key={tier.id} className="text-center py-3 px-4 font-medium">{tier.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {platformFeatures?.map((feature: any) => (
                      <tr key={feature.id} className="border-b last:border-0">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{feature.name}</p>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                        </td>
                        {tiers.filter((t: PlanTier) => t.isActive).map((tier: PlanTier) => {
                          const value = getFeatureValue(tier.id, feature.id);
                          return (
                            <td key={tier.id} className="text-center py-3 px-4">
                              {feature.feature_type === "boolean" ? (
                                <Switch 
                                  checked={value === true}
                                  onCheckedChange={(checked) => handleFeatureChange(tier.id, feature.id, checked)}
                                />
                              ) : feature.feature_type === "number" ? (
                                <Input 
                                  type="number"
                                  className="w-20 mx-auto text-center"
                                  value={typeof value === "number" ? value : 0}
                                  onChange={(e) => handleFeatureChange(tier.id, feature.id, Number(e.target.value))}
                                />
                              ) : (
                                <Select 
                                  value={typeof value === "string" ? value : "none"}
                                  onValueChange={(newValue) => handleFeatureChange(tier.id, feature.id, newValue)}
                                >
                                  <SelectTrigger className="w-28 mx-auto">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="basic">Basic</SelectItem>
                                    <SelectItem value="standard">Standard</SelectItem>
                                    <SelectItem value="full">Full</SelectItem>
                                    <SelectItem value="advanced">Advanced</SelectItem>
                                    <SelectItem value="limited">Limited</SelectItem>
                                    <SelectItem value="unlimited">Unlimited</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Commission Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Commission Settings</CardTitle>
              <CardDescription>Platform fees for coach transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Platform Commission Rate (%)</Label>
                  <Input 
                    type="number"
                    defaultValue={settings?.commission_rate || 15}
                    onBlur={(e) => updateSetting.mutate({
                      key: "commission_rate",
                      value: Number(e.target.value),
                      description: "Platform commission rate for coach transactions",
                    })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Percentage taken from each client payment to coaches
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select 
                    defaultValue={settings?.currency || "GBP"}
                    onValueChange={(value) => updateSetting.mutate({
                      key: "currency",
                      value,
                      description: "Default platform currency",
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminPlatformPlans;