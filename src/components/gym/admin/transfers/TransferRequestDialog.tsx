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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowRight } from "lucide-react";
import { useGymLocations } from "@/hooks/gym/useGymLocations";
import { useCreateTransferRequest } from "@/hooks/gym/useMemberTransfers";

interface TransferRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membershipId: string;
  currentLocationId: string;
  currentLocationName: string;
  memberName: string;
}

export function TransferRequestDialog({
  open,
  onOpenChange,
  membershipId,
  currentLocationId,
  currentLocationName,
  memberName,
}: TransferRequestDialogProps) {
  const { data: locations = [] } = useGymLocations();
  const createTransfer = useCreateTransferRequest();
  
  const [toLocationId, setToLocationId] = useState("");
  const [notes, setNotes] = useState("");

  // Filter out current location
  const availableLocations = locations.filter(l => l.id !== currentLocationId);

  const handleSubmit = async () => {
    if (!toLocationId) return;
    
    await createTransfer.mutateAsync({
      membershipId,
      fromLocationId: currentLocationId,
      toLocationId,
      notes: notes || undefined,
    });
    
    onOpenChange(false);
    setToLocationId("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Member Transfer</DialogTitle>
          <DialogDescription>
            Transfer {memberName} to a different location. The receiving location manager will need to approve this request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">From</p>
              <p className="font-medium">{currentLocationName}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">To</p>
              {toLocationId ? (
                <p className="font-medium">
                  {locations.find(l => l.id === toLocationId)?.name}
                </p>
              ) : (
                <p className="text-muted-foreground">Select location</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to-location">Transfer To</Label>
            <Select value={toLocationId} onValueChange={setToLocationId}>
              <SelectTrigger id="to-location">
                <SelectValue placeholder="Select destination location" />
              </SelectTrigger>
              <SelectContent>
                {availableLocations.map(location => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                    {location.city && ` - ${location.city}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes for the receiving location..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!toLocationId || createTransfer.isPending}
          >
            {createTransfer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
