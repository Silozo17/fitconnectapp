import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle, XCircle } from "lucide-react";
import { differenceInHours } from "date-fns";

interface CancelSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionDate: Date;
  onCancel: (reason: string, forceCancel: boolean) => Promise<void>;
  isLoading?: boolean;
  cancellationNoticeHours?: number;
}

const CANCEL_REASONS = [
  "Schedule conflict",
  "Client requested cancellation",
  "Illness / Health issue",
  "Emergency",
  "Weather conditions",
  "Other",
];

export function CancelSessionModal({
  open,
  onOpenChange,
  sessionDate,
  onCancel,
  isLoading,
  cancellationNoticeHours = 24,
}: CancelSessionModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState("");
  const [acknowledgeLateFee, setAcknowledgeLateFee] = useState(false);

  const hoursUntilSession = differenceInHours(sessionDate, new Date());
  const isLateCancellation = hoursUntilSession < cancellationNoticeHours;

  const handleCancel = async () => {
    const reason = selectedReason === "Other" ? customReason : selectedReason;
    if (!reason.trim()) return;

    await onCancel(reason, isLateCancellation && acknowledgeLateFee);
    onOpenChange(false);
    setSelectedReason("");
    setCustomReason("");
    setAcknowledgeLateFee(false);
  };

  const canSubmit =
    selectedReason &&
    (selectedReason !== "Other" || customReason.trim()) &&
    (!isLateCancellation || acknowledgeLateFee);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <XCircle className="h-5 w-5 text-destructive" />
            Cancel Session
          </DialogTitle>
          <DialogDescription>
            Please provide a reason for cancelling this session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 min-w-0">
          {isLateCancellation && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-amber-500">Late Cancellation</p>
                  <p className="text-sm text-muted-foreground">
                    This session is in {hoursUntilSession} hours. Our policy requires{" "}
                    {cancellationNoticeHours} hours notice. A late cancellation fee may
                    apply.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 min-w-0">
            <Label>Reason for Cancellation</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {CANCEL_REASONS.map((reason) => (
                <div key={reason} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason} id={reason} />
                  <Label htmlFor={reason} className="font-normal cursor-pointer">
                    {reason}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedReason === "Other" && (
            <div className="space-y-2 min-w-0">
              <Label htmlFor="customReason">Please specify</Label>
              <Textarea
                id="customReason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter your reason..."
                className="w-full bg-background border-border resize-none"
                rows={3}
              />
            </div>
          )}

          {isLateCancellation && (
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="acknowledgeFee"
                checked={acknowledgeLateFee}
                onChange={(e) => setAcknowledgeLateFee(e.target.checked)}
                className="mt-1"
              />
              <Label htmlFor="acknowledgeFee" className="font-normal text-sm cursor-pointer">
                I understand this is a late cancellation and a fee may apply
              </Label>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep Session
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? "Cancelling..." : "Cancel Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
