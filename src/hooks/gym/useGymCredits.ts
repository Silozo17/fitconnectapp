import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CreditTransaction {
  id: string;
  gym_id: string;
  member_id: string;
  amount: number;
  balance_after: number;
  transaction_type: string;
  reference_id: string | null;
  reference_type: string | null;
  notes: string | null;
  created_at: string;
}

interface CreditBalance {
  credits_remaining: number;
  unlimited_classes: boolean;
}

export function useGymCredits(gymId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const client = supabase as any;

  // Get member ID for current user
  const { data: memberData } = useQuery({
    queryKey: ["gym-member-for-credits", gymId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await client
        .from("gym_members")
        .select("id, credits_remaining, gym_membership_plans(unlimited_classes)")
        .eq("gym_id", gymId)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user && !!gymId,
  });

  const memberId = memberData?.id;

  // Get credit balance
  const balance: CreditBalance = {
    credits_remaining: memberData?.credits_remaining || 0,
    unlimited_classes: memberData?.gym_membership_plans?.unlimited_classes || false,
  };

  // Get credit transaction history
  const { data: transactions, isLoading: loadingTransactions } = useQuery({
    queryKey: ["gym-credit-transactions", gymId, memberId],
    queryFn: async () => {
      if (!memberId) return [];
      const { data, error } = await client
        .from("gym_credit_transactions")
        .select("*")
        .eq("member_id", memberId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as CreditTransaction[];
    },
    enabled: !!memberId,
  });

  // Check if member can book a class (has credits or unlimited)
  const canBookClass = (creditCost: number = 1): boolean => {
    if (balance.unlimited_classes) return true;
    return balance.credits_remaining >= creditCost;
  };

  // Deduct credits for a booking
  const deductCredits = useMutation({
    mutationFn: async ({
      amount,
      bookingId,
      notes,
    }: {
      amount: number;
      bookingId: string;
      notes?: string;
    }) => {
      if (!memberId) throw new Error("No member found");
      if (balance.unlimited_classes) {
        // No credit deduction needed for unlimited plans
        return { newBalance: balance.credits_remaining };
      }

      if (balance.credits_remaining < amount) {
        throw new Error("Insufficient credits");
      }

      const newBalance = balance.credits_remaining - amount;

      // Update member credits
      const { error: updateError } = await client
        .from("gym_members")
        .update({ credits_remaining: newBalance })
        .eq("id", memberId);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: txError } = await client
        .from("gym_credit_transactions")
        .insert({
          gym_id: gymId,
          member_id: memberId,
          amount: -amount,
          balance_after: newBalance,
          transaction_type: "booking",
          reference_id: bookingId,
          reference_type: "booking",
          notes: notes || "Class booking",
          created_by: user?.id,
        });

      if (txError) throw txError;

      return { newBalance };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-member-for-credits"] });
      queryClient.invalidateQueries({ queryKey: ["gym-credit-transactions"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to deduct credits");
    },
  });

  // Refund credits for a cancelled booking
  const refundCredits = useMutation({
    mutationFn: async ({
      amount,
      bookingId,
      notes,
    }: {
      amount: number;
      bookingId: string;
      notes?: string;
    }) => {
      if (!memberId) throw new Error("No member found");
      if (balance.unlimited_classes) {
        // No credit refund needed for unlimited plans
        return { newBalance: balance.credits_remaining };
      }

      const newBalance = balance.credits_remaining + amount;

      // Update member credits
      const { error: updateError } = await client
        .from("gym_members")
        .update({ credits_remaining: newBalance })
        .eq("id", memberId);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: txError } = await client
        .from("gym_credit_transactions")
        .insert({
          gym_id: gymId,
          member_id: memberId,
          amount: amount,
          balance_after: newBalance,
          transaction_type: "cancellation_refund",
          reference_id: bookingId,
          reference_type: "booking",
          notes: notes || "Booking cancellation refund",
          created_by: user?.id,
        });

      if (txError) throw txError;

      return { newBalance };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-member-for-credits"] });
      queryClient.invalidateQueries({ queryKey: ["gym-credit-transactions"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to refund credits");
    },
  });

  return {
    memberId,
    balance,
    transactions,
    loadingTransactions,
    canBookClass,
    deductCredits,
    refundCredits,
  };
}

// Hook for admin to manage member credits
export function useAdminGymCredits(gymId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const client = supabase as any;

  // Adjust credits for a member
  const adjustCredits = useMutation({
    mutationFn: async ({
      memberId,
      amount,
      notes,
    }: {
      memberId: string;
      amount: number;
      notes: string;
    }) => {
      // Get current balance
      const { data: member, error: memberError } = await client
        .from("gym_members")
        .select("credits_remaining")
        .eq("id", memberId)
        .single();

      if (memberError) throw memberError;

      const newBalance = (member.credits_remaining || 0) + amount;
      if (newBalance < 0) {
        throw new Error("Cannot have negative credits");
      }

      // Update member credits
      const { error: updateError } = await client
        .from("gym_members")
        .update({ credits_remaining: newBalance })
        .eq("id", memberId);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: txError } = await client
        .from("gym_credit_transactions")
        .insert({
          gym_id: gymId,
          member_id: memberId,
          amount: amount,
          balance_after: newBalance,
          transaction_type: "manual_adjustment",
          reference_type: "admin",
          notes: notes,
          created_by: user?.id,
        });

      if (txError) throw txError;

      return { newBalance };
    },
    onSuccess: () => {
      toast.success("Credits adjusted successfully");
      queryClient.invalidateQueries({ queryKey: ["gym-members"] });
      queryClient.invalidateQueries({ queryKey: ["gym-credit-transactions"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to adjust credits");
    },
  });

  // Get member credit history
  const getMemberCreditHistory = async (memberId: string) => {
    const { data, error } = await client
      .from("gym_credit_transactions")
      .select("*")
      .eq("member_id", memberId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as CreditTransaction[];
  };

  return {
    adjustCredits,
    getMemberCreditHistory,
  };
}
