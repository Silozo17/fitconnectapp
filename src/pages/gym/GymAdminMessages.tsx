import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Inbox,
  Send,
  User,
  Clock,
  CheckCheck,
  Reply,
  Search,
  Filter,
  UserCheck,
  MessageSquare,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface GymMessage {
  id: string;
  gym_id: string;
  sender_member_id: string | null;
  sender_staff_id: string | null;
  recipient_member_id: string | null;
  recipient_staff_id: string | null;
  location_id: string | null;
  assigned_to_staff_id: string | null;
  assigned_at: string | null;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_member?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  sender_staff?: {
    display_name: string | null;
  } | null;
  assigned_staff?: {
    display_name: string | null;
  } | null;
}

export default function GymAdminMessages() {
  const { gymId } = useParams<{ gymId: string }>();
  const { gym, staff } = useGym();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<GymMessage | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "assigned">("all");

  // Fetch all gym messages (unified inbox)
  const { data: messages, isLoading } = useQuery({
    queryKey: ["gym-messages", gymId, filterStatus],
    queryFn: async () => {
      if (!gymId) return [];

      let query = supabase
        .from("gym_member_messages")
        .select(`
          *,
          sender_member:sender_member_id (
            first_name,
            last_name
          ),
          sender_staff:sender_staff_id (
            display_name
          ),
          assigned_staff:assigned_to_staff_id (
            display_name
          )
        `)
        .eq("gym_id", gymId)
        .order("created_at", { ascending: false });

      if (filterStatus === "unread") {
        query = query.eq("is_read", false);
      } else if (filterStatus === "assigned") {
        query = query.not("assigned_to_staff_id", "is", null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as GymMessage[];
    },
    enabled: !!gymId,
  });

  // Fetch staff for assignment
  const { data: staffList } = useQuery({
    queryKey: ["gym-staff", gymId],
    queryFn: async () => {
      if (!gymId) return [];
      const { data, error } = await supabase
        .from("gym_staff")
        .select("id, display_name, role")
        .eq("gym_id", gymId)
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
    enabled: !!gymId,
  });

  // Mark as read mutation
  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from("gym_member_messages")
        .update({ is_read: true })
        .eq("id", messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-messages"] });
    },
  });

  // Assign to staff mutation
  const assignToStaff = useMutation({
    mutationFn: async ({ messageId, staffId }: { messageId: string; staffId: string }) => {
      const { error } = await supabase
        .from("gym_member_messages")
        .update({ 
          assigned_to_staff_id: staffId,
          assigned_at: new Date().toISOString()
        })
        .eq("id", messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-messages"] });
      toast.success("Message assigned successfully");
    },
  });

  // Reply mutation
  const sendReply = useMutation({
    mutationFn: async ({ recipientMemberId, content }: { recipientMemberId: string; content: string }) => {
      if (!gymId || !staff?.id) throw new Error("Missing gym or staff ID");
      
      const { error } = await supabase
        .from("gym_member_messages")
        .insert({
          gym_id: gymId,
          sender_staff_id: staff.id,
          recipient_member_id: recipientMemberId,
          subject: `Re: ${selectedMessage?.subject || "Message"}`,
          content,
          is_read: false,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-messages"] });
      setReplyDialogOpen(false);
      setReplyContent("");
      toast.success("Reply sent successfully");
    },
  });

  const handleSelectMessage = (message: GymMessage) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      markAsRead.mutate(message.id);
    }
  };

  const filteredMessages = messages?.filter(msg => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      msg.subject.toLowerCase().includes(search) ||
      msg.content.toLowerCase().includes(search) ||
      msg.sender_member?.first_name?.toLowerCase().includes(search) ||
      msg.sender_member?.last_name?.toLowerCase().includes(search)
    );
  });

  const unreadCount = messages?.filter(m => !m.is_read).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Unified inbox for all member communications
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          <Inbox className="mr-2 h-4 w-4" />
          {unreadCount} unread
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Messages</SelectItem>
            <SelectItem value="unread">Unread Only</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-6 h-[600px]">
        {/* Message List */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Inbox</CardTitle>
          </CardHeader>
          <ScrollArea className="h-[520px]">
            <CardContent className="space-y-2 p-3">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))
              ) : filteredMessages?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No messages found</p>
                </div>
              ) : (
                filteredMessages?.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedMessage?.id === message.id
                        ? "bg-primary/10 border-primary"
                        : !message.is_read
                        ? "bg-muted/50 border-border hover:bg-muted"
                        : "bg-background border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`font-medium truncate ${!message.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                            {message.sender_member
                              ? `${message.sender_member.first_name || ""} ${message.sender_member.last_name || ""}`.trim() || "Member"
                              : message.sender_staff?.display_name || "Staff"}
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${!message.is_read ? "font-medium" : ""}`}>
                          {message.subject}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                          {message.content}
                        </p>
                        {message.assigned_staff && (
                          <div className="flex items-center gap-1 mt-1">
                            <UserCheck className="h-3 w-3 text-primary" />
                            <span className="text-xs text-primary">
                              {message.assigned_staff.display_name}
                            </span>
                          </div>
                        )}
                      </div>
                      {!message.is_read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </ScrollArea>
        </Card>

        {/* Message Detail */}
        <Card>
          {selectedMessage ? (
            <>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <User className="h-3 w-3" />
                      {selectedMessage.sender_member
                        ? `${selectedMessage.sender_member.first_name || ""} ${selectedMessage.sender_member.last_name || ""}`.trim()
                        : selectedMessage.sender_staff?.display_name || "Unknown"}
                      <span className="text-muted-foreground">•</span>
                      <Clock className="h-3 w-3" />
                      {format(new Date(selectedMessage.created_at), "PPp")}
                    </CardDescription>
                  </div>
                  {selectedMessage.is_read && (
                    <CheckCheck className="h-4 w-4 text-primary" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="py-4">
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
              </CardContent>
              <div className="p-4 border-t space-y-4">
                {/* Assign to Staff */}
                <div className="flex items-center gap-4">
                  <Select
                    value={selectedMessage.assigned_to_staff_id || ""}
                    onValueChange={(staffId) => 
                      assignToStaff.mutate({ messageId: selectedMessage.id, staffId })
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <UserCheck className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Assign to staff..." />
                    </SelectTrigger>
                    <SelectContent>
                      {staffList?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.display_name || "Staff"} ({s.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reply Button */}
                {selectedMessage.sender_member_id && (
                  <Button onClick={() => setReplyDialogOpen(true)} className="w-full">
                    <Reply className="mr-2 h-4 w-4" />
                    Reply to Member
                  </Button>
                )}
              </div>
            </>
          ) : (
            <CardContent className="h-full flex items-center justify-center text-center text-muted-foreground">
              <div>
                <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a message to view</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Message</DialogTitle>
            <DialogDescription>
              Replying to: {selectedMessage?.sender_member?.first_name} {selectedMessage?.sender_member?.last_name}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Type your reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedMessage?.sender_member_id) {
                  sendReply.mutate({
                    recipientMemberId: selectedMessage.sender_member_id,
                    content: replyContent,
                  });
                }
              }}
              disabled={!replyContent.trim() || sendReply.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              {sendReply.isPending ? "Sending..." : "Send Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
