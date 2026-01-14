import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { toast } from "sonner";

export interface FamilyMember {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  is_minor: boolean;
  date_of_birth: string | null;
  parent_member_id: string | null;
}

export function useFamilyMembers(parentMemberId: string | undefined) {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["family-members", parentMemberId],
    queryFn: async () => {
      if (!parentMemberId || !gym?.id) return [];

      const { data, error } = await supabase
        .from("gym_members")
        .select("id, first_name, last_name, email, is_minor, date_of_birth, parent_member_id")
        .eq("gym_id", gym.id)
        .eq("parent_member_id", parentMemberId);

      if (error) throw error;
      return data as FamilyMember[];
    },
    enabled: !!parentMemberId && !!gym?.id,
  });
}

export function useAddFamilyMember() {
  const queryClient = useQueryClient();
  const { gym } = useGym();

  return useMutation({
    mutationFn: async (data: {
      parent_member_id: string;
      first_name: string;
      last_name: string;
      email?: string;
      is_minor: boolean;
      date_of_birth?: string;
      emergency_contact_name?: string;
      emergency_contact_phone?: string;
    }) => {
      const { error } = await (supabase as any)
        .from("gym_members")
        .insert({
          gym_id: gym?.id,
          parent_member_id: data.parent_member_id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          is_minor: data.is_minor,
          date_of_birth: data.date_of_birth,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
          status: "active",
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["family-members", variables.parent_member_id] });
      queryClient.invalidateQueries({ queryKey: ["gym-members"] });
      toast.success("Family member added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add family member");
    },
  });
}
