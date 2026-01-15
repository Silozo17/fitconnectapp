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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSendGymAnnouncement } from "@/hooks/admin/useAdminGyms";
import { Loader2, Megaphone } from "lucide-react";

interface SendGymAnnouncementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedGymIds?: string[];
}

export function SendGymAnnouncementModal({
  open,
  onOpenChange,
  selectedGymIds,
}: SendGymAnnouncementModalProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"in_app" | "email" | "both">("in_app");

  const sendAnnouncement = useSendGymAnnouncement();

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) return;

    await sendAnnouncement.mutateAsync({
      title,
      message,
      targetGymIds: selectedGymIds || null,
      deliveryMethod,
    });

    setTitle("");
    setMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Send Announcement to Gyms
          </DialogTitle>
          <DialogDescription>
            {selectedGymIds && selectedGymIds.length > 0
              ? `Send to ${selectedGymIds.length} selected gyms`
              : "Send to all gyms"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your announcement..."
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery">Delivery Method</Label>
            <Select
              value={deliveryMethod}
              onValueChange={(v) => setDeliveryMethod(v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_app">In-App Only</SelectItem>
                <SelectItem value="email">Email Only</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !message.trim() || sendAnnouncement.isPending}
          >
            {sendAnnouncement.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Megaphone className="h-4 w-4 mr-2" />
            )}
            Send Announcement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
