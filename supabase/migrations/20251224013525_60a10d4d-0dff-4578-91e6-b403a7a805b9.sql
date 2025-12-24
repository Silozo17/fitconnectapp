-- Fix assign_default_role_on_profile trigger to always add role (supports multi-role)
-- Previously this only added a role if the user had NO roles, breaking client-to-coach upgrades

CREATE OR REPLACE FUNCTION public.assign_default_role_on_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Always add the role for the new profile (ON CONFLICT handles duplicates safely)
  IF TG_TABLE_NAME = 'admin_profiles' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'staff')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF TG_TABLE_NAME = 'coach_profiles' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'coach')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF TG_TABLE_NAME = 'client_profiles' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'client')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;