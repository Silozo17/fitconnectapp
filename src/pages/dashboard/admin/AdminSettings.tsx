import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePlatformSettings, useUpdatePlatformSetting } from "@/hooks/useAdminData";
import { toast } from "sonner";
import { Settings, Bell, Shield, Globe, Loader2, Plug } from "lucide-react";
import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { Separator } from "@/components/ui/separator";

const AdminSettings = () => {
  const { data: settings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSetting();

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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Settings | Admin</title>
      </Helmet>

      <AdminLayout>
        <div className="space-y-6 max-w-4xl">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Platform Settings</h1>
            <p className="text-muted-foreground mt-1">Configure platform-wide settings and preferences</p>
          </div>

          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-2">
                <Plug className="h-4 w-4" />
                Integrations
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Pricing
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
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

            <TabsContent value="pricing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Settings</CardTitle>
                  <CardDescription>Configure commission rates and price limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Platform Commission Rate (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={localSettings.commission_rate}
                        onChange={(e) => handleChange("commission_rate", Number(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Percentage taken from each client payment to coaches
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Default Currency</Label>
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

                    <div className="space-y-2">
                      <Label>Minimum Session Price</Label>
                      <Input
                        type="number"
                        min="0"
                        value={localSettings.min_session_price}
                        onChange={(e) => handleChange("min_session_price", Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Maximum Session Price</Label>
                      <Input
                        type="number"
                        min="0"
                        value={localSettings.max_session_price}
                        onChange={(e) => handleChange("max_session_price", Number(e.target.value))}
                      />
                    </div>
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
