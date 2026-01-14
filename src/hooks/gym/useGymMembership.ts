import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGym } from "@/contexts/GymContext";
import { toast } from "sonner";

export interface GymMembershipDetails {
  id: string;
  member_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string | null;
  credits_remaining: number | null;
  stripe_subscription_id: string | null;
  cancelled_at: string | null;
  plan: {
    id: string;
    name: string;
    description: string | null;
    price_amount: number;
    currency: string;
    billing_interval: string;
    billing_interval_count: number;
    unlimited_classes: boolean;
    class_credits: number | null;
    features: string[] | null;
  } | null;
}

/**
 * Hook to fetch the current user's active membership for a gym
 */
export function useMyGymMembership() {
  const { user } = useAuth();
  const { gym } = useGym();

  return useQuery({
    queryKey: ["my-gym-membership", gym?.id, user?.id],
    queryFn: async () => {
      if (!gym?.id || !user?.id) return null;

      // First get the member record
      const { data: member, error: memberError } = await supabase
        .from("gym_members")
        .select("id")
        .eq("gym_id", gym.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (memberError) throw memberError;
      if (!member) return null;

      // Get active membership
      const { data: membership, error } = await supabase
        .from("gym_memberships")
        .select(`
          *,
          plan:membership_plans(
            id,
            name,
            description,
            price_amount,
            currency,
            billing_interval,
            billing_interval_count,
            unlimited_classes,
            class_credits,
            features
          )
        `)
        .eq("member_id", member.id)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;
      return membership as GymMembershipDetails | null;
    },
    enabled: !!gym?.id && !!user?.id,
  });
}

/**
 * Hook to open the Stripe Customer Portal for managing subscription
 */
export function useGymCustomerPortal() {
  const { gym } = useGym();

  return useMutation({
    mutationFn: async ({ returnUrl }: { returnUrl: string }) => {
      if (!gym?.id) throw new Error("No gym selected");

      const { data, error } = await supabase.functions.invoke("gym-customer-portal", {
        body: {
          gymId: gym.id,
          returnUrl,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("No portal URL returned");

      return data.url as string;
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (error) => {
      console.error("Failed to open customer portal:", error);
      toast.error("Unable to open subscription management. Please try again.");
    },
  });
}

/**
 * Hook to get member's payment history
 */
export function useGymPaymentHistory() {
  const { user } = useAuth();
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-payment-history", gym?.id, user?.id],
    queryFn: async () => {
      if (!gym?.id || !user?.id) return [];

      // Get the member record
      const { data: member, error: memberError } = await supabase
        .from("gym_members")
        .select("id")
        .eq("gym_id", gym.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (memberError) throw memberError;
      if (!member) return [];

      // Get payments
      const { data, error } = await supabase
        .from("gym_payments")
        .select(`
          *,
          membership:gym_memberships(
            plan:membership_plans(name)
          )
        `)
        .eq("member_id", member.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    enabled: !!gym?.id && !!user?.id,
  });
}

/**
 * Hook to get member's remaining credits (simple version for portal)
 */
export function useMyGymCredits() {
  const { user } = useAuth();
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-credits", gym?.id, user?.id],
    queryFn: async () => {
      if (!gym?.id || !user?.id) return { remaining: null, unlimited: false };

      // Get the member record
      const { data: member, error: memberError } = await supabase
        .from("gym_members")
        .select("id")
        .eq("gym_id", gym.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (memberError) throw memberError;
      if (!member) return { remaining: null, unlimited: false };

      // Get active membership credits
      const { data: membership, error } = await supabase
        .from("gym_memberships")
        .select(`
          credits_remaining,
          plan:membership_plans(unlimited_classes, class_credits)
        `)
        .eq("member_id", member.id)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;
      
      if (!membership) return { remaining: null, unlimited: false };

      const plan = membership.plan as { unlimited_classes: boolean; class_credits: number | null } | null;
      
      return {
        remaining: membership.credits_remaining,
        unlimited: plan?.unlimited_classes ?? false,
      };
    },
    enabled: !!gym?.id && !!user?.id,
  });
}
