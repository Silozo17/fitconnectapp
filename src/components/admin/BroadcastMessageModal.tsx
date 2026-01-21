import { useState, useRef, useEffect } from "react";
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
import { Loader2, Send, Users, MessageSquare, Bell, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SUPPORT_PROFILE_ID } from "@/lib/support-config";
import { toast } from "sonner";
import { VariableInserter } from "@/components/coach/message-editor/VariableInserter";
import { cn } from "@/lib/utils";

interface BroadcastMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientIds: string[];
  recipientType: "client" | "coach" | "mixed";
  onSuccess?: () => void;
}

interface RecipientProfile {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
  type: "client" | "coach";
}

// Resolve template variables with actual recipient data
function resolveVariables(template: string, profile: RecipientProfile): string {
  let result = template;
  
  // Normalize both {var} and {{var}} syntax
  result = result.replace(/\{\{(\w+)\}\}/g, "{$1}");
  
  if (profile.type === "coach") {
    const firstName = profile.display_name?.split(' ')[0] || 'there';
    const fullName = profile.display_name || 'there';
    result = result.replace(/{coach_first_name}/gi, firstName);
    result = result.replace(/{coach_name}/gi, fullName);
    result = result.replace(/{first_name}/gi, firstName);
  } else {
    const firstName = profile.first_name || 'there';
    const lastName = profile.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'there';
    result = result.replace(/{client_first_name}/gi, firstName);
    result = result.replace(/{client_name}/gi, fullName);
    result = result.replace(/{first_name}/gi, firstName);
    result = result.replace(/{last_name}/gi, lastName);
  }
  
  // Context variables
  const now = new Date();
  result = result.replace(/{current_date}/gi, now.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }));
  result = result.replace(/{current_time}/gi, now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }));
  
  return result;
}

type DeliveryChannel = "in_app" | "push" | "email";

export const BroadcastMessageModal = ({
  open,
  onOpenChange,
  recipientIds,
  recipientType,
  onSuccess,
}: BroadcastMessageModalProps) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [channels, setChannels] = useState<DeliveryChannel[]>(["in_app"]);
  const [profiles, setProfiles] = useState<Map<string, RecipientProfile>>(new Map());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch recipient profiles when modal opens
  useEffect(() => {
    if (!open || recipientIds.length === 0) return;

    const fetchProfiles = async () => {
      const profileMap = new Map<string, RecipientProfile>();

      if (recipientType === "coach" || recipientType === "mixed") {
        const { data: coaches } = await supabase
          .from("coach_profiles")
          .select("id, display_name, user_id")
          .in("id", recipientIds);
        
        coaches?.forEach(coach => {
          profileMap.set(coach.id, {
            id: coach.id,
            display_name: coach.display_name,
            type: "coach"
          });
        });
      }

      if (recipientType === "client" || recipientType === "mixed") {
        const { data: clients } = await supabase
          .from("client_profiles")
          .select("id, first_name, last_name, user_id")
          .in("id", recipientIds);
        
        clients?.forEach(client => {
          if (!profileMap.has(client.id)) {
            profileMap.set(client.id, {
              id: client.id,
              first_name: client.first_name,
              last_name: client.last_name,
              type: "client"
            });
          }
        });
      }

      setProfiles(profileMap);
    };

    fetchProfiles();
  }, [open, recipientIds, recipientType]);

  const toggleChannel = (channel: DeliveryChannel) => {
    setChannels(prev => {
      if (prev.includes(channel)) {
        // Don't allow deselecting if it's the last channel
        if (prev.length === 1) return prev;
        return prev.filter(c => c !== channel);
      }
      return [...prev, channel];
    });
  };

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

    if (channels.length === 0) {
      toast.error("Please select at least one delivery channel");
      return;
    }

    setSending(true);

    try {
      let successCount = 0;
      let failCount = 0;

      // Process each recipient with resolved variables
      for (const recipientId of recipientIds) {
        const profile = profiles.get(recipientId);
        const resolvedMessage = profile 
          ? resolveVariables(message.trim(), profile)
          : message.trim();

        // Send in-app message (appears in support inbox)
        if (channels.includes("in_app")) {
          const { error } = await supabase.from("messages").insert({
            sender_id: SUPPORT_PROFILE_ID,
            receiver_id: recipientId,
            content: resolvedMessage,
          });

          if (error) {
            console.error(`Failed to send in-app message to ${recipientId}:`, error);
            failCount++;
            continue;
          }
        }

        // Send push notification
        if (channels.includes("push")) {
          try {
            // Get user_id from profile
            let userId: string | null = null;
            
            if (profile?.type === "coach") {
              const { data } = await supabase
                .from("coach_profiles")
                .select("user_id")
                .eq("id", recipientId)
                .single();
              userId = data?.user_id;
            } else {
              const { data } = await supabase
                .from("client_profiles")
                .select("user_id")
                .eq("id", recipientId)
                .single();
              userId = data?.user_id;
            }

            if (userId) {
              await supabase.functions.invoke("send-push-notification", {
                body: {
                  userIds: [userId],
                  title: "FitConnect Support",
                  message: resolvedMessage.substring(0, 200),
                  useExternalUserIds: true,
                },
              });
            }
          } catch (pushError) {
            console.error(`Push notification failed for ${recipientId}:`, pushError);
          }
        }

        // Email sending (placeholder - would need edge function)
        if (channels.includes("email")) {
          console.log(`Email sending not yet implemented for ${recipientId}`);
          // TODO: Implement email via edge function when needed
        }

        successCount++;
      }

      if (failCount > 0) {
        toast.warning(`Sent to ${successCount} ${getRecipientLabel()}, ${failCount} failed`);
      } else {
        toast.success(`Message sent to ${successCount} ${getRecipientLabel()}`);
      }
      
      setMessage("");
      setChannels(["in_app"]);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to send broadcast:", error);
      toast.error("Failed to send messages. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const channelOptions: { id: DeliveryChannel; label: string; icon: React.ReactNode }[] = [
    { id: "in_app", label: "In-App", icon: <MessageSquare className="h-4 w-4" /> },
    { id: "push", label: "Push", icon: <Bell className="h-4 w-4" /> },
    { id: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
  ];

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
          {/* Delivery Channels */}
          <div className="space-y-2">
            <Label>Delivery Channels</Label>
            <div className="flex flex-wrap gap-2">
              {channelOptions.map((channel) => (
                <Button
                  key={channel.id}
                  type="button"
                  variant={channels.includes(channel.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleChannel(channel.id)}
                  className={cn(
                    "gap-1.5",
                    channels.includes(channel.id) && "bg-primary text-primary-foreground"
                  )}
                  disabled={channel.id === "email"} // Email not yet implemented
                >
                  {channel.icon}
                  {channel.label}
                  {channel.id === "email" && (
                    <span className="text-xs opacity-60">(soon)</span>
                  )}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Select one or more channels. In-App messages appear in the support inbox.
            </p>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="message">Message</Label>
              <VariableInserter onInsert={handleInsertVariable} />
            </div>
            <Textarea
              ref={textareaRef}
              id="message"
              placeholder="Type your message here... Use variables like {first_name} or {coach_first_name}"
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
