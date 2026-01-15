import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { toast } from "sonner";

export interface MemberTransfer {
  id: string;
  membership_id: string;
  gym_id: string;
  from_location_id: string;
  to_location_id: string;
  requested_by: string;
  requested_at: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  notes: string | null;
  created_at: string;
  // Joined data
  from_location?: { name: string };
  to_location?: { name: string };
  membership?: {
    id: string;
    member?: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      email: string | null;
    };
  };
}

export function useMemberTransfers(locationId?: string | null) {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["member-transfers", gym?.id, locationId],
    queryFn: async () => {
      if (!gym?.id) return [];

      let query = supabase
        .from("gym_membership_transfers")
        .select(`
          *,
          from_location:gym_locations!from_location_id(name),
          to_location:gym_locations!to_location_id(name),
          membership:gym_memberships!membership_id(
            id,
            member:gym_members!member_id(
              id,
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq("gym_id", gym.id)
        .order("created_at", { ascending: false });

      // Filter by location if specified (show transfers TO this location)
      if (locationId) {
        query = query.eq("to_location_id", locationId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MemberTransfer[];
    },
    enabled: !!gym?.id,
  });
}

export function usePendingTransfersCount(locationId?: string | null) {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["pending-transfers-count", gym?.id, locationId],
    queryFn: async () => {
      if (!gym?.id) return 0;

      let query = supabase
        .from("gym_membership_transfers")
        .select("id", { count: "exact", head: true })
        .eq("gym_id", gym.id)
        .eq("status", "pending");

      if (locationId) {
        query = query.eq("to_location_id", locationId);
      }

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
    enabled: !!gym?.id,
  });
}

export function useCreateTransferRequest() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      membershipId,
      fromLocationId,
      toLocationId,
      notes,
    }: {
      membershipId: string;
      fromLocationId: string;
      toLocationId: string;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      if (!gym?.id) throw new Error("No gym selected");

      const { data, error } = await supabase
        .from("gym_membership_transfers")
        .insert({
          membership_id: membershipId,
          gym_id: gym.id,
          from_location_id: fromLocationId,
          to_location_id: toLocationId,
          requested_by: user.id,
          notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["pending-transfers-count"] });
      toast.success("Transfer request submitted for approval");
    },
    onError: (error) => {
      toast.error("Failed to create transfer request", {
        description: error.message,
      });
    },
  });
}

export function useReviewTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transferId,
      action,
      rejectionReason,
    }: {
      transferId: string;
      action: "approve" | "reject";
      rejectionReason?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (action === "approve") {
        // First, get the transfer details
        const { data: transfer, error: fetchError } = await supabase
          .from("gym_membership_transfers")
          .select("*, membership:gym_memberships!membership_id(*)")
          .eq("id", transferId)
          .single();

        if (fetchError) throw fetchError;

        // Update the membership's location
        const { error: updateError } = await supabase
          .from("gym_memberships")
          .update({
            location_id: transfer.to_location_id,
            transferred_from_id: transfer.membership_id,
            transferred_at: new Date().toISOString(),
          })
          .eq("id", transfer.membership_id);

        if (updateError) throw updateError;

        // Also update the member's home_location_id
        if (transfer.membership?.member_id) {
          await supabase
            .from("gym_members")
            .update({ home_location_id: transfer.to_location_id })
            .eq("id", transfer.membership.member_id);
        }
      }

      // Update the transfer status
      const { data, error } = await supabase
        .from("gym_membership_transfers")
        .update({
          status: action === "approve" ? "approved" : "rejected",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: action === "reject" ? rejectionReason : null,
        })
        .eq("id", transferId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["member-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["pending-transfers-count"] });
      queryClient.invalidateQueries({ queryKey: ["gym-members"] });
      queryClient.invalidateQueries({ queryKey: ["gym-memberships"] });
      
      toast.success(
        variables.action === "approve" 
          ? "Transfer approved - member moved to new location"
          : "Transfer rejected"
      );
    },
    onError: (error) => {
      toast.error("Failed to process transfer", {
        description: error.message,
      });
    },
  });
}
