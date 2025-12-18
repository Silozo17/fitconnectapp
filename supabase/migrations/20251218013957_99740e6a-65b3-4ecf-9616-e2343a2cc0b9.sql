-- Fix orphaned user without role
DO $$
DECLARE
  orphaned_user_id uuid;
BEGIN
  -- Find users with admin_profiles but no role
  FOR orphaned_user_id IN 
    SELECT ap.user_id 
    FROM admin_profiles ap
    LEFT JOIN user_roles ur ON ap.user_id = ur.user_id
    WHERE ur.id IS NULL
  LOOP
    INSERT INTO user_roles (user_id, role)
    VALUES (orphaned_user_id, 'staff')
    ON CONFLICT (user_id, role) DO NOTHING;
    RAISE NOTICE 'Added staff role for user %', orphaned_user_id;
  END LOOP;
END $$;

-- Clean up orphaned messages where sender or receiver profiles no longer exist
DELETE FROM messages m
WHERE NOT EXISTS (
  SELECT 1 FROM client_profiles cp WHERE cp.id = m.sender_id
  UNION ALL
  SELECT 1 FROM coach_profiles cop WHERE cop.id = m.sender_id
  UNION ALL
  SELECT 1 FROM admin_profiles ap WHERE ap.id = m.sender_id
)
OR NOT EXISTS (
  SELECT 1 FROM client_profiles cp WHERE cp.id = m.receiver_id
  UNION ALL
  SELECT 1 FROM coach_profiles cop WHERE cop.id = m.receiver_id
  UNION ALL
  SELECT 1 FROM admin_profiles ap WHERE ap.id = m.receiver_id
);

-- Create trigger function to auto-assign default role on user creation
CREATE OR REPLACE FUNCTION public.assign_default_role_on_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.user_id) THEN
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
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers on profile tables
DROP TRIGGER IF EXISTS assign_role_on_admin_profile ON admin_profiles;
DROP TRIGGER IF EXISTS assign_role_on_coach_profile ON coach_profiles;
DROP TRIGGER IF EXISTS assign_role_on_client_profile ON client_profiles;

CREATE TRIGGER assign_role_on_admin_profile
  AFTER INSERT ON admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_role_on_profile();

CREATE TRIGGER assign_role_on_coach_profile
  AFTER INSERT ON coach_profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_role_on_profile();

CREATE TRIGGER assign_role_on_client_profile
  AFTER INSERT ON client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_role_on_profile();