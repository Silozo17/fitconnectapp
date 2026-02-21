
-- ============================
-- Community Invitations Table
-- ============================
CREATE TABLE public.community_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  coach_id uuid NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  invite_code text NOT NULL UNIQUE,
  email text,
  is_free_access boolean NOT NULL DEFAULT false,
  max_uses int,
  uses_count int NOT NULL DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_invitations ENABLE ROW LEVEL SECURITY;

-- Coach can manage their own invitations
CREATE POLICY "Coaches can manage own invitations"
  ON public.community_invitations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_profiles cp
      WHERE cp.id = community_invitations.coach_id AND cp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.coach_profiles cp
      WHERE cp.id = community_invitations.coach_id AND cp.user_id = auth.uid()
    )
  );

-- Anyone can read invites by code (for redemption)
CREATE POLICY "Anyone can read invite by code"
  ON public.community_invitations
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================
-- Community Linked Packages
-- ============================
CREATE TABLE public.community_linked_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES public.coach_packages(id) ON DELETE CASCADE,
  is_free_for_members boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(community_id, package_id)
);

ALTER TABLE public.community_linked_packages ENABLE ROW LEVEL SECURITY;

-- Coach can manage linked packages for own communities
CREATE POLICY "Coaches can manage linked packages"
  ON public.community_linked_packages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.communities c
      JOIN public.coach_profiles cp ON c.coach_id = cp.id
      WHERE c.id = community_linked_packages.community_id AND cp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.communities c
      JOIN public.coach_profiles cp ON c.coach_id = cp.id
      WHERE c.id = community_linked_packages.community_id AND cp.user_id = auth.uid()
    )
  );

-- Members can view linked packages
CREATE POLICY "Members can view linked packages"
  ON public.community_linked_packages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = community_linked_packages.community_id AND cm.user_id = auth.uid()
    )
  );

-- ============================
-- Community Linked Products
-- ============================
CREATE TABLE public.community_linked_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.digital_products(id) ON DELETE CASCADE,
  is_free_for_members boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(community_id, product_id)
);

ALTER TABLE public.community_linked_products ENABLE ROW LEVEL SECURITY;

-- Coach can manage linked products for own communities
CREATE POLICY "Coaches can manage linked products"
  ON public.community_linked_products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.communities c
      JOIN public.coach_profiles cp ON c.coach_id = cp.id
      WHERE c.id = community_linked_products.community_id AND cp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.communities c
      JOIN public.coach_profiles cp ON c.coach_id = cp.id
      WHERE c.id = community_linked_products.community_id AND cp.user_id = auth.uid()
    )
  );

-- Members can view linked products
CREATE POLICY "Members can view linked products"
  ON public.community_linked_products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = community_linked_products.community_id AND cm.user_id = auth.uid()
    )
  );

-- ============================
-- ALTER community_lessons
-- ============================
ALTER TABLE public.community_lessons
  ADD COLUMN IF NOT EXISTS preview_image_url text,
  ADD COLUMN IF NOT EXISTS embed_mode text NOT NULL DEFAULT 'restricted';

-- ============================
-- ALTER community_modules
-- ============================
ALTER TABLE public.community_modules
  ADD COLUMN IF NOT EXISTS preview_image_url text;
