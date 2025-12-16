import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { toast } from "sonner";

interface CoachUser {
  id: string;
  user_id: string;
  display_name: string | null;
  coach_types: string[] | null;
  hourly_rate: number | null;
  subscription_tier: string | null;
  onboarding_completed: boolean;
  created_at: string;
}

interface EditCoachModalProps {
  coach: CoachUser;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const EditCoachModal = ({ coach, open, onClose, onSaved }: EditCoachModalProps) => {
  const [displayName, setDisplayName] = useState(coach.display_name || "");
  const [hourlyRate, setHourlyRate] = useState(coach.hourly_rate?.toString() || "");
  const [subscriptionTier, setSubscriptionTier] = useState(coach.subscription_tier || "free");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("coach_profiles")
      .update({
        display_name: displayName || null,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
        subscription_tier: subscriptionTier,
      })
      .eq("id", coach.id);

    if (error) {
      toast.error("Failed to update coach");
      console.error(error);
    } else {
      toast.success("Coach updated successfully");
      onSaved();
      onClose();
    }

    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Coach</DialogTitle>
          <DialogDescription>
            Update coach account details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter display name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
            <Input
              id="hourlyRate"
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="Enter hourly rate"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tier">Subscription Tier</Label>
            <Select value={subscriptionTier} onValueChange={setSubscriptionTier}>
              <SelectTrigger>
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCoachModal;
