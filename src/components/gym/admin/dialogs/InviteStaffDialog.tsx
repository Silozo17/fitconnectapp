import { useState } from "react";
import { useGym } from "@/contexts/GymContext";
import { useGymLocations } from "@/hooks/gym/useGymLocations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Mail, UserCheck, Loader2 } from "lucide-react";

interface InviteStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  locationIds: string[];
}

export function InviteStaffDialog({ open, onOpenChange, onSuccess }: InviteStaffDialogProps) {
  const { gym } = useGym();
  const { data: locations = [] } = useGymLocations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingUser, setExistingUser] = useState<{ id: string; name: string } | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    locationIds: [],
  });

  const handleEmailBlur = async () => {
    if (!formData.email || !formData.email.includes("@")) return;
    
    setIsCheckingEmail(true);
    try {
      // Check if user exists in profiles
      const { data: profile } = await (supabase as any)
        .from("user_profiles")
        .select("id, first_name, last_name")
        .eq("email", formData.email.toLowerCase())
        .maybeSingle();
      
      if (profile) {
        setExistingUser({
          id: profile.id,
          name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User",
        });
        // Auto-populate name if found
        if (profile.first_name) {
          setFormData(prev => ({
            ...prev,
            firstName: profile.first_name || prev.firstName,
            lastName: profile.last_name || prev.lastName,
          }));
        }
      } else {
        setExistingUser(null);
      }
    } catch (error) {
      console.error("Error checking email:", error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleLocationToggle = (locationId: string) => {
    setFormData(prev => ({
      ...prev,
      locationIds: prev.locationIds.includes(locationId)
        ? prev.locationIds.filter(id => id !== locationId)
        : [...prev.locationIds, locationId],
    }));
  };

  const handleSubmit = async () => {
    if (!gym?.id || !formData.email || !formData.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create staff invitation record
      const { error } = await (supabase as any)
        .from("gym_staff_invitations")
        .insert({
          gym_id: gym.id,
          email: formData.email.toLowerCase(),
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone || null,
          role: formData.role,
          assigned_location_ids: formData.locationIds.length > 0 ? formData.locationIds : null,
          status: "pending",
        });

      if (error) {
        // If table doesn't exist, fall back to creating staff directly
        if (error.code === "42P01") {
          const { error: staffError } = await (supabase as any)
            .from("gym_staff")
            .insert({
              gym_id: gym.id,
              user_id: existingUser?.id || crypto.randomUUID(),
              email: formData.email.toLowerCase(),
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone: formData.phone || null,
              role: formData.role,
              assigned_location_ids: formData.locationIds.length > 0 ? formData.locationIds : null,
              status: "pending",
            });
          
          if (staffError) throw staffError;
        } else {
          throw error;
        }
      }

      toast.success("Invitation sent successfully!");
      onSuccess?.();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Failed to send invitation:", error);
      toast.error("Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
      locationIds: [],
    });
    setExistingUser(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Staff Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your gym as staff
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Email - Check first */}
          <div className="space-y-2">
            <Label>Email Address *</Label>
            <div className="relative">
              <Input
                type="email"
                placeholder="staff@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                onBlur={handleEmailBlur}
              />
              {isCheckingEmail && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {existingUser && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <UserCheck className="h-4 w-4" />
                <span>Existing user found - will be linked automatically</span>
              </div>
            )}
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input
                placeholder="Smith"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              type="tel"
              placeholder="+44 7123 456789"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label>Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area_manager">Area Manager</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="coach">Coach / Instructor</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location Assignment */}
          {locations.length > 0 && (
            <div className="space-y-2">
              <Label>Assigned Locations</Label>
              <p className="text-xs text-muted-foreground">
                Leave empty for access to all locations
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {locations.map((location) => (
                  <div key={location.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`loc-${location.id}`}
                      checked={formData.locationIds.includes(location.id)}
                      onCheckedChange={() => handleLocationToggle(location.id)}
                    />
                    <label
                      htmlFor={`loc-${location.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {location.name}
                      {location.is_primary && (
                        <Badge variant="secondary" className="ml-2 text-xs">Primary</Badge>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
