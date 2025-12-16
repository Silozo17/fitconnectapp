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

      const { error } = await supabase
        .from("connection_requests" as any)
        .insert({
          client_id: clientProfile.id,
          coach_id: coach.id,
          message: message.trim() || null,
        } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Connection request sent!");
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
          <DialogTitle>Connect with {coach.display_name}</DialogTitle>
          <DialogDescription>
            Send a connection request to start working with this coach.
          </DialogDescription>
        </DialogHeader>

        {existingStatus?.type === "connected" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
            <p className="font-medium text-foreground">Already Connected</p>
            <p className="text-sm text-muted-foreground mt-1">
              You are already connected with this coach.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        ) : existingStatus?.type === "request" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
              <Loader2 className="h-6 w-6 text-amber-500" />
            </div>
            <p className="font-medium text-foreground">Request Pending</p>
            <p className="text-sm text-muted-foreground mt-1">
              {existingStatus.data.status === "pending"
                ? "Your request is awaiting the coach's response."
                : `Your request was ${existingStatus.data.status}.`}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">
                Message (Optional)
              </Label>
              <Textarea
                id="message"
                placeholder="Tell the coach about your fitness goals and what you're looking for..."
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
                Cancel
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
                Send Request
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RequestConnectionModal;
