import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PendingPaymentSession {
  id: string;
  coach_id: string;
  scheduled_at: string;
  duration_minutes: number;
  session_type: string;
  is_online: boolean;
  location: string | null;
  price: number;
  currency: string;
  payment_status: string;
  created_at: string;
  coach_profiles?: {
    id: string;
    display_name: string | null;
    username: string;
    profile_image_url: string | null;
  };
}

export function usePendingPayments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["pending-payments", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get client profile
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!clientProfile) return [];

      // Fetch sessions pending payment
      const { data, error } = await supabase
        .from("coaching_sessions")
        .select(`
          id,
          coach_id,
          scheduled_at,
          duration_minutes,
          session_type,
          is_online,
          location,
          price,
          currency,
          payment_status,
          created_at,
          coach_profiles!coaching_sessions_coach_id_fkey (
            id,
            display_name,
            username,
            profile_image_url
          )
        `)
        .eq("client_id", clientProfile.id)
        .eq("payment_mode", "paid")
        .eq("payment_status", "pending")
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      return data as unknown as PendingPaymentSession[];
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
