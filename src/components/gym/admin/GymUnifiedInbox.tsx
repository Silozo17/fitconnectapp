import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Inbox,
  Search,
  Filter,
  Send,
  User,
  Clock,
  CheckCircle,
  Circle,
  UserPlus,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender_type: string;
  member: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
  assigned_to_staff_id: string | null;
  assigned_at: string | null;
}

interface Staff {
  id: string;
  display_name: string;
  role: string;
}

export function GymUnifiedInbox() {
  const { gym, staffRecord } = useGym();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread" | "assigned">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [assignToStaff, setAssignToStaff] = useState<string>("");

  // Fetch all messages for the gym
  const { data: messages, isLoading } = useQuery({
    queryKey: ["gym-unified-inbox", gym?.id, filter],
    queryFn: async () => {
      if (!gym?.id) return [];

      let query = supabase
        .from("gym_member_messages")
        .select(`
          id,
          content,
          created_at,
          is_read,
          sender_type,
          assigned_to_staff_id,
          assigned_at,
          sender_member_id
        `)
        .eq("gym_id", gym.id)
        .eq("sender_type", "member")
        .order("created_at", { ascending: false });

      if (filter === "unread") {
        query = query.eq("is_read", false);
      } else if (filter === "assigned") {
        query = query.not("assigned_to_staff_id", "is", null);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch member details separately
      const memberIds = [...new Set((data || []).map(m => m.sender_member_id).filter(Boolean))];
      
      if (memberIds.length === 0) {
        return (data || []).map(msg => ({ ...msg, member: null })) as Message[];
      }
      
      const { data: members } = await supabase
        .from("gym_members")
        .select("id, first_name, last_name, avatar_url")
        .in("id", memberIds as string[]);
      
      const memberMap = new Map((members || []).map(m => [m.id, m]));
      
      return (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        is_read: msg.is_read,
        sender_type: msg.sender_type,
        assigned_to_staff_id: msg.assigned_to_staff_id,
        assigned_at: msg.assigned_at,
        member: msg.sender_member_id ? memberMap.get(msg.sender_member_id) || null : null,
      })) as Message[];
    },
    enabled: !!gym?.id,
  });

  // Fetch staff for assignment
  const { data: staffList } = useQuery({
    queryKey: ["gym-staff-list", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return [];

      const { data, error } = await (supabase as any)
        .from("gym_staff")
        .select("id, display_name, role")
        .eq("gym_id", gym.id)
        .eq("status", "active");

      if (error) throw error;
      return (data || []) as Staff[];
    },
    enabled: !!gym?.id,
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
      queryClient.invalidateQueries({ queryKey: ["gym-unified-inbox"] });
    },
  });

  // Assign to staff mutation
  const assignMessage = useMutation({
    mutationFn: async ({ messageId, staffId }: { messageId: string; staffId: string }) => {
      const { error } = await supabase
        .from("gym_member_messages")
        .update({
          assigned_to_staff_id: staffId,
          assigned_at: new Date().toISOString(),
        })
        .eq("id", messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-unified-inbox"] });
      toast.success("Message assigned");
    },
  });

  // Reply mutation
  const sendReply = useMutation({
    mutationFn: async ({ memberId, content }: { memberId: string; content: string }) => {
      const { error } = await supabase
        .from("gym_member_messages")
        .insert({
          gym_id: gym?.id,
          member_id: memberId,
          sender_type: "staff",
          sender_staff_id: staffRecord?.id,
          content,
          is_read: false,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-unified-inbox"] });
      setReplyContent("");
      setSelectedMessage(null);
      toast.success("Reply sent");
    },
  });

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      markAsRead.mutate(message.id);
    }
  };

  const filteredMessages = messages?.filter((msg) => {
    if (!searchQuery) return true;
    const memberName = `${msg.member?.first_name || ""} ${msg.member?.last_name || ""}`.toLowerCase();
    return memberName.includes(searchQuery.toLowerCase()) || msg.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const unreadCount = messages?.filter((m) => !m.is_read).length || 0;

  return (
    <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Message List */}
      <Card className="md:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              Inbox
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount}</Badge>
              )}
            </CardTitle>
          </div>
          <div className="flex gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="flex gap-1 pt-2">
            <Button
              size="sm"
              variant={filter === "all" ? "default" : "ghost"}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filter === "unread" ? "default" : "ghost"}
              onClick={() => setFilter("unread")}
            >
              Unread
            </Button>
            <Button
              size="sm"
              variant={filter === "assigned" ? "default" : "ghost"}
              onClick={() => setFilter("assigned")}
            >
              Assigned
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-400px)]">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : filteredMessages && filteredMessages.length > 0 ? (
              <div className="divide-y">
                {filteredMessages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                      selectedMessage?.id === message.id ? "bg-muted" : ""
                    } ${!message.is_read ? "bg-primary/5" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.member?.avatar_url || undefined} />
                        <AvatarFallback>
                          {(message.member?.first_name?.[0] || "") + (message.member?.last_name?.[0] || "")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`font-medium text-sm truncate ${!message.is_read ? "font-semibold" : ""}`}>
                            {message.member?.first_name} {message.member?.last_name}
                          </p>
                          <div className="flex items-center gap-1">
                            {!message.is_read && (
                              <Circle className="h-2 w-2 fill-primary text-primary" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(message.created_at), "MMM d")}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {message.content}
                        </p>
                        {message.assigned_to_staff_id && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            <UserPlus className="h-3 w-3 mr-1" />
                            Assigned
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Inbox className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No messages</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Message Detail & Reply */}
      <Card className="md:col-span-2">
        {selectedMessage ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedMessage.member?.avatar_url || undefined} />
                    <AvatarFallback>
                      {(selectedMessage.member?.first_name?.[0] || "") + (selectedMessage.member?.last_name?.[0] || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedMessage.member?.first_name} {selectedMessage.member?.last_name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {format(new Date(selectedMessage.created_at), "MMMM d, yyyy 'at' h:mm a")}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={assignToStaff || selectedMessage.assigned_to_staff_id || ""}
                    onValueChange={(value) => {
                      setAssignToStaff(value);
                      assignMessage.mutate({ messageId: selectedMessage.id, staffId: value });
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Assign to staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffList?.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Message Content */}
                <div className="p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>

                {/* Reply Form */}
                <div className="space-y-4">
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={4}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        if (selectedMessage.member?.id && replyContent.trim()) {
                          sendReply.mutate({
                            memberId: selectedMessage.member.id,
                            content: replyContent,
                          });
                        }
                      }}
                      disabled={!replyContent.trim() || sendReply.isPending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a message to view</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
