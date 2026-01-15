import { useState } from "react";
import { usePauseMembership } from "@/hooks/gym/useGymMemberships";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SmartDateInput } from "@/components/ui/smart-date-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Pause } from "lucide-react";
import { addDays, addWeeks, addMonths, format } from "date-fns";

interface PauseMembershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membership: {
    id: string;
    member_id: string;
    plan?: { name: string };
  };
  memberName: string;
}

export function PauseMembershipDialog({
  open,
  onOpenChange,
  membership,
  memberName,
}: PauseMembershipDialogProps) {
  const [pauseDuration, setPauseDuration] = useState("2_weeks");
  const [customDate, setCustomDate] = useState("");
  const [reason, setReason] = useState("");

  const pauseMembership = usePauseMembership();

  const getPauseUntilDate = () => {
    const today = new Date();
    switch (pauseDuration) {
      case "1_week":
        return addWeeks(today, 1);
      case "2_weeks":
        return addWeeks(today, 2);
      case "1_month":
        return addMonths(today, 1);
      case "custom":
        return customDate ? new Date(customDate) : addWeeks(today, 2);
      default:
        return addWeeks(today, 2);
    }
  };

  const handlePause = async () => {
    const pauseUntil = getPauseUntilDate();

    await pauseMembership.mutateAsync({
      membershipId: membership.id,
      pauseUntil: pauseUntil.toISOString(),
      reason: reason || undefined,
    });

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setPauseDuration("2_weeks");
    setCustomDate("");
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pause className="h-5 w-5 text-amber-500" />
            Pause Membership
          </DialogTitle>
          <DialogDescription>
            Pause <strong>{memberName}</strong>'s membership. They won't be charged
            during the pause period and won't have access to classes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Plan info */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="font-medium">{membership.plan?.name || "Membership"}</p>
          </div>

          {/* Pause duration */}
          <div className="space-y-3">
            <Label>Pause Duration</Label>
            <RadioGroup value={pauseDuration} onValueChange={setPauseDuration}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1_week" id="1_week" />
                <Label htmlFor="1_week" className="font-normal">
                  1 week (until {format(addWeeks(new Date(), 1), "PP")})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2_weeks" id="2_weeks" />
                <Label htmlFor="2_weeks" className="font-normal">
                  2 weeks (until {format(addWeeks(new Date(), 2), "PP")})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1_month" id="1_month" />
                <Label htmlFor="1_month" className="font-normal">
                  1 month (until {format(addMonths(new Date(), 1), "PP")})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="font-normal">
                  Custom date
                </Label>
              </div>
            </RadioGroup>

            {pauseDuration === "custom" && (
              <SmartDateInput
                value={customDate}
                onChange={setCustomDate}
                min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
                placeholder="Select resume date"
              />
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Medical leave, travel, etc."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePause}
            disabled={pauseMembership.isPending}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {pauseMembership.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Pause Membership
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
