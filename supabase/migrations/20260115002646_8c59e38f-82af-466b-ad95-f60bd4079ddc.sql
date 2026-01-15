-- Phase 1: Security Helper Functions and RLS Policy Fixes
-- Create helper function to check if user is staff member of a gym
CREATE OR REPLACE FUNCTION public.is_gym_staff(check_gym_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.gym_staff
    WHERE gym_id = check_gym_id
      AND user_id = auth.uid()
      AND status = 'active'
  )
$$;

-- Create helper function to check if user is gym owner
CREATE OR REPLACE FUNCTION public.is_gym_owner(check_gym_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.gym_profiles
    WHERE id = check_gym_id
      AND user_id = auth.uid()
  )
$$;

-- Create helper function to check if user is member of a gym
CREATE OR REPLACE FUNCTION public.is_gym_member(check_gym_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.gym_members
    WHERE gym_id = check_gym_id
      AND user_id = auth.uid()
      AND status = 'active'
  )
$$;

-- Create helper function to get staff member's gym_id
CREATE OR REPLACE FUNCTION public.get_staff_gym_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gym_id FROM public.gym_staff
  WHERE user_id = auth.uid()
    AND status = 'active'
  LIMIT 1
$$;