import { useState } from "react";
import { useGym } from "@/contexts/GymContext";
import { useGymLocations, useCreateGymLocation, useUpdateGymLocation, GymLocation } from "@/hooks/gym/useGymLocations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, MapPin, Loader2, Building2, Phone, Mail, Edit2 } from "lucide-react";

interface LocationFormData {
  name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
  is_primary: boolean;
}

const defaultFormData: LocationFormData = {
  name: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "United Kingdom",
  phone: "",
  email: "",
  is_primary: false,
};

export default function GymAdminLocations() {
  const { gym } = useGym();
  const { data: locations, isLoading } = useGymLocations();
  const createLocation = useCreateGymLocation();
  const updateLocation = useUpdateGymLocation();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LocationFormData>(defaultFormData);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (location: GymLocation) => {
    setEditingId(location.id);
    setFormData({
      name: location.name || "",
      address_line1: location.address_line1 || "",
      address_line2: location.address_line2 || "",
      city: location.city || "",
      state: location.state || "",
      postal_code: location.postal_code || "",
      country: location.country || "United Kingdom",
      phone: location.phone || "",
      email: location.email || "",
      is_primary: location.is_primary || false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gym) return;

    const locationData: Partial<GymLocation> = {
      gym_id: gym.id,
      name: formData.name,
      address_line1: formData.address_line1,
      address_line2: formData.address_line2 || null,
      city: formData.city,
      state: formData.state || null,
      postal_code: formData.postal_code,
      country: formData.country,
      phone: formData.phone || null,
      email: formData.email || null,
      is_primary: formData.is_primary,
    };

    try {
      if (editingId) {
        await updateLocation.mutateAsync({ locationId: editingId, updates: locationData });
      } else {
        await createLocation.mutateAsync(locationData);
      }
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save location");
    }
  };

  const handleChange = (field: keyof LocationFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Locations</h1>
          <p className="text-muted-foreground">
            Manage your gym's physical locations
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      {locations && locations.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {locations.map((location) => (
            <Card key={location.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {location.name}
                        {location.is_primary && (
                          <Badge variant="secondary" className="text-xs">Primary</Badge>
                        )}
                      </CardTitle>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(location)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p>{location.address_line1}</p>
                    {location.address_line2 && <p>{location.address_line2}</p>}
                    <p>{location.city}{location.state ? `, ${location.state}` : ""} {location.postal_code}</p>
                    <p>{location.country}</p>
                  </div>
                </div>
                {location.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{location.phone}</span>
                  </div>
                )}
                {location.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{location.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Locations Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first location to start managing your gym's venues
            </p>
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Location
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Location Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Location" : "Add New Location"}
            </DialogTitle>
            <DialogDescription>
              {editingId 
                ? "Update the details for this location" 
                : "Add a new physical location for your gym"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Location Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Main Branch"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="address_line1">Street Address *</Label>
                <Input
                  id="address_line1"
                  value={formData.address_line1}
                  onChange={(e) => handleChange("address_line1", e.target.value)}
                  placeholder="123 Fitness Street"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="address_line2">Address Line 2</Label>
                <Input
                  id="address_line2"
                  value={formData.address_line2}
                  onChange={(e) => handleChange("address_line2", e.target.value)}
                  placeholder="Suite 100"
                />
              </div>

              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="London"
                  required
                />
              </div>

              <div>
                <Label htmlFor="state">County / State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="Greater London"
                />
              </div>

              <div>
                <Label htmlFor="postal_code">Postal Code *</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => handleChange("postal_code", e.target.value)}
                  placeholder="SW1A 1AA"
                  required
                />
              </div>

              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  placeholder="United Kingdom"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+44 123 456 7890"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="location@gym.com"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2">
                <Switch
                  id="is_primary"
                  checked={formData.is_primary}
                  onCheckedChange={(checked) => handleChange("is_primary", checked)}
                />
                <Label htmlFor="is_primary">Primary Location</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createLocation.isPending || updateLocation.isPending}
              >
                {(createLocation.isPending || updateLocation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingId ? "Update Location" : "Create Location"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
