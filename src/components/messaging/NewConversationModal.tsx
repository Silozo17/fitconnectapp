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

interface Client {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface NewConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewConversationModal = ({ open, onOpenChange }: NewConversationModalProps) => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const basePath = role === "coach" ? "/dashboard/coach/messages" : "/dashboard/client/messages";

  useEffect(() => {
    const fetchClients = async () => {
      if (!user || !open) return;

      setLoading(true);

      // Get coach profile ID
      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!coachProfile) {
        setLoading(false);
        return;
      }

      // Get connected clients
      const { data: coachClients, error } = await supabase
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

      if (error) {
        console.error("Error fetching clients:", error);
        setLoading(false);
        return;
      }

      const clientList = coachClients
        ?.map((cc: any) => cc.client_profiles)
        .filter(Boolean) as Client[];

      setClients(clientList || []);
      setLoading(false);
    };

    fetchClients();
  }, [user, open]);

  const filteredClients = clients.filter((client) => {
    const fullName = `${client.first_name || ""} ${client.last_name || ""}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const handleStartConversation = async () => {
    if (!selectedClient) return;

    setSending(true);

    if (message.trim()) {
      // Get coach profile ID
      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (coachProfile) {
        // Send initial message
        const { error } = await supabase.from("messages").insert({
          sender_id: coachProfile.id,
          receiver_id: selectedClient.id,
          content: message.trim(),
        });

        if (error) {
          console.error("Error sending message:", error);
          toast.error("Failed to send message");
          setSending(false);
          return;
        }
      }
    }

    toast.success("Conversation started!");
    setSending(false);
    onOpenChange(false);
    setSelectedClient(null);
    setMessage("");
    navigate(`${basePath}/${selectedClient.id}`);
  };

  const getClientName = (client: Client) => {
    return `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Client";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Select a client to start a conversation
          </DialogDescription>
        </DialogHeader>

        {!selectedClient ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
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
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No clients found</p>
                </div>
              ) : (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {client.avatar_url ? (
                        <img
                          src={client.avatar_url}
                          alt={getClientName(client)}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <span className="font-medium text-foreground">
                      {getClientName(client)}
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
                {selectedClient.avatar_url ? (
                  <img
                    src={selectedClient.avatar_url}
                    alt={getClientName(selectedClient)}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {getClientName(selectedClient)}
                </p>
                <p className="text-xs text-muted-foreground">Selected</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedClient(null)}
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
