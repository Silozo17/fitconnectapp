import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, Check, X } from "lucide-react";
import { useReviewTransfer, MemberTransfer } from "@/hooks/gym/useMemberTransfers";
import { format } from "date-fns";

interface TransferReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: MemberTransfer | null;
}

export function TransferReviewDialog({
  open,
  onOpenChange,
  transfer,
}: TransferReviewDialogProps) {
  const reviewTransfer = useReviewTransfer();
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  if (!transfer) return null;

  const memberName = transfer.membership?.member
    ? `${transfer.membership.member.first_name || ""} ${transfer.membership.member.last_name || ""}`.trim() || "Unknown Member"
    : "Unknown Member";

  const handleApprove = async () => {
    await reviewTransfer.mutateAsync({
      transferId: transfer.id,
      action: "approve",
    });
    onOpenChange(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    
    await reviewTransfer.mutateAsync({
      transferId: transfer.id,
      action: "reject",
      rejectionReason,
    });
    onOpenChange(false);
    setShowRejectionForm(false);
    setRejectionReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review Transfer Request</DialogTitle>
          <DialogDescription>
            Approve or reject this member transfer request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Member</Label>
            <p className="font-medium text-lg">{memberName}</p>
            {transfer.membership?.member?.email && (
              <p className="text-sm text-muted-foreground">
                {transfer.membership.member.email}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">From</p>
              <p className="font-medium">{transfer.from_location?.name}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">To</p>
              <p className="font-medium">{transfer.to_location?.name}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Requested</span>
            <span>{format(new Date(transfer.requested_at), "PPp")}</span>
          </div>

          {transfer.notes && (
            <div className="space-y-1">
              <Label className="text-muted-foreground">Notes</Label>
              <p className="text-sm p-2 bg-muted rounded">{transfer.notes}</p>
            </div>
          )}

          {showRejectionForm && (
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="rejection-reason">Reason for Rejection</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Please provide a reason for rejecting this transfer..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!showRejectionForm ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowRejectionForm(true)}
                className="text-destructive hover:text-destructive"
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={reviewTransfer.isPending}
              >
                {reviewTransfer.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Approve Transfer
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowRejectionForm(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || reviewTransfer.isPending}
              >
                {reviewTransfer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Rejection
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
