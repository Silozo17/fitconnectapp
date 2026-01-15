-- Fix RLS policies for gym_staff_invitations to include gym owners
-- Currently only checks gym_staff, but owners are in gym_profiles

-- Drop existing policies
DROP POLICY IF EXISTS "Gym staff can create invitations" ON public.gym_staff_invitations;
DROP POLICY IF EXISTS "Gym staff can view invitations" ON public.gym_staff_invitations;
DROP POLICY IF EXISTS "Gym staff can update invitations" ON public.gym_staff_invitations;

-- Create updated policies that include gym owners
CREATE POLICY "Gym staff and owners can view invitations" ON public.gym_staff_invitations
  FOR SELECT TO authenticated
  USING (
    gym_id IN (
      SELECT gym_id FROM gym_staff WHERE user_id = auth.uid() AND status = 'active'
    )
    OR
    gym_id IN (
      SELECT id FROM gym_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Gym staff and owners can create invitations" ON public.gym_staff_invitations
  FOR INSERT TO authenticated
  WITH CHECK (
    gym_id IN (
      SELECT gym_id FROM gym_staff WHERE user_id = auth.uid() AND status = 'active'
    )
    OR
    gym_id IN (
      SELECT id FROM gym_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Gym staff and owners can update invitations" ON public.gym_staff_invitations
  FOR UPDATE TO authenticated
  USING (
    gym_id IN (
      SELECT gym_id FROM gym_staff WHERE user_id = auth.uid() AND status = 'active'
    )
    OR
    gym_id IN (
      SELECT id FROM gym_profiles WHERE user_id = auth.uid()
    )
  );