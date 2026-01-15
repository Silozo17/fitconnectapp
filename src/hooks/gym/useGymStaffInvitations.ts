import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { toast } from "sonner";

export interface GymStaffInvitation {
  id: string;
  gym_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: string;
  status: string;
  assigned_location_ids: string[] | null;
  disciplines: string[] | null;
  invited_by: string | null;
  invited_by_name: string | null;
  created_at: string;
  expires_at: string | null;
  accepted_at: string | null;
}

export function useGymStaffInvitations() {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-staff-invitations", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return [];

      const { data, error } = await supabase
        .from("gym_staff_invitations")
        .select("*")
        .eq("gym_id", gym.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return (data || []) as GymStaffInvitation[];
    },
    enabled: !!gym?.id,
  });
}

export function useCancelStaffInvitation() {
  const queryClient = useQueryClient();
  const { gym } = useGym();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("gym_staff_invitations")
        .update({ status: "cancelled" })
        .eq("id", invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invitation cancelled");
      queryClient.invalidateQueries({ queryKey: ["gym-staff-invitations", gym?.id] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to cancel invitation");
    },
  });
}

export function useResendStaffInvitation() {
  const queryClient = useQueryClient();
  const { gym } = useGym();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase.functions.invoke("gym-send-staff-invite", {
        body: { invitationId },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invitation email resent");
      queryClient.invalidateQueries({ queryKey: ["gym-staff-invitations", gym?.id] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to resend invitation");
    },
  });
}
