import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { AlertTriangle, Ban, Pause, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLogAdminAction } from "@/hooks/useAuditLog";
import { getErrorMessage, logError } from "@/lib/error-utils";

interface AccountStatusModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  user: {
    id: string;
    user_id: string;
    name: string;
    currentStatus: string;
  };
  userType: "client" | "coach";
}

export const AccountStatusModal = ({
  open,
  onClose,
  onSaved,
  user,
  userType,
}: AccountStatusModalProps) => {
  const [status, setStatus] = useState(user.currentStatus || "active");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const logAction = useLogAdminAction();

  const handleSave = async () => {
    if ((status === "suspended" || status === "banned") && !reason.trim()) {
      toast.error("Please provide a reason for this action");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.functions.invoke("admin-user-management", {
        body: {
          action: "update_status",
          userId: user.user_id,
          profileId: user.id,
          userType,
          status,
          reason: reason.trim() || null,
        },
      });

      if (error) throw error;

      logAction.log({
        action: `UPDATE_STATUS_${status.toUpperCase()}`,
        entityType: userType === "coach" ? "coach_profiles" : "client_profiles",
        entityId: user.id,
        oldValues: { status: user.currentStatus },
        newValues: { status, reason: reason.trim() || null },
      });

      toast.success(`Account ${status === "active" ? "activated" : status}`);
      onSaved();
      onClose();
    } catch (error: unknown) {
      logError("AccountStatusModal", error);
      toast.error(getErrorMessage(error, "Failed to update status"));
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "suspended":
        return <Pause className="h-4 w-4 text-amber-500" />;
      case "banned":
        return <Ban className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Account Status</DialogTitle>
          <DialogDescription>
            Update status for {user.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Account Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <div className="flex items-center gap-2">
                    {getStatusIcon("active")}
                    <span>Active</span>
                  </div>
                </SelectItem>
                <SelectItem value="suspended">
                  <div className="flex items-center gap-2">
                    {getStatusIcon("suspended")}
                    <span>Suspended</span>
                  </div>
                </SelectItem>
                <SelectItem value="banned">
                  <div className="flex items-center gap-2">
                    {getStatusIcon("banned")}
                    <span>Banned</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(status === "suspended" || status === "banned") && (
            <>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-destructive">
                    {status === "banned" ? "Banning" : "Suspending"} this account will:
                  </p>
                  <ul className="mt-1 text-muted-foreground list-disc list-inside">
                    {status === "banned" && (
                      <li>Prevent the user from logging in</li>
                    )}
                    <li>Hide their profile from public view</li>
                    <li>Notify the user via email</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Reason <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  placeholder="Explain why this action is being taken..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            variant={status === "banned" ? "destructive" : "default"}
          >
            {saving ? "Saving..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
