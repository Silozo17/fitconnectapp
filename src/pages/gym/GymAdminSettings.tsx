import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useGym, useIsOwnerOrAreaManager } from "@/contexts/GymContext";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditPackageManager } from "@/components/gym/settings/CreditPackageManager";
import { VATSettings } from "@/components/gym/settings/VATSettings";
import { LocationStripeConnect } from "@/components/gym/settings/LocationStripeConnect";
import { RolePermissionsEditor } from "@/components/gym/settings/RolePermissionsEditor";
import { LocationSettingsForm } from "@/components/gym/settings/LocationSettingsForm";
import { useGymLocations, useUpdateGymLocation, GymLocation } from "@/hooks/gym/useGymLocations";
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
  MapPin,
} from "lucide-react";

export default function GymAdminSettings() {
  const { gymId } = useParams<{ gymId: string }>();
  const { gym, refetch, staffRecord, userRole } = useGym();
  const isOwnerOrAreaManager = useIsOwnerOrAreaManager();
  const { data: locations, isLoading: isLoadingLocations } = useGymLocations();
  const updateLocation = useUpdateGymLocation();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLocationSaving, setIsLocationSaving] = useState(false);
  
  // Location selection state
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  
  // Parse settings from gym
  const gymSettings = (gym?.settings as { class_display?: { show_coach_name?: boolean } }) || {};
  const classDisplaySettings = gymSettings.class_display || { show_coach_name: true };
  
  const [showCoachName, setShowCoachName] = useState(classDisplaySettings.show_coach_name ?? true);

  // Determine available locations based on role
  const availableLocations = useMemo(() => {
    if (!locations?.length) return [];
    
    // Owners/Area Managers see all locations
    if (isOwnerOrAreaManager) return locations;
    
    // Managers see only their assigned locations
    const assignedIds = staffRecord?.assigned_location_ids || [];
    if (assignedIds.length > 0) {
      return locations.filter(loc => assignedIds.includes(loc.id));
    }
    
    // If no specific assignments, show all locations
    return locations;
  }, [locations, isOwnerOrAreaManager, staffRecord]);

  // Auto-select location based on role
  useEffect(() => {
    if (!availableLocations.length) return;
    
    if (isOwnerOrAreaManager) {
      // For owners: use saved selection or first location
      const saved = localStorage.getItem("selectedGymLocationId");
      const validSaved = saved && availableLocations.some(l => l.id === saved);
      setSelectedLocationId(validSaved ? saved : availableLocations[0].id);
    } else {
      // For managers: auto-select their first assigned location
      setSelectedLocationId(availableLocations[0].id);
    }
  }, [isOwnerOrAreaManager, availableLocations]);

  // Update local state when gym data changes
  useEffect(() => {
    const settings = (gym?.settings as { class_display?: { show_coach_name?: boolean } }) || {};
    setShowCoachName(settings.class_display?.show_coach_name ?? true);
  }, [gym?.settings]);

  const selectedLocation = useMemo(() => {
    return locations?.find(l => l.id === selectedLocationId) || null;
  }, [locations, selectedLocationId]);

  // Form state for gym-level settings (branding, etc.)
  const [formData, setFormData] = useState({
    name: gym?.name || "",
    description: gym?.description || "",
    website: gym?.website || "",
  });

  // Update form data when gym changes
  useEffect(() => {
    if (gym) {
      setFormData({
        name: gym.name || "",
        description: gym.description || "",
        website: gym.website || "",
      });
    }
  }, [gym]);

  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId);
    // Save to localStorage for persistence
    localStorage.setItem("selectedGymLocationId", locationId);
  };

  const handleSaveLocationSettings = async (updates: Partial<GymLocation>) => {
    if (!selectedLocationId) return;
    
    setIsLocationSaving(true);
    try {
      await updateLocation.mutateAsync({
        locationId: selectedLocationId,
        updates,
      });
      toast.success("Location settings saved successfully");
    } catch (error) {
      console.error("Error saving location settings:", error);
      toast.error("Failed to save location settings");
    } finally {
      setIsLocationSaving(false);
    }
  };

  const handleSaveGymSettings = async () => {
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
          website: formData.website,
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

  // Determine which tabs to show based on role
  const canAccessBrandingTab = isOwnerOrAreaManager;
  const canAccessBillingTab = isOwnerOrAreaManager;
  const canAccessSecurityTab = isOwnerOrAreaManager;
  const canAccessClassesTab = isOwnerOrAreaManager;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            {isOwnerOrAreaManager 
              ? "Manage your gym's locations, branding, and preferences."
              : "Manage settings for your assigned location."}
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="general">
            <MapPin className="mr-2 h-4 w-4" />
            Location
          </TabsTrigger>
          {canAccessClassesTab && (
            <TabsTrigger value="classes">
              <Calendar className="mr-2 h-4 w-4" />
              Classes
            </TabsTrigger>
          )}
          {canAccessBrandingTab && (
            <TabsTrigger value="branding">
              <Palette className="mr-2 h-4 w-4" />
              Branding
            </TabsTrigger>
          )}
          {canAccessBrandingTab && (
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
          )}
          {canAccessBillingTab && (
            <TabsTrigger value="billing">
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </TabsTrigger>
          )}
          {canAccessSecurityTab && (
            <TabsTrigger value="security">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
          )}
        </TabsList>

        {/* General Settings - Location Scoped */}
        <TabsContent value="general" className="space-y-6">
          {/* Location Selector - Owners/Area Managers only */}
          {isOwnerOrAreaManager && availableLocations.length > 1 && (
            <Card className="bg-muted/30 border-primary/20">
              <CardContent className="py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Label className="text-base font-medium">Select Location to Edit</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose which location's settings to modify
                    </p>
                  </div>
                  <Select 
                    value={selectedLocationId || ""} 
                    onValueChange={handleLocationChange}
                  >
                    <SelectTrigger className="w-full sm:w-72">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLocations.map(loc => (
                        <SelectItem key={loc.id} value={loc.id}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {loc.name}
                            {loc.is_primary && (
                              <Badge variant="secondary" className="ml-1 text-xs">
                                Primary
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Current Location Header */}
          {selectedLocation && (
            <div className="flex items-center gap-3 pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {selectedLocation.name}
                  {selectedLocation.is_primary && (
                    <Badge variant="secondary">Primary Location</Badge>
                  )}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedLocation.city && selectedLocation.postal_code 
                    ? `${selectedLocation.city}, ${selectedLocation.postal_code}`
                    : "Configure this location's settings below"}
                </p>
              </div>
            </div>
          )}

          {/* Location Form */}
          {selectedLocation ? (
            <LocationSettingsForm
              location={selectedLocation}
              onSave={handleSaveLocationSettings}
              isSaving={isLocationSaving}
              canEditPrimary={isOwnerOrAreaManager}
            />
          ) : isLoadingLocations ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  Loading location settings...
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  No location selected. Please select a location to edit its settings.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Classes Settings */}
        {canAccessClassesTab && (
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
                <div className="flex justify-end">
                  <Button onClick={handleSaveGymSettings} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Branding Settings */}
        {canAccessBrandingTab && (
          <TabsContent value="branding" className="space-y-6">
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

            {/* Gym Information */}
            <Card>
              <CardHeader>
                <CardTitle>Gym Information</CardTitle>
                <CardDescription>
                  Your gym's core branding details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Gym Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your gym..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveGymSettings} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Brand Colors */}
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
        )}

        {/* Notifications Settings */}
        {canAccessBrandingTab && (
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
        )}

        {/* Billing Settings */}
        {canAccessBillingTab && (
          <TabsContent value="billing" className="space-y-6">
            <LocationStripeConnect />
            <VATSettings />
            <CreditPackageManager />
          </TabsContent>
        )}

        {/* Security Settings */}
        {canAccessSecurityTab && (
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
        )}
      </Tabs>
    </div>
  );
}
