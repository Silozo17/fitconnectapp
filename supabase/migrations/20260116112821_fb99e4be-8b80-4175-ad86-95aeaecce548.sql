-- Create function to auto-create owner staff record when gym is created
CREATE OR REPLACE FUNCTION create_gym_owner_staff_record()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create if user_id is not null (has an owner)
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO gym_staff (
      gym_id,
      user_id,
      email,
      display_name,
      role,
      status,
      multi_location_access
    )
    SELECT 
      NEW.id,
      NEW.user_id,
      COALESCE(u.email, ''),
      COALESCE(NEW.owner_name, u.email, 'Owner'),
      'owner'::gym_role,
      'active',
      true
    FROM auth.users u
    WHERE u.id = NEW.user_id
    ON CONFLICT (gym_id, user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on gym_profiles insert
DROP TRIGGER IF EXISTS on_gym_profile_created ON gym_profiles;
CREATE TRIGGER on_gym_profile_created
  AFTER INSERT ON gym_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_gym_owner_staff_record();

-- Backfill existing gyms that don't have owner staff records
INSERT INTO gym_staff (gym_id, user_id, email, display_name, role, status, multi_location_access)
SELECT 
  gp.id,
  gp.user_id,
  COALESCE(u.email, ''),
  COALESCE(gp.owner_name, u.email, 'Owner'),
  'owner'::gym_role,
  'active',
  true
FROM gym_profiles gp
JOIN auth.users u ON u.id = gp.user_id
WHERE gp.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM gym_staff gs 
    WHERE gs.gym_id = gp.id AND gs.user_id = gp.user_id
  );