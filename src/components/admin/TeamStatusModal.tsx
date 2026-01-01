import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  status?: string | null;
}

interface TeamStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
  onStatusChange: (userId: string, profileId: string, status: string, reason?: string) => Promise<boolean>;
}

export const TeamStatusModal = ({ isOpen, onClose, member, onStatusChange }: TeamStatusModalProps) => {
  const [status, setStatus] = useState<string>(member?.status || "active");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member && isOpen) {
      setStatus(member.status || "active");
      setReason("");
    }
  }, [member, isOpen]);

  const handleSubmit = async () => {
    if (!member) return;

    if ((status === "suspended" || status === "banned") && !reason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for suspending or banning this team member.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const success = await onStatusChange(member.user_id, member.id, status, reason || undefined);
    setLoading(false);

    if (success) {
      onClose();
      setReason("");
    }
  };

  const memberName = member?.display_name || 
    [member?.first_name, member?.last_name].filter(Boolean).join(" ") || 
    "Team Member";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle>Change Account Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 min-w-0">
          <p className="text-sm text-muted-foreground">
            Change the account status for <strong>{memberName}</strong>
          </p>

          <div className="space-y-2 min-w-0">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(status === "suspended" || status === "banned") && (
            <>
              <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-destructive">Warning</p>
                  <p className="text-muted-foreground">
                    {status === "suspended" 
                      ? "This team member will be temporarily unable to access the admin dashboard."
                      : "This team member will be permanently blocked from accessing the platform."}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason (required)</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide a reason for this action..."
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            variant={status === "banned" ? "destructive" : "default"}
          >
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
