import { useState } from "react";
import { MessageSquare, UserCheck, ClipboardList, X, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBatchOperations, BatchOperationType } from "@/hooks/useBatchOperations";
import { cn } from "@/lib/utils";

interface BatchOperationsToolbarProps {
  selectedIds: string[];
  selectedNames: string[];
  onClearSelection: () => void;
}

export function BatchOperationsToolbar({
  selectedIds,
  selectedNames,
  onClearSelection,
}: BatchOperationsToolbarProps) {
  const [activeOperation, setActiveOperation] = useState<BatchOperationType | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string>("");
  const batchMutation = useBatchOperations();

  const handleOperation = async () => {
    if (!activeOperation) return;

    await batchMutation.mutateAsync({
      type: activeOperation,
      clientIds: selectedIds,
      data: {
        message: activeOperation === "send_message" ? message : undefined,
        status: activeOperation === "update_status" ? status : undefined,
      },
    });

    setActiveOperation(null);
    setMessage("");
    setStatus("");
    onClearSelection();
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      {/* Floating Toolbar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 pr-3 border-r border-border">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Users className="w-3 h-3 mr-1" />
              {selectedIds.length}
            </Badge>
            <span className="text-sm text-muted-foreground">selected</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveOperation("send_message")}
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Message</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveOperation("update_status")}
              className="gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Status</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveOperation("assign_plan")}
              className="gap-2"
              disabled
              title="Coming soon"
            >
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Plan</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            className="ml-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Send Message Dialog */}
      <Dialog open={activeOperation === "send_message"} onOpenChange={() => setActiveOperation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to {selectedIds.length} Clients</DialogTitle>
            <DialogDescription>
              This message will be sent to: {selectedNames.slice(0, 3).join(", ")}
              {selectedNames.length > 3 && ` and ${selectedNames.length - 3} more`}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveOperation(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleOperation} 
              disabled={!message.trim() || batchMutation.isPending}
            >
              {batchMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Send to {selectedIds.length} clients
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={activeOperation === "update_status"} onOpenChange={() => setActiveOperation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status for {selectedIds.length} Clients</DialogTitle>
            <DialogDescription>
              Change the status for: {selectedNames.slice(0, 3).join(", ")}
              {selectedNames.length > 3 && ` and ${selectedNames.length - 3} more`}
            </DialogDescription>
          </DialogHeader>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveOperation(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleOperation} 
              disabled={!status || batchMutation.isPending}
            >
              {batchMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Update {selectedIds.length} clients
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
