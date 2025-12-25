import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminView } from "@/contexts/AdminContext";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation('messaging');
  const { user, role } = useAuth();
  const { activeProfileType, activeProfileId } = useAdminView();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<MessageableContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<MessageableContact | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const basePath = activeProfileType === "admin" 
    ? "/dashboard/admin/messages" 
    : activeProfileType === "coach" 
      ? "/dashboard/coach/messages" 
      : "/dashboard/client/messages";

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
      // Get current user's profile ID for sending - use activeProfileId first (handles view switching)
      let senderProfileId: string | null = activeProfileId || null;
      
      // Only fetch if no activeProfileId (fallback for users without view switching)
      if (!senderProfileId) {
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
      }

      if (!senderProfileId) {
        toast.error(t('newConversation.unableToFindProfile'));
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
          toast.error(t('newConversation.failedToSend'));
          setSending(false);
          return;
        }
      }

      toast.success(t('newConversation.conversationStarted'));
      setSending(false);
      onOpenChange(false);
      setSelectedContact(null);
      setMessage("");
      navigate(`${basePath}/${selectedContact.id}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error(t('newConversation.failedToStart'));
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('newConversation.title')}</DialogTitle>
          <DialogDescription>
            {t('newConversation.description')}
          </DialogDescription>
        </DialogHeader>

        {!selectedContact ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('newConversation.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <User className="h-7 w-7 opacity-50" />
                  </div>
                  <p className="font-medium">{t('newConversation.noContacts')}</p>
                  <p className="text-xs mt-1">{t('newConversation.addConnectionsHint')}</p>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 transition-all text-left active:scale-[0.98]"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {contact.avatar_url ? (
                        <img
                          src={contact.avatar_url}
                          alt={contact.name}
                          className="w-11 h-11 rounded-xl object-cover"
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
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-2xl border border-border/30">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {selectedContact.avatar_url ? (
                  <img
                    src={selectedContact.avatar_url}
                    alt={selectedContact.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {selectedContact.name}
                </p>
                <p className="text-xs text-muted-foreground">{t('newConversation.selected')}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl"
                onClick={() => setSelectedContact(null)}
              >
                {t('newConversation.change')}
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('newConversation.messageLabel')}
              </label>
              <Textarea
                placeholder={t('newConversation.messagePlaceholder')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                {t('newConversation.cancel')}
              </Button>
              <Button onClick={handleStartConversation} disabled={sending} className="rounded-xl">
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {t('newConversation.startChat')}
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
