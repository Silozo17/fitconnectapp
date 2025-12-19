import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SessionOffer {
  id: string;
  coach_id: string;
  client_id: string;
  session_type: string;
  proposed_date: string;
  duration_minutes: number;
  price: number;
  currency: string;
  is_free: boolean;
  is_online: boolean;
  location: string | null;
  notes: string | null;
  status: "pending" | "accepted" | "declined" | "expired" | "cancelled";
  accepted_at: string | null;
  declined_at: string | null;
  created_session_id: string | null;
  created_at: string;
  expires_at: string | null;
}

export interface CreateSessionOfferData {
  coach_id: string;
  client_id: string;
  session_type: string;
  proposed_date: Date;
  duration_minutes: number;
  price: number;
  currency?: string;
  is_free?: boolean;
  is_online?: boolean;
  location?: string;
  notes?: string;
}

export const useSessionOffers = (clientId?: string) => {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ["session-offers", clientId],
    queryFn: async () => {
      if (!clientId) return [];

      const { data, error } = await supabase
        .from("session_offers")
        .select("*")
        .or(`coach_id.eq.${clientId},client_id.eq.${clientId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SessionOffer[];
    },
    enabled: !!clientId,
  });
};

export const useCreateSessionOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSessionOfferData) => {
      const { data: offer, error } = await supabase
        .from("session_offers")
        .insert({
          coach_id: data.coach_id,
          client_id: data.client_id,
          session_type: data.session_type,
          proposed_date: data.proposed_date.toISOString(),
          duration_minutes: data.duration_minutes,
          price: data.price,
          currency: data.currency || "GBP",
          is_free: data.is_free || data.price === 0,
          is_online: data.is_online ?? true,
          location: data.location || null,
          notes: data.notes || null,
          status: "pending",
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        })
        .select()
        .single();

      if (error) throw error;
      return offer;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["session-offers"] });
      toast.success("Session offer sent!");
    },
    onError: (error) => {
      console.error("Failed to create session offer:", error);
      toast.error("Failed to send session offer");
    },
  });
};

export const useRespondToSessionOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      offerId,
      response,
    }: {
      offerId: string;
      response: "accepted" | "declined";
    }) => {
      // First get the offer details
      const { data: offer, error: fetchError } = await supabase
        .from("session_offers")
        .select("*")
        .eq("id", offerId)
        .single();

      if (fetchError) throw fetchError;

      // Update the offer status
      const updateData: Record<string, unknown> = {
        status: response,
        [response === "accepted" ? "accepted_at" : "declined_at"]: new Date().toISOString(),
      };

      // If accepted, create a coaching session
      if (response === "accepted") {
        const { data: session, error: sessionError } = await supabase
          .from("coaching_sessions")
          .insert({
            coach_id: offer.coach_id,
            client_id: offer.client_id,
            scheduled_at: offer.proposed_date,
            duration_minutes: offer.duration_minutes,
            session_type: offer.session_type,
            is_online: offer.is_online,
            location: offer.location,
            notes: offer.notes,
            status: "scheduled",
          })
          .select("id")
          .single();

        if (sessionError) throw sessionError;
        updateData.created_session_id = session.id;
      }

      const { error: updateError } = await supabase
        .from("session_offers")
        .update(updateData)
        .eq("id", offerId);

      if (updateError) throw updateError;

      return { response, offer };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["session-offers"] });
      queryClient.invalidateQueries({ queryKey: ["coaching-sessions"] });
      
      if (data.response === "accepted") {
        toast.success("Session accepted and added to your calendar!");
      } else {
        toast.info("Session offer declined");
      }
    },
    onError: (error) => {
      console.error("Failed to respond to session offer:", error);
      toast.error("Failed to respond to session offer");
    },
  });
};
