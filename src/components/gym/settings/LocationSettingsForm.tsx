import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Clock, MapPin, Phone, Mail, Building2, Settings2 } from "lucide-react";
import { GymLocation, LocationOpeningHours } from "@/hooks/gym/useGymLocations";

interface LocationSettingsFormProps {
  location: GymLocation;
  onSave: (updates: Partial<GymLocation>) => Promise<void>;
  isSaving: boolean;
  canEditPrimary?: boolean;
}

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const TIMEZONES = [
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Dublin", label: "Dublin (GMT/IST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "America/New_York", label: "New York (EST/EDT)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT)" },
];

const CURRENCIES = [
  { value: "GBP", label: "GBP (£)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "USD", label: "USD ($)" },
];

const DEFAULT_HOURS: LocationOpeningHours = {
  monday: { open: "06:00", close: "22:00" },
  tuesday: { open: "06:00", close: "22:00" },
  wednesday: { open: "06:00", close: "22:00" },
  thursday: { open: "06:00", close: "22:00" },
  friday: { open: "06:00", close: "22:00" },
  saturday: { open: "08:00", close: "18:00" },
  sunday: { open: "08:00", close: "18:00", closed: true },
};

export function LocationSettingsForm({
  location,
  onSave,
  isSaving,
  canEditPrimary = false,
}: LocationSettingsFormProps) {
  const [formData, setFormData] = useState({
    name: location.name || "",
    address_line1: location.address_line1 || "",
    address_line2: location.address_line2 || "",
    city: location.city || "",
    state: location.state || "",
    postal_code: location.postal_code || "",
    country: location.country || "GB",
    phone: location.phone || "",
    email: location.email || "",
    timezone: location.timezone || "Europe/London",
    currency: location.currency || "GBP",
    member_number_prefix: location.member_number_prefix || "",
    is_primary: location.is_primary,
    amenities: location.amenities || [],
  });

  const [openingHours, setOpeningHours] = useState<LocationOpeningHours>(
    location.opening_hours || DEFAULT_HOURS
  );

  // Update form when location changes
  useEffect(() => {
    setFormData({
      name: location.name || "",
      address_line1: location.address_line1 || "",
      address_line2: location.address_line2 || "",
      city: location.city || "",
      state: location.state || "",
      postal_code: location.postal_code || "",
      country: location.country || "GB",
      phone: location.phone || "",
      email: location.email || "",
      timezone: location.timezone || "Europe/London",
      currency: location.currency || "GBP",
      member_number_prefix: location.member_number_prefix || "",
      is_primary: location.is_primary,
      amenities: location.amenities || [],
    });
    setOpeningHours(location.opening_hours || DEFAULT_HOURS);
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      ...formData,
      opening_hours: openingHours,
    });
  };

  const updateHours = (day: string, field: "open" | "close" | "closed", value: string | boolean) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Location Details
          </CardTitle>
          <CardDescription>
            Basic information about this location.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Location Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Main Branch"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member_number_prefix">Member Number Prefix</Label>
              <Input
                id="member_number_prefix"
                value={formData.member_number_prefix}
                onChange={(e) => setFormData({ ...formData, member_number_prefix: e.target.value })}
                placeholder="LON"
                maxLength={5}
              />
              <p className="text-xs text-muted-foreground">
                Used to prefix member IDs at this location
              </p>
            </div>
          </div>

          {canEditPrimary && (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="space-y-1">
                <Label className="text-base font-medium">Primary Location</Label>
                <p className="text-sm text-muted-foreground">
                  Set this as the main location for your gym.
                </p>
              </div>
              <Switch
                checked={formData.is_primary}
                onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
          <CardDescription>
            How members can reach this location.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+44 20 1234 5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="location@gym.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address
          </CardTitle>
          <CardDescription>
            Physical location address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address_line1">Address Line 1</Label>
            <Input
              id="address_line1"
              value={formData.address_line1}
              onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
              placeholder="123 Fitness Street"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_line2">Address Line 2</Label>
            <Input
              id="address_line2"
              value={formData.address_line2}
              onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
              placeholder="Suite 100"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">County/State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postcode</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Regional Settings
          </CardTitle>
          <CardDescription>
            Timezone and currency for this location.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => setFormData({ ...formData, timezone: value })}
              >
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opening Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Opening Hours
          </CardTitle>
          <CardDescription>
            Set the operating hours for this location.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DAYS_OF_WEEK.map((day) => {
              const hours = openingHours[day] || { open: "09:00", close: "17:00" };
              const isClosed = hours.closed;

              return (
                <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="w-28">
                    <span className="font-medium capitalize">{day}</span>
                  </div>
                  <Switch
                    checked={!isClosed}
                    onCheckedChange={(checked) => updateHours(day, "closed", !checked)}
                  />
                  {isClosed ? (
                    <Badge variant="secondary" className="ml-2">
                      Closed
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={hours.open}
                        onChange={(e) => updateHours(day, "open", e.target.value)}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={hours.close}
                        onChange={(e) => updateHours(day, "close", e.target.value)}
                        className="w-32"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving} size="lg">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Location Settings"}
        </Button>
      </div>
    </form>
  );
}
