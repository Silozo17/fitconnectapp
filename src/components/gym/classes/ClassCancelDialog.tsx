import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bell, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClassInfo {
  id: string;
  start_time: string;
  parent_class_id?: string | null;
  is_recurring_template?: boolean;
  current_bookings?: number;
  class_type?: {
    name: string;
  };
}

interface ClassCancelDialogProps {
  classInfo: ClassInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ClassCancelDialog({
  classInfo,
  open,
  onOpenChange,
  onSuccess,
}: ClassCancelDialogProps) {
  const [reason, setReason] = useState("");
  const [scope, setScope] = useState<"single" | "all_future">("single");
  const [notifyMembers, setNotifyMembers] = useState(true);
  const queryClient = useQueryClient();

  const isRecurring = !!(classInfo?.parent_class_id || classInfo?.is_recurring_template);
  const hasBookings = (classInfo?.current_bookings || 0) > 0;

  const cancelClass = useMutation({
    mutationFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke("gym-cancel-class", {
        body: {
          classId: classInfo?.id,
          reason,
          scope,
          notifyMembers,
        },
        headers: {
          Authorization: `Bearer ${session.session?.access_token}`,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Class cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["gym-classes"] });
      onOpenChange(false);
      setReason("");
      setScope("single");
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Failed to cancel class:", error);
      toast.error("Failed to cancel class");
    },
  });

  if (!classInfo) return null;

  const classDate = new Date(classInfo.start_time);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Cancel Class
          </DialogTitle>
          <DialogDescription>
            Cancel {classInfo.class_type?.name || "this class"} on{" "}
            {format(classDate, "EEEE, MMMM d 'at' h:mm a")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cancellation Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for cancellation *</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Instructor unavailable, Facility maintenance, Emergency..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              This message will be shown to members who booked this class.
            </p>
          </div>

          {/* Scope Selection (only for recurring classes) */}
          {isRecurring && (
            <div className="space-y-3">
              <Label>What to cancel</Label>
              <RadioGroup
                value={scope}
                onValueChange={(value) => setScope(value as "single" | "all_future")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single" className="font-normal cursor-pointer">
                    This class only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all_future" id="all_future" />
                  <Label htmlFor="all_future" className="font-normal cursor-pointer">
                    All future classes in this series
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Notification Option */}
          <div className="flex items-start space-x-3 rounded-md border p-4">
            <Checkbox
              id="notify"
              checked={notifyMembers}
              onCheckedChange={(checked) => setNotifyMembers(checked === true)}
            />
            <div className="space-y-1">
              <Label
                htmlFor="notify"
                className="font-medium cursor-pointer flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Notify booked members
              </Label>
              <p className="text-xs text-muted-foreground">
                Send push and in-app notifications to all members who have booked this class.
              </p>
            </div>
          </div>

          {/* Booking Warning */}
          {hasBookings && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                {classInfo.current_bookings} member(s) currently booked will be notified.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={cancelClass.isPending}
          >
            Keep Class
          </Button>
          <Button
            variant="destructive"
            onClick={() => cancelClass.mutate()}
            disabled={!reason.trim() || cancelClass.isPending}
          >
            {cancelClass.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Cancel Class"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
