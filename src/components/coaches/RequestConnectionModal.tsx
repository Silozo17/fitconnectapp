import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Send, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { MarketplaceCoach } from "@/hooks/useCoachMarketplace";
import { useTranslation } from "@/hooks/useTranslation";

interface RequestConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coach: MarketplaceCoach;
}

interface ConnectionRequest {
  id: string;
  status: string;
}

const RequestConnectionModal = ({
  open,
  onOpenChange,
  coach,
}: RequestConnectionModalProps) => {
  const { user } = useAuth();
  const { t } = useTranslation('coaches');
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  // Get client profile ID
  const { data: clientProfile } = useQuery({
    queryKey: ["client-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Check existing connection or request
  const { data: existingStatus } = useQuery({
    queryKey: ["connection-status", clientProfile?.id, coach.id],
    queryFn: async () => {
      if (!clientProfile?.id) return null;

      // Check if already connected
      const { data: connection } = await supabase
        .from("coach_clients")
        .select("id, status")
        .eq("client_id", clientProfile.id)
        .eq("coach_id", coach.id)
        .maybeSingle();

      if (connection) {
        return { type: "connected" as const, data: connection as ConnectionRequest };
      }

      // Check for pending request (using raw SQL-like approach for new table)
      const { data: request, error } = await supabase
        .from("connection_requests" as any)
        .select("id, status")
        .eq("client_id", clientProfile.id)
        .eq("coach_id", coach.id)
        .maybeSingle();

      if (request && !error) {
        return { type: "request" as const, data: request as unknown as ConnectionRequest };
      }

      return null;
    },
    enabled: !!clientProfile?.id && open,
  });

  const sendRequestMutation = useMutation({
    mutationFn: async () => {
      if (!clientProfile?.id) throw new Error("Client profile not found");

      const { data, error } = await supabase
        .from("connection_requests")
        .insert({
          client_id: clientProfile.id,
          coach_id: coach.id,
          message: message.trim() || null,
        })
        .select("id")
        .single();

      if (error) throw error;
      
      const messageContent = message.trim() || `Hi, I'd like to connect with you for coaching.`;
      
      // Create a message from client to coach (so it shows in coach's Messages)
      await supabase
        .from("messages")
        .insert({
          sender_id: clientProfile.id,
          receiver_id: coach.id,
          content: messageContent,
        })
        .then(({ error: msgError }) => {
          if (msgError) console.error("Failed to create message:", msgError);
        });

      // Add client to coach's pipeline as a new lead
      await supabase
        .from("coach_leads")
        .upsert({
          coach_id: coach.id,
          client_id: clientProfile.id,
          source: 'marketplace_request',
          stage: 'new_lead',
        }, { onConflict: 'coach_id,client_id' })
        .then(({ error: leadError }) => {
          if (leadError) console.error("Failed to create lead:", leadError);
        });
      
      // Send email notification to coach
      if (data?.id) {
        await supabase.functions.invoke("send-connection-request-email", {
          body: { connectionRequestId: data.id },
        }).catch((err) => console.error("Failed to send connection request email:", err));
      }
    },
    onSuccess: () => {
      toast.success(t('connection.sent'));
      queryClient.invalidateQueries({
        queryKey: ["connection-status", clientProfile?.id, coach.id],
      });
      setMessage("");
    },
    onError: (error) => {
      toast.error("Failed to send request. Please try again.");
      console.error("Request error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendRequestMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('connection.connectWith', { name: coach.display_name })}</DialogTitle>
          <DialogDescription>
            {t('connection.sendRequest')}
          </DialogDescription>
        </DialogHeader>

        {existingStatus?.type === "connected" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
            <p className="font-medium text-foreground">{t('connection.alreadyConnected')}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('connection.alreadyConnectedDesc')}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => onOpenChange(false)}
            >
              {t('connection.close')}
            </Button>
          </div>
        ) : existingStatus?.type === "request" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
              <Loader2 className="h-6 w-6 text-amber-500" />
            </div>
            <p className="font-medium text-foreground">{t('connection.requestPending')}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {existingStatus.data.status === "pending"
                ? t('connection.awaitingResponse')
                : t('connection.requestWas', { status: existingStatus.data.status })}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => onOpenChange(false)}
            >
              {t('connection.close')}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">
                {t('connection.messageOptional')}
              </Label>
              <Textarea
                id="message"
                placeholder={t('connection.tellCoachAbout')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {message.length}/500
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('connection.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={sendRequestMutation.isPending}
              >
                {sendRequestMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {t('connection.send')}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RequestConnectionModal;