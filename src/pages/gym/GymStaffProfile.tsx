import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGym } from "@/contexts/GymContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Save,
  Loader2,
  MapPin,
} from "lucide-react";

export default function GymStaffProfile() {
  const { gymId } = useParams<{ gymId: string }>();
  const { gym, staffRecord, userRole } = useGym();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    bio: "",
  });

  // Load staff profile data
  useEffect(() => {
    if (staffRecord) {
      setFormData({
        first_name: (staffRecord as any).first_name || "",
        last_name: (staffRecord as any).last_name || "",
        email: (staffRecord as any).email || user?.email || "",
        phone: (staffRecord as any).phone || "",
        bio: (staffRecord as any).bio || "",
      });
      setIsLoading(false);
    }
  }, [staffRecord, user?.email]);

  const handleSave = async () => {
    if (!staffRecord?.id) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("gym_staff")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || null,
          bio: formData.bio || null,
        })
        .eq("id", staffRecord.id);

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "area_manager":
        return "default";
      case "manager":
        return "secondary";
      case "coach":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your staff profile at {gym?.name}
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={(staffRecord as any)?.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {formData.first_name?.charAt(0) || formData.email?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold">
                {formData.first_name} {formData.last_name}
              </h3>
              <p className="text-sm text-muted-foreground">{formData.email}</p>
              <Badge
                variant={getRoleBadgeVariant(userRole || "staff")}
                className="mt-2"
              >
                <Shield className="mr-1 h-3 w-3" />
                {formatRole(userRole || "staff")}
              </Badge>

              <Separator className="my-4" />

              <div className="w-full space-y-3 text-left">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{formData.email}</span>
                </div>
                {formData.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{formData.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{gym?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Joined{" "}
                    {(staffRecord as any)?.created_at
                      ? new Date((staffRecord as any).created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  placeholder="Smith"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed. Contact an administrator if you need to update it.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+44 7123 456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell members a bit about yourself, your experience, and your coaching style..."
              />
              <p className="text-xs text-muted-foreground">
                This will be visible to members when viewing class schedules.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Permissions Card */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Permissions & Access</CardTitle>
            <CardDescription>
              Your current role and access level at this gym
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 p-4 rounded-lg border">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Role</p>
                  <p className="text-sm text-muted-foreground">
                    {formatRole(userRole || "staff")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg border">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Manage Members</p>
                  <p className="text-sm text-muted-foreground">
                    {(staffRecord as any)?.can_manage_members ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg border">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Teach Classes</p>
                  <p className="text-sm text-muted-foreground">
                    {(staffRecord as any)?.can_teach_classes ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg border">
                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">Locations</p>
                  <p className="text-sm text-muted-foreground">
                    {(staffRecord as any)?.assigned_location_ids?.length > 0
                      ? `${(staffRecord as any).assigned_location_ids.length} assigned`
                      : "All locations"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
