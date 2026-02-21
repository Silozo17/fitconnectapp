import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCoachProfileId } from "@/hooks/useCoachProfileId";

export interface Community {
  id: string;
  coach_id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  is_public: boolean;
  member_count: number;
  access_type: "free" | "paid" | "subscription";
  price: number | null;
  monthly_price: number | null;
  currency: string;
  trial_days: number;
  discount_code: string | null;
  discount_percent: number | null;
  max_members: number | null;
  created_at: string;
  updated_at: string;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: "admin" | "moderator" | "member";
  joined_at: string;
}

export interface CommunityPost {
  id: string;
  community_id: string;
  author_id: string;
  content: string;
  image_urls: string[] | null;
  embed_url: string | null;
  is_pinned: boolean;
  is_announcement: boolean;
  post_type: "text" | "poll" | "event" | "file" | "video";
  poll_data: any | null;
  event_data: any | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  author_name?: string;
  author_avatar?: string;
  user_has_liked?: boolean;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_comment_id: string | null;
  likes_count: number;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
}

// ===== Communities CRUD =====

export const useCoachCommunities = () => {
  const { data: coachProfileId } = useCoachProfileId();

  return useQuery({
    queryKey: ["communities", "coach", coachProfileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("coach_id", coachProfileId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Community[];
    },
    enabled: !!coachProfileId,
  });
};

export const useClientCommunities = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["communities", "client", user?.id],
    queryFn: async () => {
      // Get communities user is a member of
      const { data: memberships, error: mErr } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", user!.id);
      if (mErr) throw mErr;

      if (!memberships?.length) return [];

      const communityIds = memberships.map((m: any) => m.community_id);
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .in("id", communityIds)
        .eq("is_active", true)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Community[];
    },
    enabled: !!user,
  });
};

export const useDiscoverCommunities = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["communities", "discover", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("is_active", true)
        .eq("is_public", true)
        .order("member_count", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as Community[];
    },
    enabled: !!user,
  });
};

export const useCreateCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { coach_id: string; name: string; description?: string; is_public?: boolean }) => {
      // Create community
      const { data: community, error } = await supabase
        .from("communities")
        .insert(data)
        .select()
        .single();
      if (error) throw error;

      // Auto-join as admin
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("community_members").insert({
          community_id: community.id,
          user_id: user.id,
          role: "admin",
        });
      }

      return community;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
  });
};

export const useUpdateCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Community> & { id: string }) => {
      const { data, error } = await supabase
        .from("communities")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
  });
};

export const useDeleteCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("communities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
  });
};

// ===== Posts =====

export const useCommunityPosts = (communityId: string | undefined) => {
  return useQuery({
    queryKey: ["community-posts", communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .eq("community_id", communityId!)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as CommunityPost[];
    },
    enabled: !!communityId,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      community_id: string;
      content: string;
      post_type?: string;
      poll_data?: any;
      event_data?: any;
      embed_url?: string;
      is_announcement?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: post, error } = await supabase
        .from("community_posts")
        .insert({ ...data, author_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return post;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["community-posts", variables.community_id] });
    },
  });
};

export const useTogglePin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isPinned, communityId }: { postId: string; isPinned: boolean; communityId: string }) => {
      const { error } = await supabase
        .from("community_posts")
        .update({ is_pinned: !isPinned })
        .eq("id", postId);
      if (error) throw error;
      return communityId;
    },
    onSuccess: (communityId) => {
      queryClient.invalidateQueries({ queryKey: ["community-posts", communityId] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, communityId }: { postId: string; communityId: string }) => {
      const { error } = await supabase.from("community_posts").delete().eq("id", postId);
      if (error) throw error;
      return communityId;
    },
    onSuccess: (communityId) => {
      queryClient.invalidateQueries({ queryKey: ["community-posts", communityId] });
    },
  });
};

// ===== Comments =====

export const useCommunityComments = (postId: string | undefined) => {
  return useQuery({
    queryKey: ["community-comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_comments")
        .select("*")
        .eq("post_id", postId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as CommunityComment[];
    },
    enabled: !!postId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { post_id: string; content: string; parent_comment_id?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: comment, error } = await supabase
        .from("community_comments")
        .insert({ ...data, author_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return comment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["community-comments", variables.post_id] });
    },
  });
};

// ===== Reactions =====

export const useToggleReaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, commentId }: { postId?: string; commentId?: string }) => {
      if (!user) throw new Error("Not authenticated");

      // Check if reaction exists
      let query = supabase.from("community_reactions").select("id").eq("user_id", user.id);
      if (postId) query = query.eq("post_id", postId);
      if (commentId) query = query.eq("comment_id", commentId);

      const { data: existing } = await query.maybeSingle();

      if (existing) {
        await supabase.from("community_reactions").delete().eq("id", existing.id);
      } else {
        await supabase.from("community_reactions").insert({
          user_id: user.id,
          post_id: postId || null,
          comment_id: commentId || null,
        });
      }

      return { postId, commentId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });
};

// ===== Members =====

export const useCommunityMembers = (communityId: string | undefined) => {
  return useQuery({
    queryKey: ["community-members", communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_members")
        .select("*")
        .eq("community_id", communityId!)
        .order("joined_at", { ascending: true });
      if (error) throw error;
      return data as CommunityMember[];
    },
    enabled: !!communityId,
  });
};

export const useJoinCommunity = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (communityId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("community_members").insert({
        community_id: communityId,
        user_id: user.id,
        role: "member",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.invalidateQueries({ queryKey: ["community-members"] });
    },
  });
};

export const useLeaveCommunity = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (communityId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.invalidateQueries({ queryKey: ["community-members"] });
    },
  });
};

// ===== Poll Votes =====

export const usePollVotes = (postId: string | undefined) => {
  return useQuery({
    queryKey: ["poll-votes", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_poll_votes")
        .select("*")
        .eq("post_id", postId!);
      if (error) throw error;
      return data;
    },
    enabled: !!postId,
  });
};

export const useVoteOnPoll = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, optionIndex }: { postId: string; optionIndex: number }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("community_poll_votes").insert({
        post_id: postId,
        user_id: user.id,
        option_index: optionIndex,
      });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["poll-votes", variables.postId] });
    },
  });
};
