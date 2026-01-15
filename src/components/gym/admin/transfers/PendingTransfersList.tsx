import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useMemberTransfers, MemberTransfer } from "@/hooks/gym/useMemberTransfers";
import { TransferReviewDialog } from "./TransferReviewDialog";
import { format } from "date-fns";
import { useCurrentGymLocation } from "@/components/gym/admin/LocationSwitcher";

const statusConfig = {
  pending: { label: "Pending", icon: Clock, variant: "secondary" as const },
  approved: { label: "Approved", icon: CheckCircle, variant: "default" as const },
  rejected: { label: "Rejected", icon: XCircle, variant: "destructive" as const },
  cancelled: { label: "Cancelled", icon: AlertCircle, variant: "outline" as const },
};

interface PendingTransfersListProps {
  showAll?: boolean;
}

export function PendingTransfersList({ showAll = false }: PendingTransfersListProps) {
  const { locationId } = useCurrentGymLocation();
  const { data: transfers = [], isLoading } = useMemberTransfers(showAll ? null : locationId);
  const [selectedTransfer, setSelectedTransfer] = useState<MemberTransfer | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  // Filter pending transfers for this location (where we're the receiving location)
  const pendingTransfers = transfers.filter(t => 
    t.status === "pending" && 
    (!locationId || t.to_location_id === locationId)
  );

  const handleReview = (transfer: MemberTransfer) => {
    setSelectedTransfer(transfer);
    setReviewDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingTransfers.length === 0) {
    return null; // Don't show if no pending transfers
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Pending Transfer Requests
            <Badge variant="secondary" className="ml-auto">
              {pendingTransfers.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Members requesting to transfer to your location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingTransfers.map(transfer => {
              const memberName = transfer.membership?.member
                ? `${transfer.membership.member.first_name || ""} ${transfer.membership.member.last_name || ""}`.trim() || "Unknown"
                : "Unknown";

              return (
                <div
                  key={transfer.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{memberName}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{transfer.from_location?.name}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span>{transfer.to_location?.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Requested {format(new Date(transfer.requested_at), "PP")}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handleReview(transfer)}>
                    Review
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <TransferReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        transfer={selectedTransfer}
      />
    </>
  );
}
