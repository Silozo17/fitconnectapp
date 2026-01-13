import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { toast } from "sonner";

export interface MembershipPlan {
  id: string;
  gym_id: string;
  name: string;
  description: string | null;
  plan_type: string;
  price_amount: number;
  currency: string;
  billing_interval: string | null;
  billing_interval_count: number;
  setup_fee: number;
  class_credits: number | null;
  credits_expire_days: number | null;
  included_class_types: string[] | null;
  locations_access: string[] | null;
  unlimited_classes: boolean;
  max_classes_per_week: number | null;
  max_classes_per_day: number | null;
  min_commitment_months: number | null;
  notice_period_days: number;
  cancellation_fee: number | null;
  trial_days: number | null;
  features: string[] | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  is_active: boolean;
  is_visible: boolean;
  is_featured: boolean;
  sort_order: number;
  badge_text: string | null;
  badge_color: string | null;
}

export interface GymMembership {
  id: string;
  gym_id: string;
  member_id: string;
  plan_id: string | null;
  status: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  price_amount: number | null;
  currency: string;
  credits_remaining: number | null;
  credits_total: number | null;
  credits_expire_at: string | null;
  paused_at: string | null;
  pause_until: string | null;
  cancelled_at: string | null;
  cancel_at_period_end: boolean;
  started_at: string;
  expires_at: string | null;
  // Joined
  plan?: MembershipPlan;
  member?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
}

// Fetch membership plans
export function useMembershipPlans() {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["membership-plans", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return [];

      const { data, error } = await supabase
        .from("membership_plans")
        .select("*")
        .eq("gym_id", gym.id)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as MembershipPlan[];
    },
    enabled: !!gym?.id,
  });
}

// Fetch visible plans (for public pricing page)
export function usePublicMembershipPlans(gymId: string | undefined) {
  return useQuery({
    queryKey: ["public-membership-plans", gymId],
    queryFn: async () => {
      if (!gymId) return [];

      const { data, error } = await supabase
        .from("membership_plans")
        .select("*")
        .eq("gym_id", gymId)
        .eq("is_active", true)
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as MembershipPlan[];
    },
    enabled: !!gymId,
  });
}

// Create membership plan
export function useCreateMembershipPlan() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planData: Partial<MembershipPlan>) => {
      if (!gym?.id) throw new Error("No gym selected");

      const { data, error } = await supabase
        .from("membership_plans")
        .insert({
          ...planData,
          gym_id: gym.id,
        } as never)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membership-plans", gym?.id] });
      toast.success("Membership plan created");
    },
    onError: (error) => {
      console.error("Failed to create plan:", error);
      toast.error("Failed to create membership plan");
    },
  });
}

// Update membership plan
export function useUpdateMembershipPlan() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, updates }: { planId: string; updates: Partial<MembershipPlan> }) => {
      const { data, error } = await supabase
        .from("membership_plans")
        .update(updates)
        .eq("id", planId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membership-plans", gym?.id] });
      toast.success("Membership plan updated");
    },
    onError: (error) => {
      console.error("Failed to update plan:", error);
      toast.error("Failed to update membership plan");
    },
  });
}

// Fetch active memberships
interface UseMembershipsOptions {
  status?: string;
  planId?: string;
  limit?: number;
}

export function useGymMemberships(options: UseMembershipsOptions = {}) {
  const { gym } = useGym();
  const { status, planId, limit = 50 } = options;

  return useQuery({
    queryKey: ["gym-memberships", gym?.id, status, planId, limit],
    queryFn: async () => {
      if (!gym?.id) return [];

      let query = supabase
        .from("gym_memberships")
        .select(`
          *,
          plan:membership_plans(*),
          member:gym_members(id, first_name, last_name, email, avatar_url)
        `)
        .eq("gym_id", gym.id)
        .order("started_at", { ascending: false })
        .limit(limit);

      if (status && status !== "all") {
        query = query.eq("status", status);
      }
      if (planId) {
        query = query.eq("plan_id", planId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as GymMembership[];
    },
    enabled: !!gym?.id,
  });
}

// Membership stats
export function useMembershipStats() {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["membership-stats", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return null;

      const [activeResult, pausedResult, cancelledResult, revenueResult] = await Promise.all([
        supabase
          .from("gym_memberships")
          .select("id", { count: "exact", head: true })
          .eq("gym_id", gym.id)
          .eq("status", "active"),
        supabase
          .from("gym_memberships")
          .select("id", { count: "exact", head: true })
          .eq("gym_id", gym.id)
          .eq("status", "paused"),
        supabase
          .from("gym_memberships")
          .select("id", { count: "exact", head: true })
          .eq("gym_id", gym.id)
          .eq("status", "cancelled")
          .gte("cancelled_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        // Monthly recurring revenue
        supabase
          .from("gym_memberships")
          .select("price_amount")
          .eq("gym_id", gym.id)
          .eq("status", "active"),
      ]);

      const mrr = (revenueResult.data || []).reduce(
        (sum, m) => sum + (m.price_amount || 0),
        0
      );

      return {
        active: activeResult.count || 0,
        paused: pausedResult.count || 0,
        cancelledThisMonth: cancelledResult.count || 0,
        mrr,
      };
    },
    enabled: !!gym?.id,
  });
}

// Pause membership
export function usePauseMembership() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      membershipId,
      pauseUntil,
      reason,
    }: {
      membershipId: string;
      pauseUntil?: string;
      reason?: string;
    }) => {
      const { data, error } = await supabase
        .from("gym_memberships")
        .update({
          status: "paused",
          paused_at: new Date().toISOString(),
          pause_until: pauseUntil,
          pause_reason: reason,
        })
        .eq("id", membershipId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-memberships", gym?.id] });
      toast.success("Membership paused");
    },
    onError: (error) => {
      console.error("Failed to pause membership:", error);
      toast.error("Failed to pause membership");
    },
  });
}

// Cancel membership
export function useCancelMembership() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      membershipId,
      immediate,
      reason,
    }: {
      membershipId: string;
      immediate?: boolean;
      reason?: string;
    }) => {
      const updates: Record<string, unknown> = {
        cancellation_reason: reason,
      };

      if (immediate) {
        updates.status = "cancelled";
        updates.cancelled_at = new Date().toISOString();
      } else {
        updates.cancel_at_period_end = true;
      }

      const { data, error } = await supabase
        .from("gym_memberships")
        .update(updates)
        .eq("id", membershipId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-memberships", gym?.id] });
      toast.success("Membership cancelled");
    },
    onError: (error) => {
      console.error("Failed to cancel membership:", error);
      toast.error("Failed to cancel membership");
    },
  });
}
