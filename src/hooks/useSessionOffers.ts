import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { PaymentMode } from "@/hooks/useScheduleSessionWithPackage";

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
  payment_mode: PaymentMode | null;
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
  payment_mode?: PaymentMode;
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
          payment_mode: data.payment_mode || "paid",
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

      // If accepted, handle based on payment_mode
      if (response === "accepted") {
        const paymentMode = offer.payment_mode || (offer.is_free ? "free" : "paid");
        
        // For "use_credits" mode, we need to verify and deduct credits
        if (paymentMode === "use_credits") {
          // Check for active package
          const { data: packages, error: pkgError } = await supabase
            .from("client_package_purchases")
            .select("*, coach_packages(*)")
            .eq("client_id", offer.client_id)
            .eq("coach_id", offer.coach_id)
            .eq("status", "active")
            .order("purchased_at", { ascending: true });

          if (pkgError) throw pkgError;

          // Find package with available credits
          const activePackage = packages?.find(pkg => {
            const tokensRemaining = pkg.sessions_total - (pkg.sessions_used || 0);
            const notExpired = !pkg.expires_at || new Date(pkg.expires_at) > new Date();
            return tokensRemaining > 0 && notExpired;
          });

          if (!activePackage) {
            throw new Error("No package credits available");
          }

          // Create the session with credit usage
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
              payment_mode: "use_credits",
              package_purchase_id: activePackage.id,
            })
            .select("id")
            .single();

          if (sessionError) throw sessionError;
          updateData.created_session_id = session.id;

          // Deduct credit
          const newUsage = (activePackage.sessions_used || 0) + 1;
          const { error: updatePkgError } = await supabase
            .from("client_package_purchases")
            .update({ sessions_used: newUsage })
            .eq("id", activePackage.id);

          if (updatePkgError) throw updatePkgError;

          // Log token usage
          await supabase
            .from("session_token_history")
            .insert({
              package_purchase_id: activePackage.id,
              session_id: session.id,
              action: "used",
              reason: "Session offer accepted",
            });
        } 
        // For "paid" mode, session should be pending payment
        else if (paymentMode === "paid" && !offer.is_free && offer.price > 0) {
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
              status: "pending_payment",
              payment_mode: "paid",
              payment_status: "pending",
              price: offer.price,
              currency: offer.currency,
            })
            .select("id")
            .single();

          if (sessionError) throw sessionError;
          updateData.created_session_id = session.id;
        }
        // For "free" mode, create session directly
        else {
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
              payment_mode: "free",
            })
            .select("id")
            .single();

          if (sessionError) throw sessionError;
          updateData.created_session_id = session.id;
        }
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
      queryClient.invalidateQueries({ queryKey: ["client-active-package"] });
      queryClient.invalidateQueries({ queryKey: ["client-package-purchases"] });
      
      if (data.response === "accepted") {
        const paymentMode = data.offer.payment_mode || (data.offer.is_free ? "free" : "paid");
        if (paymentMode === "paid" && data.offer.price > 0) {
          toast.success("Session accepted! Please complete payment to confirm.");
        } else if (paymentMode === "use_credits") {
          toast.success("Session accepted and credit used!");
        } else {
          toast.success("Session accepted and added to your calendar!");
        }
      } else {
        toast.info("Session offer declined");
      }
    },
    onError: (error: Error) => {
      console.error("Failed to respond to session offer:", error);
      if (error.message === "No package credits available") {
        toast.error("No package credits available. Please purchase a package.");
      } else {
        toast.error("Failed to respond to session offer");
      }
    },
  });
};
