import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SUPPORT_PROFILE_ID } from "@/lib/support-config";
import { toast } from "sonner";
import { VariableInserter } from "@/components/coach/message-editor/VariableInserter";

interface BroadcastMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientIds: string[];
  recipientType: "client" | "coach" | "mixed";
  onSuccess?: () => void;
}

export const BroadcastMessageModal = ({
  open,
  onOpenChange,
  recipientIds,
  recipientType,
  onSuccess,
}: BroadcastMessageModalProps) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setMessage((prev) => prev + variable);
      return;
    }
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = message.slice(0, start) + variable + message.slice(end);
    setMessage(newMessage);
    
    // Restore focus and cursor position after insert
    setTimeout(() => {
      textarea.focus();
      const newPos = start + variable.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const getRecipientLabel = () => {
    switch (recipientType) {
      case "client":
        return recipientIds.length === 1 ? "user" : "users";
      case "coach":
        return recipientIds.length === 1 ? "coach" : "coaches";
      default:
        return recipientIds.length === 1 ? "recipient" : "recipients";
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setSending(true);

    try {
      // Send individual messages to each recipient
      const messages = recipientIds.map((recipientId) => ({
        sender_id: SUPPORT_PROFILE_ID,
        receiver_id: recipientId,
        content: message.trim(),
      }));

      const { error } = await supabase.from("messages").insert(messages);

      if (error) throw error;

      toast.success(`Message sent to ${recipientIds.length} ${getRecipientLabel()}`);
      setMessage("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to send broadcast:", error);
      toast.error("Failed to send messages. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Send Message
          </DialogTitle>
          <DialogDescription>
            This message will be sent to {recipientIds.length} {getRecipientLabel()} from FitConnect Support.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="message">Message</Label>
              <VariableInserter onInsert={handleInsertVariable} />
            </div>
            <Textarea
              ref={textareaRef}
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/2000
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || !message.trim()}>
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to {recipientIds.length} {getRecipientLabel()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
