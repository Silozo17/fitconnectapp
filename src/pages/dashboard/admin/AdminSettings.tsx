import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  usePlatformSettings, 
  useUpdatePlatformSetting, 
  useTierFeatures, 
  usePlatformFeatures, 
  useUpdateTierFeature,
  useCoachFeatureOverrides,
  useSetFeatureOverride,
  useRemoveFeatureOverride 
} from "@/hooks/useAdminData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Settings, Bell, Shield, Globe, Loader2, Plug, User, LogOut, CreditCard, Sliders, Plus, Edit, Trash2, Crown, Zap, Rocket, Star } from "lucide-react";
import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { Separator } from "@/components/ui/separator";
import { AccountSecuritySection } from "@/components/shared/AccountSecuritySection";
import { useAuth } from "@/contexts/AuthContext";

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

const AdminSettings = () => {
  const { data: settings, isLoading } = usePlatformSettings();
  const { signOut } = useAuth();
  const updateSetting = useUpdatePlatformSetting();
  const { data: tierFeatures } = useTierFeatures();
  const { data: platformFeatures } = usePlatformFeatures();
  const updateTierFeature = useUpdateTierFeature();
  const { data: allOverrides } = useCoachFeatureOverrides("");
  const setOverride = useSetFeatureOverride();
  const removeOverride = useRemoveFeatureOverride();

  const [localSettings, setLocalSettings] = useState({
    email_notifications: true,
    auto_approve_coaches: false,
    maintenance_mode: false,
    commission_rate: 15,
    currency: "GBP",
    min_session_price: 10,
    max_session_price: 500,
    require_coach_verification: true,
    allow_anonymous_reviews: false,
  });

  const [editingTier, setEditingTier] = useState<PlanTier | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    coachId: "",
    featureId: "",
    value: "",
    reason: "",
  });

  // Fetch coaches for override selection
  const { data: coaches } = useQuery({
    queryKey: ["coaches-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_profiles")
        .select("id, display_name, subscription_tier")
        .order("display_name");
      if (error) throw error;
      return data;
    },
  });

  // Ensure tiers is always a valid array
  const rawTiers = settings?.subscription_tiers;
  const tiers: PlanTier[] = Array.isArray(rawTiers) 
    ? rawTiers 
    : (typeof rawTiers === 'string' ? JSON.parse(rawTiers) : defaultTiers);

  useEffect(() => {
    if (settings) {
      setLocalSettings(prev => ({
        ...prev,
        email_notifications: settings.email_notifications ?? true,
        auto_approve_coaches: settings.auto_approve_coaches ?? false,
        maintenance_mode: settings.maintenance_mode ?? false,
        commission_rate: settings.commission_rate ?? 15,
        currency: settings.currency ?? "GBP",
        min_session_price: settings.min_session_price ?? 10,
        max_session_price: settings.max_session_price ?? 500,
        require_coach_verification: settings.require_coach_verification ?? true,
        allow_anonymous_reviews: settings.allow_anonymous_reviews ?? false,
      }));
    }
  }, [settings]);

  const handleSave = async () => {
    const updates = Object.entries(localSettings).map(([key, value]) =>
      updateSetting.mutateAsync({ key, value })
    );
    
    await Promise.all(updates);
    toast.success("Settings saved successfully");
  };

  const handleToggle = (key: string, value: boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

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

  const getFeatureValueDisplay = (value: any) => {
    if (typeof value === "boolean") {
      return value ? (
        <Badge variant="default" className="bg-green-500/10 text-green-500">Enabled</Badge>
      ) : (
        <Badge variant="secondary">Disabled</Badge>
      );
    }
    if (typeof value === "number") {
      return <Badge variant="outline">{value}</Badge>;
    }
    return <Badge variant="outline">{String(value)}</Badge>;
  };

  const handleAddOverride = async () => {
    if (!overrideForm.coachId || !overrideForm.featureId) {
      toast.error("Please select a coach and feature");
      return;
    }

    let parsedValue: any = overrideForm.value;
    const feature = platformFeatures?.find((f: any) => f.id === overrideForm.featureId);
    
    if (feature?.feature_type === "boolean") {
      parsedValue = overrideForm.value === "true";
    } else if (feature?.feature_type === "number") {
      parsedValue = Number(overrideForm.value);
    }

    await setOverride.mutateAsync({
      coachId: overrideForm.coachId,
      featureId: overrideForm.featureId,
      value: parsedValue,
      reason: overrideForm.reason,
    });

    setIsOverrideDialogOpen(false);
    setOverrideForm({ coachId: "", featureId: "", value: "", reason: "" });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  const featureTiers = ["free", "starter", "pro", "enterprise"];

  return (
    <>
      <Helmet>
        <title>Settings | Admin</title>
      </Helmet>

      <AdminLayout>
        <div className="space-y-6 max-w-5xl">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Platform Settings</h1>
            <p className="text-muted-foreground mt-1">Configure platform-wide settings and preferences</p>
          </div>

          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="flex-wrap">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="plans" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Plans
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                Features
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-2">
                <Plug className="h-4 w-4" />
                Integrations
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Platform-wide configuration options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Put the platform in maintenance mode (users can't access)
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.maintenance_mode}
                      onCheckedChange={(checked) => handleToggle("maintenance_mode", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-Approve Coaches</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically approve new coach registrations
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.auto_approve_coaches}
                      onCheckedChange={(checked) => handleToggle("auto_approve_coaches", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Coach Verification</Label>
                      <p className="text-sm text-muted-foreground">
                        Coaches must be verified before appearing in marketplace
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.require_coach_verification}
                      onCheckedChange={(checked) => handleToggle("require_coach_verification", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Display Preferences</CardTitle>
                  <CardDescription>Language and regional settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <LanguageSelector />
                  <Separator />
                  <div className="space-y-2">
                    <Label>Default Currency</Label>
                    <Select
                      value={localSettings.currency}
                      onValueChange={(value) => handleChange("currency", value)}
                    >
                      <SelectTrigger className="max-w-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Default currency for new users</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Plans Tab - Consolidated from AdminPlatformPlans */}
            <TabsContent value="plans" className="space-y-6">
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
                        value={localSettings.commission_rate}
                        onChange={(e) => handleChange("commission_rate", Number(e.target.value))}
                      />
                      <p className="text-sm text-muted-foreground">
                        Percentage taken from each client payment to coaches
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select 
                        value={localSettings.currency}
                        onValueChange={(value) => handleChange("currency", value)}
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
            </TabsContent>

            {/* Features Tab - Consolidated from AdminFeatures */}
            <TabsContent value="features" className="space-y-4">
              <Tabs defaultValue="matrix" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="matrix">Feature Matrix</TabsTrigger>
                  <TabsTrigger value="overrides">Coach Overrides</TabsTrigger>
                </TabsList>

                <TabsContent value="matrix" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sliders className="h-5 w-5" />
                        Feature Access by Tier
                      </CardTitle>
                      <CardDescription>
                        View which features are available for each subscription tier
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[300px]">Feature</TableHead>
                              {featureTiers.map((tier) => (
                                <TableHead key={tier} className="text-center capitalize">{tier}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {platformFeatures?.map((feature: any) => (
                              <TableRow key={feature.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{feature.name}</p>
                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                  </div>
                                </TableCell>
                                {featureTiers.map((tier) => {
                                  const tf = tierFeatures?.find(
                                    (tf: any) => tf.tier === tier && tf.feature_id === feature.id
                                  );
                                  return (
                                    <TableCell key={tier} className="text-center">
                                      {getFeatureValueDisplay(tf?.value)}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">
                        To edit feature values, go to the Plans tab.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="overrides" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Coach Feature Overrides
                          </CardTitle>
                          <CardDescription>
                            Grant or restrict specific features for individual coaches
                          </CardDescription>
                        </div>
                        <Dialog open={isOverrideDialogOpen} onOpenChange={setIsOverrideDialogOpen}>
                          <DialogTrigger asChild>
                            <Button>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Override
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Feature Override</DialogTitle>
                              <DialogDescription>
                                Grant or restrict a specific feature for a coach
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Coach</Label>
                                <Select 
                                  value={overrideForm.coachId}
                                  onValueChange={(value) => setOverrideForm(prev => ({ ...prev, coachId: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a coach" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {coaches?.map((coach: any) => (
                                      <SelectItem key={coach.id} value={coach.id}>
                                        {coach.display_name || "Unknown"} ({coach.subscription_tier})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Feature</Label>
                                <Select 
                                  value={overrideForm.featureId}
                                  onValueChange={(value) => setOverrideForm(prev => ({ ...prev, featureId: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a feature" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {platformFeatures?.map((feature: any) => (
                                      <SelectItem key={feature.id} value={feature.id}>
                                        {feature.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Value</Label>
                                {platformFeatures?.find((f: any) => f.id === overrideForm.featureId)?.feature_type === "boolean" ? (
                                  <Select 
                                    value={overrideForm.value}
                                    onValueChange={(value) => setOverrideForm(prev => ({ ...prev, value }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select value" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="true">Enabled</SelectItem>
                                      <SelectItem value="false">Disabled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input 
                                    value={overrideForm.value}
                                    onChange={(e) => setOverrideForm(prev => ({ ...prev, value: e.target.value }))}
                                    placeholder="Enter value"
                                  />
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Reason (optional)</Label>
                                <Input 
                                  value={overrideForm.reason}
                                  onChange={(e) => setOverrideForm(prev => ({ ...prev, reason: e.target.value }))}
                                  placeholder="Why is this override being applied?"
                                />
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsOverrideDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddOverride}>Add Override</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {allOverrides && allOverrides.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Coach</TableHead>
                              <TableHead>Feature</TableHead>
                              <TableHead>Value</TableHead>
                              <TableHead>Reason</TableHead>
                              <TableHead>Expires</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allOverrides.map((override: any) => (
                              <TableRow key={override.id}>
                                <TableCell>
                                  {coaches?.find((c: any) => c.id === override.coach_id)?.display_name || "Unknown"}
                                </TableCell>
                                <TableCell>{override.platform_features?.name}</TableCell>
                                <TableCell>{getFeatureValueDisplay(override.value)}</TableCell>
                                <TableCell className="text-muted-foreground">
                                  {override.reason || "-"}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {override.expires_at 
                                    ? new Date(override.expires_at).toLocaleDateString() 
                                    : "Never"}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => removeOverride.mutate(override.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No feature overrides configured</p>
                          <p className="text-sm">Add overrides to grant or restrict features for specific coaches</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Notification Settings</CardTitle>
                  <CardDescription>Configure platform-wide email and notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send email notifications for important events
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.email_notifications}
                      onCheckedChange={(checked) => handleToggle("email_notifications", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="pt-4">
                <h3 className="text-lg font-semibold mb-4">Your Personal Preferences</h3>
                <NotificationPreferences />
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Integrations</CardTitle>
                  <CardDescription>Monitor and manage third-party service connections</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <p className="font-medium">Stripe</p>
                      <p className="text-sm text-muted-foreground">Payment processing - Connected</p>
                    </Card>
                    <Card className="p-4">
                      <p className="font-medium">Wearables</p>
                      <p className="text-sm text-muted-foreground">Fitness device sync - 3 providers</p>
                    </Card>
                    <Card className="p-4">
                      <p className="font-medium">Calendar</p>
                      <p className="text-sm text-muted-foreground">Session scheduling - Google Calendar</p>
                    </Card>
                    <Card className="p-4">
                      <p className="font-medium">Video</p>
                      <p className="text-sm text-muted-foreground">Video conferencing - Zoom, Google Meet</p>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Configure security and privacy options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Anonymous Reviews</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow clients to post reviews without showing their name
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.allow_anonymous_reviews}
                      onCheckedChange={(checked) => handleToggle("allow_anonymous_reviews", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-4">
              <AccountSecuritySection />
              
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle>Session</CardTitle>
                  <CardDescription>Sign out of your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={updateSetting.isPending}>
              {updateSetting.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminSettings;