import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { toast } from "sonner";

export interface GymRefundRequest {
  id: string;
  gym_id: string;
  location_id: string | null;
  member_id: string;
  membership_id: string | null;
  requested_by: string;
  approved_by: string | null;
  request_type: 'refund' | 'early_cancel' | 'freeze' | 'fee_waiver';
  reason: string;
  reason_category: 'relocation' | 'injury' | 'financial' | 'other';
  proof_url: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  processed_at: string | null;
  // Joined data
  member?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  requested_by_staff?: {
    id: string;
    display_name: string;
  };
}

interface UseGymRefundRequestsOptions {
  status?: string;
  limit?: number;
}

export function useGymRefundRequests(options: UseGymRefundRequestsOptions = {}) {
  const { gym } = useGym();
  const { status, limit = 50 } = options;

  return useQuery({
    queryKey: ["gym-refund-requests", gym?.id, status, limit],
    queryFn: async () => {
      if (!gym?.id) return [];

      let query = supabase
        .from("gym_refund_requests")
        .select(`
          *,
          member:gym_members(id, first_name, last_name),
          requested_by_staff:gym_staff!gym_refund_requests_requested_by_fkey(id, display_name)
        `)
        .eq("gym_id", gym.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as GymRefundRequest[];
    },
    enabled: !!gym?.id,
  });
}

export function usePendingRefundRequestsCount() {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-refund-requests-pending-count", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return 0;

      const { count, error } = await supabase
        .from("gym_refund_requests")
        .select("id", { count: "exact", head: true })
        .eq("gym_id", gym.id)
        .eq("status", "pending");

      if (error) throw error;
      return count || 0;
    },
    enabled: !!gym?.id,
  });
}

export function useCreateRefundRequest() {
  const queryClient = useQueryClient();
  const { gym, staffRecord } = useGym();

  return useMutation({
    mutationFn: async (data: {
      member_id: string;
      membership_id?: string;
      request_type: 'refund' | 'early_cancel' | 'freeze' | 'fee_waiver';
      reason: string;
      reason_category: 'relocation' | 'injury' | 'financial' | 'other';
      proof_url?: string;
      amount?: number;
      location_id?: string;
    }) => {
      if (!gym?.id || !staffRecord?.id) throw new Error("Not authenticated");

      const { data: request, error } = await supabase
        .from("gym_refund_requests")
        .insert({
          gym_id: gym.id,
          requested_by: staffRecord.id,
          currency: gym.currency || 'GBP',
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-refund-requests"] });
      toast.success("Refund request submitted for approval");
    },
    onError: (error) => {
      toast.error("Failed to submit request: " + error.message);
    },
  });
}

export function useApproveRefundRequest() {
  const queryClient = useQueryClient();
  const { staffRecord } = useGym();

  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!staffRecord?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("gym_refund_requests")
        .update({
          status: "approved",
          approved_by: staffRecord.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-refund-requests"] });
      toast.success("Request approved");
    },
  });
}

export function useRejectRefundRequest() {
  const queryClient = useQueryClient();
  const { staffRecord } = useGym();

  return useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      if (!staffRecord?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("gym_refund_requests")
        .update({
          status: "rejected",
          approved_by: staffRecord.id,
          rejection_reason: reason,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-refund-requests"] });
      toast.success("Request rejected");
    },
  });
}
