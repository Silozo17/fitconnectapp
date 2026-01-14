import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { toast } from "sonner";

export interface GymMemberNote {
  id: string;
  gym_id: string;
  member_id: string;
  staff_id: string;
  category: string;
  content: string;
  created_at: string;
  staff?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function useGymMemberNotes(memberId: string | undefined) {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-member-notes", memberId],
    queryFn: async () => {
      if (!memberId || !gym?.id) return [];

      const { data, error } = await supabase
        .from("gym_member_notes")
        .select(`
          *,
          staff:gym_staff(display_name, avatar_url)
        `)
        .eq("member_id", memberId)
        .eq("gym_id", gym.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as GymMemberNote[];
    },
    enabled: !!memberId && !!gym?.id,
  });
}

export function useCreateMemberNote() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      memberId, 
      staffId, 
      content, 
      category = "general" 
    }: { 
      memberId: string; 
      staffId: string; 
      content: string; 
      category?: string;
    }) => {
      if (!gym?.id) throw new Error("No gym selected");

      const { data, error } = await supabase
        .from("gym_member_notes")
        .insert({
          gym_id: gym.id,
          member_id: memberId,
          staff_id: staffId,
          content,
          category,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { memberId }) => {
      queryClient.invalidateQueries({ queryKey: ["gym-member-notes", memberId] });
      toast.success("Note added successfully");
    },
    onError: (error) => {
      console.error("Failed to add note:", error);
      toast.error("Failed to add note");
    },
  });
}

export function useDeleteMemberNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, memberId }: { noteId: string; memberId: string }) => {
      const { error } = await supabase
        .from("gym_member_notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;
      return { memberId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["gym-member-notes", data.memberId] });
      toast.success("Note deleted");
    },
    onError: (error) => {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note");
    },
  });
}
