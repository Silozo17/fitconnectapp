-- =============================================
-- Community Feature: Tables first, then policies
-- =============================================

-- 1. Communities
CREATE TABLE public.communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  cover_image_url text,
  is_active boolean DEFAULT true,
  is_public boolean DEFAULT true,
  member_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Community Members
CREATE TABLE public.community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- 3. Community Posts
CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  image_urls text[],
  is_pinned boolean DEFAULT false,
  is_announcement boolean DEFAULT false,
  post_type text DEFAULT 'text' CHECK (post_type IN ('text', 'poll', 'event', 'file')),
  poll_data jsonb,
  event_data jsonb,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Community Comments
CREATE TABLE public.community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  parent_comment_id uuid REFERENCES public.community_comments(id) ON DELETE CASCADE,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 5. Community Reactions
CREATE TABLE public.community_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES public.community_comments(id) ON DELETE CASCADE,
  reaction_type text DEFAULT 'like',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_post_reaction UNIQUE(user_id, post_id),
  CONSTRAINT unique_comment_reaction UNIQUE(user_id, comment_id),
  CONSTRAINT reaction_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- 6. Community Poll Votes
CREATE TABLE public.community_poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  option_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_poll_votes ENABLE ROW LEVEL SECURITY;

-- Helper function to check community membership (avoids infinite recursion)
CREATE OR REPLACE FUNCTION public.is_community_member(_user_id uuid, _community_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_members
    WHERE user_id = _user_id AND community_id = _community_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_community_admin(_user_id uuid, _community_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_members
    WHERE user_id = _user_id AND community_id = _community_id AND role IN ('admin', 'moderator')
  )
$$;

-- ===== RLS Policies =====

-- Communities
CREATE POLICY "View active public communities" ON public.communities FOR SELECT TO authenticated
  USING (is_active = true AND is_public = true);
CREATE POLICY "Members view their communities" ON public.communities FOR SELECT TO authenticated
  USING (public.is_community_member(auth.uid(), id));
CREATE POLICY "Coaches create communities" ON public.communities FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.coach_profiles cp WHERE cp.id = coach_id AND cp.user_id = auth.uid()));
CREATE POLICY "Coaches update own communities" ON public.communities FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.coach_profiles cp WHERE cp.id = coach_id AND cp.user_id = auth.uid()));
CREATE POLICY "Coaches delete own communities" ON public.communities FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.coach_profiles cp WHERE cp.id = coach_id AND cp.user_id = auth.uid()));

-- Community Members
CREATE POLICY "Members view members" ON public.community_members FOR SELECT TO authenticated
  USING (public.is_community_member(auth.uid(), community_id));
CREATE POLICY "Users join communities" ON public.community_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users leave communities" ON public.community_members FOR DELETE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Admins remove members" ON public.community_members FOR DELETE TO authenticated
  USING (public.is_community_admin(auth.uid(), community_id));
CREATE POLICY "Admins update roles" ON public.community_members FOR UPDATE TO authenticated
  USING (public.is_community_admin(auth.uid(), community_id));

-- Community Posts
CREATE POLICY "Members view posts" ON public.community_posts FOR SELECT TO authenticated
  USING (public.is_community_member(auth.uid(), community_id));
CREATE POLICY "Members create posts" ON public.community_posts FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND public.is_community_member(auth.uid(), community_id));
CREATE POLICY "Authors update own posts" ON public.community_posts FOR UPDATE TO authenticated
  USING (author_id = auth.uid());
CREATE POLICY "Admins update any post" ON public.community_posts FOR UPDATE TO authenticated
  USING (public.is_community_admin(auth.uid(), community_id));
CREATE POLICY "Authors delete own posts" ON public.community_posts FOR DELETE TO authenticated
  USING (author_id = auth.uid());
CREATE POLICY "Admins delete any post" ON public.community_posts FOR DELETE TO authenticated
  USING (public.is_community_admin(auth.uid(), community_id));

-- Community Comments (use post_id to check membership via join)
CREATE POLICY "Members view comments" ON public.community_comments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.community_posts cp
    WHERE cp.id = post_id AND public.is_community_member(auth.uid(), cp.community_id)
  ));
CREATE POLICY "Members create comments" ON public.community_comments FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.community_posts cp
    WHERE cp.id = post_id AND public.is_community_member(auth.uid(), cp.community_id)
  ));
CREATE POLICY "Authors delete own comments" ON public.community_comments FOR DELETE TO authenticated
  USING (author_id = auth.uid());

-- Community Reactions
CREATE POLICY "Anyone view reactions" ON public.community_reactions FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Users add reactions" ON public.community_reactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users remove own reactions" ON public.community_reactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Community Poll Votes
CREATE POLICY "Members view votes" ON public.community_poll_votes FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.community_posts cp
    WHERE cp.id = post_id AND public.is_community_member(auth.uid(), cp.community_id)
  ));
CREATE POLICY "Members vote" ON public.community_poll_votes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.community_posts cp
    WHERE cp.id = post_id AND public.is_community_member(auth.uid(), cp.community_id)
  ));

-- Indexes
CREATE INDEX idx_community_members_user ON public.community_members(user_id);
CREATE INDEX idx_community_members_community ON public.community_members(community_id);
CREATE INDEX idx_community_posts_community ON public.community_posts(community_id, created_at DESC);
CREATE INDEX idx_community_comments_post ON public.community_comments(post_id, created_at);
CREATE INDEX idx_community_reactions_post ON public.community_reactions(post_id);
CREATE INDEX idx_community_reactions_comment ON public.community_reactions(comment_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comments;

-- Triggers for updated_at
CREATE TRIGGER update_communities_updated_at
  BEFORE UPDATE ON public.communities FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();