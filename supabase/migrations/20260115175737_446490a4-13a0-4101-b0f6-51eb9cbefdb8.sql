-- Create gym_staff_invitations table for proper invitation tracking
CREATE TABLE public.gym_staff_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT NOT NULL,
  assigned_location_ids UUID[] DEFAULT '{}',
  disciplines TEXT[] DEFAULT '{}',
  invited_by UUID REFERENCES auth.users(id),
  invited_by_name TEXT,
  invite_token UUID DEFAULT gen_random_uuid() UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  
  CONSTRAINT unique_pending_invite UNIQUE (gym_id, email, status)
);

-- Create index for faster lookups
CREATE INDEX idx_gym_staff_invitations_gym_id ON public.gym_staff_invitations(gym_id);
CREATE INDEX idx_gym_staff_invitations_email ON public.gym_staff_invitations(email);
CREATE INDEX idx_gym_staff_invitations_token ON public.gym_staff_invitations(invite_token);
CREATE INDEX idx_gym_staff_invitations_status ON public.gym_staff_invitations(status) WHERE status = 'pending';

-- Enable RLS
ALTER TABLE public.gym_staff_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Gym staff can view invitations for their gym
CREATE POLICY "Gym staff can view invitations"
  ON public.gym_staff_invitations
  FOR SELECT
  TO authenticated
  USING (gym_id IN (
    SELECT gym_id FROM public.gym_staff WHERE user_id = auth.uid() AND status = 'active'
  ));

-- Policy: Gym staff can create invitations for their gym  
CREATE POLICY "Gym staff can create invitations"
  ON public.gym_staff_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (gym_id IN (
    SELECT gym_id FROM public.gym_staff WHERE user_id = auth.uid() AND status = 'active'
  ));

-- Policy: Gym staff can update invitations for their gym (e.g., cancel)
CREATE POLICY "Gym staff can update invitations"
  ON public.gym_staff_invitations
  FOR UPDATE
  TO authenticated
  USING (gym_id IN (
    SELECT gym_id FROM public.gym_staff WHERE user_id = auth.uid() AND status = 'active'
  ));

-- Policy: Allow public read by invite token (for accepting invitations)
CREATE POLICY "Anyone can view invitation by token"
  ON public.gym_staff_invitations
  FOR SELECT
  TO anon, authenticated
  USING (invite_token IS NOT NULL);