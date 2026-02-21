import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CommunityInvitation {
  id: string;
  community_id: string;
  coach_id: string;
  invite_code: string;
  email: string | null;
  is_free_access: boolean;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  created_at: string;
}

const generateInviteCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

export const useCommunityInvitations = (communityId: string | undefined) => {
  return useQuery({
    queryKey: ["community-invitations", communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_invitations")
        .select("*")
        .eq("community_id", communityId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CommunityInvitation[];
    },
    enabled: !!communityId,
  });
};

export const useCreateInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      community_id: string;
      coach_id: string;
      email?: string;
      is_free_access?: boolean;
      max_uses?: number | null;
      expires_at?: string | null;
    }) => {
      const invite_code = generateInviteCode();
      const { data: inv, error } = await supabase
        .from("community_invitations")
        .insert({ ...data, invite_code })
        .select()
        .single();
      if (error) throw error;
      return inv as CommunityInvitation;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["community-invitations", v.community_id] });
    },
  });
};

export const useDeleteInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, communityId }: { id: string; communityId: string }) => {
      const { error } = await supabase.from("community_invitations").delete().eq("id", id);
      if (error) throw error;
      return communityId;
    },
    onSuccess: (communityId) => {
      qc.invalidateQueries({ queryKey: ["community-invitations", communityId] });
    },
  });
};

export const useRedeemInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (inviteCode: string) => {
      // Look up the invitation
      const { data: invite, error: fetchErr } = await supabase
        .from("community_invitations")
        .select("*")
        .eq("invite_code", inviteCode)
        .single();
      if (fetchErr || !invite) throw new Error("Invalid invite code");

      // Validate
      if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        throw new Error("Invite expired");
      }
      if (invite.max_uses && invite.uses_count >= invite.max_uses) {
        throw new Error("Invite has reached maximum uses");
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if already a member
      const { data: existing } = await supabase
        .from("community_members")
        .select("id")
        .eq("community_id", invite.community_id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        return { communityId: invite.community_id, alreadyMember: true };
      }

      // Join community
      const { error: joinErr } = await supabase.from("community_members").insert({
        community_id: invite.community_id,
        user_id: user.id,
        role: "member",
      });
      if (joinErr) throw joinErr;

      // Increment uses_count
      await supabase
        .from("community_invitations")
        .update({ uses_count: invite.uses_count + 1 })
        .eq("id", invite.id);

      return { communityId: invite.community_id, alreadyMember: false };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["communities"] });
      qc.invalidateQueries({ queryKey: ["community-members"] });
    },
  });
};
