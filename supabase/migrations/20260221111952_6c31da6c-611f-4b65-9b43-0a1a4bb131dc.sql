
-- Part 1: Add embed_url to community_posts
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS embed_url text;

-- Part 2: Community Classroom tables

-- Modules (course sections)
CREATE TABLE public.community_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Lessons within modules
CREATE TABLE public.community_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.community_modules(id) ON DELETE CASCADE,
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content text,
  video_url text,
  file_urls text[],
  duration_minutes integer,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  is_free_preview boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Lesson progress tracking
CREATE TABLE public.community_lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.community_lessons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at timestamptz,
  last_watched_seconds integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(lesson_id, user_id)
);

-- Part 3: Community Pricing

-- Add pricing columns to communities
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS access_type text NOT NULL DEFAULT 'free';
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS price numeric;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS monthly_price numeric;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'GBP';
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS trial_days integer NOT NULL DEFAULT 0;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS discount_code text;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS discount_percent integer;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS max_members integer;

-- Community subscriptions
CREATE TABLE public.community_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  amount_paid numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'GBP',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  cancelled_at timestamptz,
  stripe_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- ===== RLS Policies =====

-- community_modules
ALTER TABLE public.community_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community members can view published modules"
ON public.community_modules FOR SELECT
USING (
  is_published = true AND EXISTS (
    SELECT 1 FROM public.community_members cm
    WHERE cm.community_id = community_modules.community_id AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Community admins can view all modules"
ON public.community_modules FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.community_members cm
    WHERE cm.community_id = community_modules.community_id AND cm.user_id = auth.uid() AND cm.role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Community admins can manage modules"
ON public.community_modules FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.community_members cm
    WHERE cm.community_id = community_modules.community_id AND cm.user_id = auth.uid() AND cm.role IN ('admin', 'moderator')
  )
);

-- community_lessons
ALTER TABLE public.community_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community members can view published lessons"
ON public.community_lessons FOR SELECT
USING (
  is_published = true AND (
    is_free_preview = true OR EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = community_lessons.community_id AND cm.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Community admins can view all lessons"
ON public.community_lessons FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.community_members cm
    WHERE cm.community_id = community_lessons.community_id AND cm.user_id = auth.uid() AND cm.role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Community admins can manage lessons"
ON public.community_lessons FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.community_members cm
    WHERE cm.community_id = community_lessons.community_id AND cm.user_id = auth.uid() AND cm.role IN ('admin', 'moderator')
  )
);

-- community_lesson_progress
ALTER TABLE public.community_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own progress"
ON public.community_lesson_progress FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own progress"
ON public.community_lesson_progress FOR INSERT
WITH CHECK (user_id = auth.uid());

-- community_subscriptions
ALTER TABLE public.community_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
ON public.community_subscriptions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Community coaches can view subscriptions"
ON public.community_subscriptions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.communities c
    JOIN public.coach_profiles cp ON c.coach_id = cp.id
    WHERE c.id = community_subscriptions.community_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own subscriptions"
ON public.community_subscriptions FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions"
ON public.community_subscriptions FOR UPDATE
USING (user_id = auth.uid());

-- Enable realtime for classroom
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_modules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_lessons;

-- Indexes for performance
CREATE INDEX idx_community_modules_community ON public.community_modules(community_id, display_order);
CREATE INDEX idx_community_lessons_module ON public.community_lessons(module_id, display_order);
CREATE INDEX idx_community_lessons_community ON public.community_lessons(community_id);
CREATE INDEX idx_community_lesson_progress_user ON public.community_lesson_progress(user_id);
CREATE INDEX idx_community_subscriptions_community ON public.community_subscriptions(community_id, status);
