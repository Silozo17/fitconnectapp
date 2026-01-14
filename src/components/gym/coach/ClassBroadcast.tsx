import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  Users,
  User,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ClassBooking {
  id: string;
  member_id: string;
  member: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ClassBroadcastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className: string;
}

export function ClassBroadcast({
  open,
  onOpenChange,
  classId,
  className,
}: ClassBroadcastProps) {
  const { gym, staff } = useGym();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState(`Update from ${className}`);
  const [message, setMessage] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(true);

  // Fetch class bookings
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["class-bookings-broadcast", classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gym_class_bookings")
        .select(`
          id,
          member_id,
          member:member_id (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq("class_id", classId)
        .in("status", ["confirmed", "attended"]);

      if (error) throw error;
      
      // Initialize all members as selected
      const memberIds = new Set(data.map(b => b.member_id));
      setSelectedMembers(memberIds);
      
      return data as unknown as ClassBooking[];
    },
    enabled: open,
  });

  // Send broadcast mutation
  const sendBroadcast = useMutation({
    mutationFn: async () => {
      if (!gym?.id || !staff?.id) throw new Error("Missing gym or staff");

      const membersToMessage = selectAll 
        ? bookings?.map(b => b.member_id) || []
        : Array.from(selectedMembers);

      // Create messages for each selected member
      const messages = membersToMessage.map(memberId => ({
        gym_id: gym.id,
        sender_staff_id: staff.id,
        recipient_member_id: memberId,
        subject,
        content: message,
        is_read: false,
      }));

      const { error } = await supabase
        .from("gym_member_messages")
        .insert(messages);

      if (error) throw error;
      return membersToMessage.length;
    },
    onSuccess: (count) => {
      toast.success(`Message sent to ${count} member${count !== 1 ? "s" : ""}`);
      onOpenChange(false);
      setMessage("");
      setSubject(`Update from ${className}`);
    },
    onError: () => {
      toast.error("Failed to send messages");
    },
  });

  const toggleMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
    setSelectAll(newSelected.size === bookings?.length);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedMembers(new Set(bookings?.map(b => b.member_id) || []));
    } else {
      setSelectedMembers(new Set());
    }
  };

  const recipientCount = selectAll 
    ? bookings?.length || 0 
    : selectedMembers.size;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Message Class
          </DialogTitle>
          <DialogDescription>
            Send a message to all members booked for {className}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recipients */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Recipients</Label>
              <Badge variant="secondary">
                <Users className="mr-1 h-3 w-3" />
                {recipientCount} member{recipientCount !== 1 ? "s" : ""}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 p-2 border rounded-lg">
              <Checkbox
                id="select-all"
                checked={selectAll}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Send to all class members
              </label>
            </div>

            {!selectAll && (
              <ScrollArea className="h-[150px] border rounded-lg p-2">
                <div className="space-y-2">
                  {bookings?.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer"
                      onClick={() => toggleMember(booking.member_id)}
                    >
                      <Checkbox
                        checked={selectedMembers.has(booking.member_id)}
                        onCheckedChange={() => toggleMember(booking.member_id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={booking.member?.avatar_url || undefined} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {booking.member?.first_name || ""} {booking.member?.last_name || ""}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Message subject..."
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message to the class..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => sendBroadcast.mutate()}
            disabled={!message.trim() || recipientCount === 0 || sendBroadcast.isPending}
          >
            <Send className="mr-2 h-4 w-4" />
            {sendBroadcast.isPending ? "Sending..." : `Send to ${recipientCount}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
