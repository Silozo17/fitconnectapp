import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, Video, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Session {
  id: string;
  clientName: string;
  sessionType: string;
  scheduledAt: string;
  duration: number;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  isOnline: boolean;
  location?: string;
  notes?: string;
}

interface SessionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session | null;
}

const statusConfig = {
  scheduled: { label: "Scheduled", icon: Calendar, color: "bg-blue-500/20 text-blue-400" },
  completed: { label: "Completed", icon: CheckCircle, color: "bg-green-500/20 text-green-400" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-red-500/20 text-red-400" },
  no_show: { label: "No Show", icon: AlertCircle, color: "bg-orange-500/20 text-orange-400" },
};

export function SessionDetailModal({ open, onOpenChange, session }: SessionDetailModalProps) {
  const [notes, setNotes] = useState(session?.notes || "");
  const [isLoading, setIsLoading] = useState(false);

  if (!session) return null;

  const status = statusConfig[session.status];
  const StatusIcon = status.icon;

  const handleMarkComplete = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success("Session marked as completed");
    setIsLoading(false);
    onOpenChange(false);
  };

  const handleCancel = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success("Session cancelled");
    setIsLoading(false);
    onOpenChange(false);
  };

  const handleSaveNotes = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success("Notes saved");
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-foreground">
            <span>Session Details</span>
            <Badge className={status.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{session.clientName}</p>
              <p className="text-sm text-muted-foreground">{session.sessionType}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {new Date(session.scheduledAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {" "}({session.duration} min)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-background border border-border">
            {session.isOnline ? (
              <>
                <Video className="h-4 w-4 text-primary" />
                <span className="text-foreground">Online Session</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-foreground">{session.location || "Location TBD"}</span>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionNotes">Session Notes</Label>
            <Textarea
              id="sessionNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this session..."
              className="bg-background border-border resize-none"
              rows={4}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveNotes}
              disabled={isLoading}
            >
              Save Notes
            </Button>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {session.status === "scheduled" && (
            <>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancel Session
              </Button>
              <Button
                onClick={handleMarkComplete}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Mark as Completed
              </Button>
            </>
          )}
          {session.status !== "scheduled" && (
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
