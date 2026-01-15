import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGym } from "@/contexts/GymContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditPackageManager } from "@/components/gym/settings/CreditPackageManager";
import { VATSettings } from "@/components/gym/settings/VATSettings";
import { LocationStripeConnect } from "@/components/gym/settings/LocationStripeConnect";
import { RolePermissionsEditor } from "@/components/gym/settings/RolePermissionsEditor";
import {
  Building2,
  Upload,
  Globe,
  Palette,
  Bell,
  Shield,
  CreditCard,
  Save,
  Calendar,
  Check,
} from "lucide-react";

export default function GymAdminSettings() {
  const { gymId } = useParams<{ gymId: string }>();
  const { gym, refetch } = useGym();
  const [isSaving, setIsSaving] = useState(false);
  
  // Parse settings from gym
  const gymSettings = (gym?.settings as { class_display?: { show_coach_name?: boolean } }) || {};
  const classDisplaySettings = gymSettings.class_display || { show_coach_name: true };
  
  const [showCoachName, setShowCoachName] = useState(classDisplaySettings.show_coach_name ?? true);

  // Update local state when gym data changes
  useEffect(() => {
    const settings = (gym?.settings as { class_display?: { show_coach_name?: boolean } }) || {};
    setShowCoachName(settings.class_display?.show_coach_name ?? true);
  }, [gym?.settings]);

  // Form state
  const [formData, setFormData] = useState({
    name: gym?.name || "",
    description: gym?.description || "",
    email: gym?.email || "",
    phone: gym?.phone || "",
    website: gym?.website || "",
    address_line_1: gym?.address_line_1 || "",
    address_line_2: gym?.address_line_2 || "",
    city: gym?.city || "",
    postcode: gym?.postcode || "",
    country: gym?.country || "GB",
  });

  const handleSave = async () => {
    if (!gym?.id) return;
    setIsSaving(true);
    
    try {
      // Merge new settings with existing settings
      const updatedSettings = {
        ...(gym.settings as object || {}),
        class_display: {
          show_coach_name: showCoachName,
        },
      };

      const { error } = await supabase
        .from("gym_profiles")
        .update({
          name: formData.name,
          description: formData.description,
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
          address_line_1: formData.address_line_1,
          address_line_2: formData.address_line_2,
          city: formData.city,
          postcode: formData.postcode,
          country: formData.country,
          settings: updatedSettings,
        })
        .eq("id", gym.id);

      if (error) throw error;
      
      toast.success("Settings saved successfully");
      refetch?.();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your gym's profile, branding, and preferences.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="general">
            <Building2 className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="classes">
            <Calendar className="mr-2 h-4 w-4" />
            Classes
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Palette className="mr-2 h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          {/* Logo & Cover */}
          <Card>
            <CardHeader>
              <CardTitle>Logo & Images</CardTitle>
              <CardDescription>
                Upload your gym's logo and cover image.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={gym?.logo_url || undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    <Building2 className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h4 className="font-medium">Gym Logo</h4>
                  <p className="text-sm text-muted-foreground">
                    Recommended: 200x200px, PNG or JPG
                  </p>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Cover Image</h4>
                  <p className="text-sm text-muted-foreground">
                    Recommended: 1920x600px, PNG or JPG
                  </p>
                </div>
                <div className="h-32 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/50">
                  {gym?.cover_image_url ? (
                    <img
                      src={gym.cover_image_url}
                      alt="Cover"
                      className="h-full w-full object-cover rounded-lg"
                    />
                  ) : (
                    <Button variant="ghost">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Cover Image
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Your gym's core details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Gym Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Member Signup URL</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-sm text-muted-foreground whitespace-nowrap">
                      getfitconnect.co.uk/gym-signup/
                    </span>
                    <Input
                      id="slug"
                      value={gym?.slug || ""}
                      disabled
                      className="rounded-l-none"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share this link with potential members to sign up.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe your gym..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    placeholder="https://"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
              <CardDescription>
                Your gym's physical location.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address_line_1">Address Line 1</Label>
                <Input
                  id="address_line_1"
                  value={formData.address_line_1}
                  onChange={(e) =>
                    setFormData({ ...formData, address_line_1: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_line_2">Address Line 2</Label>
                <Input
                  id="address_line_2"
                  value={formData.address_line_2}
                  onChange={(e) =>
                    setFormData({ ...formData, address_line_2: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) =>
                      setFormData({ ...formData, postcode: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classes Settings */}
        <TabsContent value="classes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Class Display Settings</CardTitle>
              <CardDescription>
                Control how classes appear to members on booking calendars.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="show-coach-name" className="text-base font-medium">
                    Show Coach Name on Schedule
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Display the instructor/coach name on member-facing class schedules and booking calendar.
                  </p>
                </div>
                <Switch
                  id="show-coach-name"
                  checked={showCoachName}
                  onCheckedChange={setShowCoachName}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>
                Customize your gym's color scheme.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-10 w-10 rounded-lg border"
                      style={{ backgroundColor: gym?.primary_color || "#FF6B35" }}
                    />
                    <Input
                      value={gym?.primary_color || "#FF6B35"}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-10 w-10 rounded-lg border"
                      style={{ backgroundColor: gym?.secondary_color || "#1A1A2E" }}
                    />
                    <Input
                      value={gym?.secondary_color || "#1A1A2E"}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-10 w-10 rounded-lg border"
                      style={{ backgroundColor: gym?.accent_color || "#00D9FF" }}
                    />
                    <Input
                      value={gym?.accent_color || "#00D9FF"}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Member Notifications</CardTitle>
              <CardDescription>
                Configure automated notifications sent to members.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Class Booking Confirmations</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email confirmations when members book classes.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Class Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Send reminders 24 hours before scheduled classes.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Membership Expiry Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify members when their membership is about to expire.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Waitlist Promotions</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify members when they're promoted from a class waitlist.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Staff Notifications</CardTitle>
              <CardDescription>
                Configure notifications for gym staff.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Failed Check-In Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Alert staff when a member check-in fails validation.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when product inventory falls below threshold.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="space-y-6">
          <LocationStripeConnect />
          <VATSettings />
          <CreditPackageManager />
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
              <CardDescription>
                Configure member access and check-in rules.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">QR Code Check-In</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow members to check in using QR codes.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Require Active Membership</Label>
                  <p className="text-sm text-muted-foreground">
                    Only allow check-ins for members with active memberships.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Multi-Location Access</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow members to access other gym locations.
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <RolePermissionsEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
