
-- Enable RLS on gym_automations (may have failed before due to function error)
ALTER TABLE public.gym_automations ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they exist
DROP POLICY IF EXISTS "Gym staff can view automations" ON public.gym_automations;
DROP POLICY IF EXISTS "Gym staff can create automations" ON public.gym_automations;
DROP POLICY IF EXISTS "Gym staff can update automations" ON public.gym_automations;
DROP POLICY IF EXISTS "Gym staff can delete automations" ON public.gym_automations;

CREATE POLICY "Gym staff can view automations"
ON public.gym_automations
FOR SELECT
TO authenticated
USING (public.is_gym_staff(gym_id, auth.uid()));

CREATE POLICY "Gym staff can create automations"
ON public.gym_automations
FOR INSERT
TO authenticated
WITH CHECK (public.is_gym_staff(gym_id, auth.uid()));

CREATE POLICY "Gym staff can update automations"
ON public.gym_automations
FOR UPDATE
TO authenticated
USING (public.is_gym_staff(gym_id, auth.uid()))
WITH CHECK (public.is_gym_staff(gym_id, auth.uid()));

CREATE POLICY "Gym staff can delete automations"
ON public.gym_automations
FOR DELETE
TO authenticated
USING (public.is_gym_staff(gym_id, auth.uid()));

-- Fix trigger functions search_path using ALTER
ALTER FUNCTION public.auto_generate_referral_code() SET search_path = public;
ALTER FUNCTION public.generate_gym_member_referral_code() SET search_path = public;
ALTER FUNCTION public.generate_referral_code() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
