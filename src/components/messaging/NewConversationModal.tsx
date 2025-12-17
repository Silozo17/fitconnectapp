import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Search, User, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface MessageableContact {
  id: string; // profile ID for messaging
  name: string;
  avatar_url: string | null;
  type: "client" | "coach" | "admin" | "connection";
}

interface NewConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewConversationModal = ({ open, onOpenChange }: NewConversationModalProps) => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<MessageableContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<MessageableContact | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const basePath = role === "coach" ? "/dashboard/coach/messages" : "/dashboard/client/messages";

  useEffect(() => {
    const fetchMessageableContacts = async () => {
      if (!user || !open) return;

      setLoading(true);
      const allContacts: MessageableContact[] = [];

      try {
        // For coaches: also fetch formal clients from coach_clients
        if (role === "coach") {
          const { data: coachProfile } = await supabase
            .from("coach_profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();

          if (coachProfile) {
            const { data: coachClients } = await supabase
              .from("coach_clients")
              .select(`
                client_id,
                client_profiles:client_id (
                  id,
                  first_name,
                  last_name,
                  avatar_url
                )
              `)
              .eq("coach_id", coachProfile.id)
              .eq("status", "active");

            coachClients?.forEach((cc: any) => {
              if (cc.client_profiles) {
                const name = `${cc.client_profiles.first_name || ""} ${cc.client_profiles.last_name || ""}`.trim() || "Client";
                allContacts.push({
                  id: cc.client_profiles.id,
                  name,
                  avatar_url: cc.client_profiles.avatar_url,
                  type: "client",
                });
              }
            });
          }
        }

        // For all users: fetch accepted connections from user_connections
        const { data: connections } = await supabase
          .from("user_connections")
          .select("*")
          .eq("status", "accepted")
          .or(`requester_user_id.eq.${user.id},addressee_user_id.eq.${user.id}`);

        if (connections) {
          for (const conn of connections) {
            const isRequester = conn.requester_user_id === user.id;
            const targetUserId = isRequester ? conn.addressee_user_id : conn.requester_user_id;
            const targetProfileType = isRequester ? conn.addressee_profile_type : conn.requester_profile_type;

            // Skip if we already have this contact (from coach_clients)
            let profile: any = null;

            if (targetProfileType === "client") {
              const { data } = await supabase
                .from("client_profiles")
                .select("id, first_name, last_name, avatar_url")
                .eq("user_id", targetUserId)
                .single();
              profile = data;
              if (profile && !allContacts.some(c => c.id === profile.id)) {
                allContacts.push({
                  id: profile.id,
                  name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User",
                  avatar_url: profile.avatar_url,
                  type: "connection",
                });
              }
            } else if (targetProfileType === "coach") {
              const { data } = await supabase
                .from("coach_profiles")
                .select("id, display_name, profile_image_url")
                .eq("user_id", targetUserId)
                .single();
              profile = data;
              if (profile && !allContacts.some(c => c.id === profile.id)) {
                allContacts.push({
                  id: profile.id,
                  name: profile.display_name || "Coach",
                  avatar_url: profile.profile_image_url,
                  type: "connection",
                });
              }
            } else if (targetProfileType === "admin") {
              const { data } = await supabase
                .from("admin_profiles")
                .select("id, first_name, last_name, display_name, avatar_url")
                .eq("user_id", targetUserId)
                .single();
              profile = data;
              if (profile && !allContacts.some(c => c.id === profile.id)) {
                const name = profile.display_name || 
                  `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || 
                  "Admin";
                allContacts.push({
                  id: profile.id,
                  name,
                  avatar_url: profile.avatar_url,
                  type: "connection",
                });
              }
            }
          }
        }

        setContacts(allContacts);
      } catch (error) {
        console.error("Error fetching messageable contacts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessageableContacts();
  }, [user, open, role]);

  const filteredContacts = contacts.filter((contact) => {
    return contact.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleStartConversation = async () => {
    if (!selectedContact || !user) return;

    setSending(true);

    try {
      // Get current user's profile ID for sending
      let senderProfileId: string | null = null;
      
      if (role === "coach") {
        const { data } = await supabase
          .from("coach_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();
        senderProfileId = data?.id || null;
      } else if (role === "client") {
        const { data } = await supabase
          .from("client_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();
        senderProfileId = data?.id || null;
      } else {
        const { data } = await supabase
          .from("admin_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();
        senderProfileId = data?.id || null;
      }

      if (!senderProfileId) {
        toast.error("Unable to find your profile");
        setSending(false);
        return;
      }

      if (message.trim()) {
        const { error } = await supabase.from("messages").insert({
          sender_id: senderProfileId,
          receiver_id: selectedContact.id,
          content: message.trim(),
        });

        if (error) {
          console.error("Error sending message:", error);
          toast.error("Failed to send message");
          setSending(false);
          return;
        }
      }

      toast.success("Conversation started!");
      setSending(false);
      onOpenChange(false);
      setSelectedContact(null);
      setMessage("");
      navigate(`${basePath}/${selectedContact.id}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Failed to start conversation");
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Select a contact to start a conversation
          </DialogDescription>
        </DialogHeader>

        {!selectedContact ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No contacts found</p>
                  <p className="text-xs mt-1">Add connections to message them</p>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {contact.avatar_url ? (
                        <img
                          src={contact.avatar_url}
                          alt={contact.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <span className="font-medium text-foreground">
                      {contact.name}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {selectedContact.avatar_url ? (
                  <img
                    src={selectedContact.avatar_url}
                    alt={selectedContact.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {selectedContact.name}
                </p>
                <p className="text-xs text-muted-foreground">Selected</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedContact(null)}
              >
                Change
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Message (optional)
              </label>
              <Textarea
                placeholder="Write your first message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleStartConversation} disabled={sending}>
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start Chat
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationModal;
