import { useState } from "react";
import { useCancelMembership } from "@/hooks/gym/useGymMemberships";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, XCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface CancelMembershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membership: {
    id: string;
    member_id: string;
    current_period_end: string | null;
    plan?: { name: string };
  };
  memberName: string;
}

export function CancelMembershipDialog({
  open,
  onOpenChange,
  membership,
  memberName,
}: CancelMembershipDialogProps) {
  const [cancelType, setCancelType] = useState<"end_of_period" | "immediate">("end_of_period");
  const [reason, setReason] = useState("");

  const cancelMembership = useCancelMembership();

  const handleCancel = async () => {
    await cancelMembership.mutateAsync({
      membershipId: membership.id,
      immediate: cancelType === "immediate",
      reason: reason || undefined,
    });

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setCancelType("end_of_period");
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Cancel Membership
          </DialogTitle>
          <DialogDescription>
            Cancel <strong>{memberName}</strong>'s membership. This action cannot
            be easily undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Plan info */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="font-medium">{membership.plan?.name || "Membership"}</p>
            {membership.current_period_end && (
              <p className="text-sm text-muted-foreground mt-1">
                Current period ends: {format(new Date(membership.current_period_end), "PP")}
              </p>
            )}
          </div>

          {/* Cancel type */}
          <div className="space-y-3">
            <Label>Cancellation Type</Label>
            <RadioGroup 
              value={cancelType} 
              onValueChange={(value) => setCancelType(value as "end_of_period" | "immediate")}
            >
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="end_of_period" id="end_of_period" className="mt-1" />
                <div>
                  <Label htmlFor="end_of_period" className="font-normal">
                    Cancel at end of billing period
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Member keeps access until{" "}
                    {membership.current_period_end
                      ? format(new Date(membership.current_period_end), "PP")
                      : "period end"}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="immediate" id="immediate" className="mt-1" />
                <div>
                  <Label htmlFor="immediate" className="font-normal">
                    Cancel immediately
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Access ends immediately. May require refund.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {cancelType === "immediate" && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Immediate cancellation will revoke access instantly. Consider
                processing a prorated refund if applicable.
              </AlertDescription>
            </Alert>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Cancellation Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Member requested, non-payment, etc."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep Membership
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelMembership.isPending}
          >
            {cancelMembership.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Cancel Membership
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
