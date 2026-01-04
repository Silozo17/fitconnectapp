import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isDespia } from "@/lib/despia";
import { supabase } from "@/integrations/supabase/client";
import { useCoachProfileId } from "./useCoachProfileId";
import { toast } from "sonner";

export interface CoachBoost {
  id: string;
  coach_id: string;
  is_active: boolean;
  activated_at: string | null;
  deactivated_at: string | null;
  total_clients_acquired: number;
  total_fees_paid: number;
  created_at: string;
  updated_at: string;
  // New paid boost fields
  boost_start_date: string | null;
  boost_end_date: string | null;
  payment_status: 'none' | 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'migrated_free';
  activation_payment_intent_id: string | null;
}

export interface BoostAttribution {
  id: string;
  coach_id: string;
  client_id: string;
  attributed_at: string;
  first_booking_id: string | null;
  booking_amount: number | null;
  fee_amount: number | null;
  fee_status: 'pending' | 'charged' | 'waived';
  stripe_charge_id: string | null;
  created_at: string;
  client_profiles?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export interface BoostSettings {
  id: string;
  commission_rate: number;
  min_fee: number;
  max_fee: number;
  is_active: boolean;
  updated_at: string;
  // New pricing fields
  boost_price: number; // in pence
  boost_duration_days: number;
}

// Helper to check if boost is currently active based on end date
// Accepts both 'succeeded' (paid) and 'migrated_free' (legacy migration) as valid statuses
export const isBoostActive = (boost: CoachBoost | null): boolean => {
  if (!boost) return false;
  if (!boost.boost_end_date) return false;
  // migrated_free = legacy boosts granted 30 days during paid model migration
  if (boost.payment_status !== 'succeeded' && boost.payment_status !== 'migrated_free') return false;
  return new Date(boost.boost_end_date) > new Date();
};

// Helper to get remaining days
export const getBoostRemainingDays = (boost: CoachBoost | null): number => {
  if (!boost?.boost_end_date) return 0;
  const endDate = new Date(boost.boost_end_date);
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
};

export const useCoachBoostStatus = () => {
  const { data: coachProfileId } = useCoachProfileId();

  return useQuery({
    queryKey: ["coach-boost-status", coachProfileId],
    queryFn: async () => {
      if (!coachProfileId) return null;

      const { data, error } = await supabase
        .from("coach_boosts")
        .select("*")
        .eq("coach_id", coachProfileId)
        .maybeSingle();

      if (error) throw error;
      return data as CoachBoost | null;
    },
    enabled: !!coachProfileId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useBoostAttributions = (limit = 10) => {
  const { data: coachProfileId } = useCoachProfileId();

  return useQuery({
    queryKey: ["boost-attributions", coachProfileId, limit],
    queryFn: async () => {
      if (!coachProfileId) return [];

      const { data, error } = await supabase
        .from("boost_client_attributions")
        .select(`
          *,
          client_profiles:client_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq("coach_id", coachProfileId)
        .order("attributed_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as BoostAttribution[];
    },
    enabled: !!coachProfileId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useBoostSettings = () => {
  return useQuery({
    queryKey: ["boost-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boost_settings")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data as BoostSettings;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// New: Purchase boost mutation
export const usePurchaseBoost = (countryCode?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // PHASE 7 FIX: HARD BLOCK - Never use Stripe for boost on native apps
      if (isDespia()) {
        throw new Error("Boost purchase is not available in the mobile app. Please use the web version.");
      }
      
      const { data, error } = await supabase.functions.invoke("boost-checkout", {
        body: { countryCode: countryCode || "GB" },
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data as { url: string };
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      if (data.url) {
        window.open(data.url, "_blank");
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to start checkout");
      console.error(error);
    },
  });
};

// Keep legacy toggle for backwards compatibility, but it now only disables
export const useToggleBoost = () => {
  const queryClient = useQueryClient();
  const { data: coachProfileId } = useCoachProfileId();

  return useMutation({
    mutationFn: async (enable: boolean) => {
      if (!coachProfileId) throw new Error("Coach profile not found");

      // Can only disable via toggle now - enabling requires purchase
      if (enable) {
        throw new Error("Please purchase Boost to enable it");
      }

      const { error } = await supabase
        .from("coach_boosts")
        .update({
          is_active: false,
          deactivated_at: new Date().toISOString(),
        })
        .eq("coach_id", coachProfileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-boost-status"] });
      toast.success("Boost disabled. Note: Your paid period will still be valid.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update boost status");
      console.error(error);
    },
  });
};

// Admin hooks
export const useAllBoosts = () => {
  return useQuery({
    queryKey: ["admin-all-boosts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_boosts")
        .select(`
          *,
          coach_profiles:coach_id (
            display_name,
            profile_image_url,
            location
          )
        `)
        .order("is_active", { ascending: false })
        .order("activated_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useAllAttributions = (limit = 50) => {
  return useQuery({
    queryKey: ["admin-all-attributions", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boost_client_attributions")
        .select(`
          *,
          coach_profiles:coach_id (
            display_name
          ),
          client_profiles:client_id (
            first_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });
};

export const useBoostStats = () => {
  return useQuery({
    queryKey: ["admin-boost-stats"],
    queryFn: async () => {
      // Get active boosts count - now based on boost_end_date
      const now = new Date().toISOString();
      const { count: activeBoosts } = await supabase
        .from("coach_boosts")
        .select("*", { count: "exact", head: true })
        .gt("boost_end_date", now)
        .in("payment_status", ["succeeded", "migrated_free"]);

      // Get total revenue from attributions (30% commission)
      const { data: revenueData } = await supabase
        .from("boost_client_attributions")
        .select("fee_amount")
        .eq("fee_status", "charged");

      const totalRevenue = revenueData?.reduce((sum, item) => sum + (item.fee_amount || 0), 0) || 0;

      // Get activation fee revenue (£5 per activation)
      const { data: activationData } = await supabase
        .from("coach_invoices")
        .select("total")
        .eq("source_type", "boost_activation");

      const activationRevenue = activationData?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;

      // Get this month's attributions
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: monthlyClients } = await supabase
        .from("boost_client_attributions")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString());

      const { data: monthlyRevenueData } = await supabase
        .from("boost_client_attributions")
        .select("fee_amount")
        .eq("fee_status", "charged")
        .gte("created_at", startOfMonth.toISOString());

      const monthlyRevenue = monthlyRevenueData?.reduce((sum, item) => sum + (item.fee_amount || 0), 0) || 0;

      return {
        activeBoosts: activeBoosts || 0,
        totalRevenue,
        activationRevenue,
        monthlyClients: monthlyClients || 0,
        monthlyRevenue,
      };
    },
  });
};

export const useUpdateBoostSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<BoostSettings>) => {
      const { error } = await supabase
        .from("boost_settings")
        .update(settings)
        .eq("is_active", true);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boost-settings"] });
      toast.success("Boost settings updated");
    },
    onError: () => {
      toast.error("Failed to update settings");
    },
  });
};

// Reset pending boost mutation - called when user cancels checkout
// Deletes the pending record entirely to allow clean retry
export const useResetPendingBoost = () => {
  const queryClient = useQueryClient();
  const { data: coachProfileId } = useCoachProfileId();

  return useMutation({
    mutationFn: async () => {
      if (!coachProfileId) throw new Error("Coach profile not found");

      // Delete any pending boost records (not just update to cancelled)
      // This ensures a clean state for retry
      const { error } = await supabase
        .from("coach_boosts")
        .delete()
        .eq("coach_id", coachProfileId)
        .eq("payment_status", "pending");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-boost-status"] });
    },
  });
};

// Calculate boost fee helper
// Logic: Fee is 30% of booking, but calculated on a clamped range:
// - Floor: min_fee (£30) - bookings below this still pay 30% of min_fee
// - Cap: max_fee (£100) - bookings above this only pay 30% of max_fee
export const calculateBoostFee = (
  bookingAmount: number,
  settings: BoostSettings
): number => {
  // Clamp the booking amount between min and max for fee calculation
  const cappedAmount = Math.min(Math.max(bookingAmount, settings.min_fee), settings.max_fee);
  const fee = cappedAmount * settings.commission_rate;
  return Math.round(fee * 100) / 100;
};
