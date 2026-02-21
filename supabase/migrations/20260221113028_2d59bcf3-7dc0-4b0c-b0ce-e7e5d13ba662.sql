
-- Part 1: Add embed_url to community_posts (if not already present from previous migration)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'community_posts' AND column_name = 'embed_url') THEN
    ALTER TABLE public.community_posts ADD COLUMN embed_url text;
  END IF;
END $$;

-- Part 2: Add event columns to coach_group_classes
ALTER TABLE public.coach_group_classes
  ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT 'class',
  ADD COLUMN IF NOT EXISTS event_format text NOT NULL DEFAULT 'in_person',
  ADD COLUMN IF NOT EXISTS online_link text,
  ADD COLUMN IF NOT EXISTS start_date timestamptz,
  ADD COLUMN IF NOT EXISTS end_date timestamptz,
  ADD COLUMN IF NOT EXISTS is_recurring boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS community_id uuid REFERENCES public.communities(id) ON DELETE SET NULL;

-- Part 3: Add pricing columns to communities (if not already present)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communities' AND column_name = 'access_type') THEN
    ALTER TABLE public.communities
      ADD COLUMN access_type text NOT NULL DEFAULT 'free',
      ADD COLUMN price numeric,
      ADD COLUMN monthly_price numeric,
      ADD COLUMN currency text NOT NULL DEFAULT 'GBP',
      ADD COLUMN trial_days integer NOT NULL DEFAULT 0,
      ADD COLUMN discount_code text,
      ADD COLUMN discount_percent integer,
      ADD COLUMN max_members integer;
  END IF;
END $$;

-- Part 4: Create community_subscriptions table if not exists
CREATE TABLE IF NOT EXISTS public.community_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  amount_paid numeric,
  currency text DEFAULT 'GBP',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  cancelled_at timestamptz,
  stripe_subscription_id text,
  stripe_checkout_session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS: Users can read their own subscriptions
CREATE POLICY "Users can view own community subscriptions"
  ON public.community_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- RLS: Community owner (coach) can view subscriptions for their communities
CREATE POLICY "Community owners can view subscriptions"
  ON public.community_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.communities c
      WHERE c.id = community_subscriptions.community_id
        AND c.coach_id IN (SELECT cp.id FROM public.coach_profiles cp WHERE cp.user_id = auth.uid())
    )
  );

-- RLS: Service role inserts (webhook), allow insert for authenticated users for free joins
CREATE POLICY "Authenticated users can insert community subscriptions"
  ON public.community_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
