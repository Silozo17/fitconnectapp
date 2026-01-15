-- Add location_access_type to membership_plans (replacing the frontend-only state)
ALTER TABLE public.membership_plans 
ADD COLUMN IF NOT EXISTS location_access_type text DEFAULT 'all' CHECK (location_access_type IN ('all', 'single'));

-- Add location_id to gym_memberships (member's chosen single location)
ALTER TABLE public.gym_memberships 
ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.gym_locations(id);

-- Add transfer tracking to gym_memberships
ALTER TABLE public.gym_memberships 
ADD COLUMN IF NOT EXISTS transferred_from_id uuid REFERENCES public.gym_memberships(id),
ADD COLUMN IF NOT EXISTS transferred_at timestamptz;

-- Create transfer requests table for approval workflow
CREATE TABLE IF NOT EXISTS public.gym_membership_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id uuid NOT NULL REFERENCES public.gym_memberships(id),
  gym_id uuid NOT NULL REFERENCES public.gym_profiles(id),
  from_location_id uuid NOT NULL REFERENCES public.gym_locations(id),
  to_location_id uuid NOT NULL REFERENCES public.gym_locations(id),
  requested_by uuid NOT NULL REFERENCES auth.users(id),
  requested_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  rejection_reason text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gym_membership_transfers ENABLE ROW LEVEL SECURITY;

-- RLS policies for gym_membership_transfers (using user_id not owner_id)
CREATE POLICY "Gym staff can view transfers for their gym"
  ON public.gym_membership_transfers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.user_id = auth.uid()
      AND gs.gym_id = gym_membership_transfers.gym_id
      AND gs.status = 'active'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.gym_profiles gp
      WHERE gp.id = gym_membership_transfers.gym_id
      AND gp.user_id = auth.uid()
    )
  );

CREATE POLICY "Managers and owners can create transfers"
  ON public.gym_membership_transfers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.user_id = auth.uid()
      AND gs.gym_id = gym_membership_transfers.gym_id
      AND gs.role IN ('manager', 'owner')
      AND gs.status = 'active'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.gym_profiles gp
      WHERE gp.id = gym_membership_transfers.gym_id
      AND gp.user_id = auth.uid()
    )
  );

CREATE POLICY "Managers and owners can update transfers"
  ON public.gym_membership_transfers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.user_id = auth.uid()
      AND gs.gym_id = gym_membership_transfers.gym_id
      AND gs.role IN ('manager', 'owner')
      AND gs.status = 'active'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.gym_profiles gp
      WHERE gp.id = gym_membership_transfers.gym_id
      AND gp.user_id = auth.uid()
    )
  );

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_gym_membership_transfers_gym_id ON public.gym_membership_transfers(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_membership_transfers_status ON public.gym_membership_transfers(status);
CREATE INDEX IF NOT EXISTS idx_gym_membership_transfers_to_location ON public.gym_membership_transfers(to_location_id, status);