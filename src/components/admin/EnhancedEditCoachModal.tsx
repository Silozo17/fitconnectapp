import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLogAdminAction } from "@/hooks/useAuditLog";
import { Loader2, X } from "lucide-react";
import { COACH_TYPES, COACH_TYPE_CATEGORIES, getCoachTypesByCategory, getCoachTypeLabel } from "@/constants/coachTypes";

interface CoachUser {
  id: string;
  user_id: string;
  display_name: string | null;
  coach_types: string[] | null;
  hourly_rate: number | null;
  subscription_tier: string | null;
  onboarding_completed: boolean;
  bio: string | null;
  location: string | null;
  profile_image_url: string | null;
  experience_years: number | null;
  online_available: boolean | null;
  in_person_available: boolean | null;
  stripe_connect_onboarded: boolean | null;
  verification_status: string | null;
  is_verified: boolean | null;
  booking_mode: string | null;
}

interface EnhancedEditCoachModalProps {
  coach: CoachUser | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const SUBSCRIPTION_TIERS = ["free", "starter", "pro", "enterprise"];
const VERIFICATION_STATUSES = ["not_submitted", "pending", "approved", "rejected"];
const BOOKING_MODES = ["message_first", "direct"];

export function EnhancedEditCoachModal({ coach, open, onClose, onSaved }: EnhancedEditCoachModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    location: "",
    hourly_rate: "",
    experience_years: "",
    subscription_tier: "free",
    coach_types: [] as string[],
    online_available: true,
    in_person_available: false,
    verification_status: "not_submitted",
    is_verified: false,
    booking_mode: "message_first",
    onboarding_completed: false,
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const logAction = useLogAdminAction();

  useEffect(() => {
    if (coach) {
      setFormData({
        display_name: coach.display_name || "",
        bio: coach.bio || "",
        location: coach.location || "",
        hourly_rate: coach.hourly_rate?.toString() || "",
        experience_years: coach.experience_years?.toString() || "",
        subscription_tier: coach.subscription_tier || "free",
        coach_types: coach.coach_types || [],
        online_available: coach.online_available ?? true,
        in_person_available: coach.in_person_available ?? false,
        verification_status: coach.verification_status || "not_submitted",
        is_verified: coach.is_verified ?? false,
        booking_mode: coach.booking_mode || "message_first",
        onboarding_completed: coach.onboarding_completed,
      });
    }
  }, [coach]);

  const handleSave = async () => {
    if (!coach) return;
    setSaving(true);

    try {
      const updateData = {
        display_name: formData.display_name || null,
        bio: formData.bio || null,
        location: formData.location || null,
        hourly_rate: formData.hourly_rate ? Number(formData.hourly_rate) : null,
        experience_years: formData.experience_years ? Number(formData.experience_years) : null,
        subscription_tier: formData.subscription_tier,
        coach_types: formData.coach_types,
        online_available: formData.online_available,
        in_person_available: formData.in_person_available,
        verification_status: formData.verification_status,
        is_verified: formData.is_verified,
        booking_mode: formData.booking_mode,
        onboarding_completed: formData.onboarding_completed,
      };

      const { error } = await supabase
        .from("coach_profiles")
        .update(updateData)
        .eq("id", coach.id);

      if (error) throw error;

      logAction.mutate({
        action: "UPDATE_COACH",
        entityType: "coach_profiles",
        entityId: coach.id,
        oldValues: { display_name: coach.display_name, tier: coach.subscription_tier },
        newValues: updateData,
      });

      toast.success("Coach profile updated");
      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update coach");
    } finally {
      setSaving(false);
    }
  };

  const addCoachType = (typeId: string) => {
    if (typeId && !formData.coach_types.includes(typeId)) {
      setFormData({ ...formData, coach_types: [...formData.coach_types, typeId] });
    }
    setSelectedCategory("");
  };

  const removeCoachType = (typeId: string) => {
    setFormData({ ...formData, coach_types: formData.coach_types.filter(t => t !== typeId) });
  };

  // Get available types not already selected, grouped by category
  const getAvailableTypesByCategory = () => {
    const result: Record<string, typeof COACH_TYPES> = {};
    COACH_TYPE_CATEGORIES.forEach((category) => {
      const types = getCoachTypesByCategory(category.id).filter(
        (t) => !formData.coach_types.includes(t.id)
      );
      if (types.length > 0) {
        result[category.label] = types;
      }
    });
    return result;
  };

  const availableTypes = getAvailableTypesByCategory();

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Coach Profile</DialogTitle>
          <DialogDescription>
            Make comprehensive changes to this coach's profile and settings
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Experience (years)</Label>
                <Input
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Hourly Rate (£)</Label>
                <Input
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <Label>Onboarding Complete</Label>
                <p className="text-sm text-muted-foreground">Mark profile as complete</p>
              </div>
              <Switch
                checked={formData.onboarding_completed}
                onCheckedChange={(checked) => setFormData({ ...formData, onboarding_completed: checked })}
              />
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Coach Specialties</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.coach_types.map((typeId) => (
                  <Badge key={typeId} variant="secondary" className="gap-1">
                    {getCoachTypeLabel(typeId)}
                    <button onClick={() => removeCoachType(typeId)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {formData.coach_types.length === 0 && (
                  <span className="text-sm text-muted-foreground">No specialties selected</span>
                )}
              </div>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={addCoachType}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Add specialty..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(availableTypes).map(([category, types]) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {category}
                        </div>
                        {types.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>Online Sessions</Label>
                  <p className="text-sm text-muted-foreground">Offer virtual coaching</p>
                </div>
                <Switch
                  checked={formData.online_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, online_available: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>In-Person Sessions</Label>
                  <p className="text-sm text-muted-foreground">Offer face-to-face coaching</p>
                </div>
                <Switch
                  checked={formData.in_person_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, in_person_available: checked })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Booking Mode</Label>
              <Select
                value={formData.booking_mode}
                onValueChange={(value) => setFormData({ ...formData, booking_mode: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="message_first">Message First (clients must message before booking)</SelectItem>
                  <SelectItem value="direct">Direct Booking (clients can book immediately)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Subscription Tier</Label>
              <Select
                value={formData.subscription_tier}
                onValueChange={(value) => setFormData({ ...formData, subscription_tier: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_TIERS.map((tier) => (
                    <SelectItem key={tier} value={tier} className="capitalize">{tier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This changes the coach's tier directly. Use "Assign Free Plan" for tracking purposes.
              </p>
            </div>

            {coach?.stripe_connect_onboarded && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm font-medium text-green-600">Stripe Connected</p>
                <p className="text-xs text-green-600/80">Coach can receive payments</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="verification" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Verification Status</Label>
              <Select
                value={formData.verification_status}
                onValueChange={(value) => setFormData({ ...formData, verification_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VERIFICATION_STATUSES.map((status) => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <Label>Verified Badge</Label>
                <p className="text-sm text-muted-foreground">Show verified badge on profile</p>
              </div>
              <Switch
                checked={formData.is_verified}
                onCheckedChange={(checked) => setFormData({ ...formData, is_verified: checked })}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
