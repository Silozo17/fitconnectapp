import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
}

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

export const useToggleBoost = () => {
  const queryClient = useQueryClient();
  const { data: coachProfileId } = useCoachProfileId();

  return useMutation({
    mutationFn: async (enable: boolean) => {
      if (!coachProfileId) throw new Error("Coach profile not found");

      // Check if boost record exists
      const { data: existingBoost } = await supabase
        .from("coach_boosts")
        .select("id")
        .eq("coach_id", coachProfileId)
        .maybeSingle();

      if (existingBoost) {
        // Update existing
        const { error } = await supabase
          .from("coach_boosts")
          .update({
            is_active: enable,
            activated_at: enable ? new Date().toISOString() : null,
            deactivated_at: enable ? null : new Date().toISOString(),
          })
          .eq("coach_id", coachProfileId);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("coach_boosts")
          .insert({
            coach_id: coachProfileId,
            is_active: enable,
            activated_at: enable ? new Date().toISOString() : null,
          });

        if (error) throw error;
      }
    },
    onSuccess: (_, enable) => {
      queryClient.invalidateQueries({ queryKey: ["coach-boost-status"] });
      toast.success(enable ? "Boost enabled! You'll now appear first in search results." : "Boost disabled.");
    },
    onError: (error) => {
      toast.error("Failed to update boost status");
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
      // Get active boosts count
      const { count: activeBoosts } = await supabase
        .from("coach_boosts")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Get total revenue from attributions
      const { data: revenueData } = await supabase
        .from("boost_client_attributions")
        .select("fee_amount")
        .eq("fee_status", "charged");

      const totalRevenue = revenueData?.reduce((sum, item) => sum + (item.fee_amount || 0), 0) || 0;

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
