-- Part 1: Update handle_new_user trigger to always set display_name from username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role app_role;
  v_username TEXT;
  v_first_name TEXT;
  v_last_name TEXT;
  v_display_name TEXT;
  v_user_profile_id UUID;
BEGIN
  user_role := COALESCE(
    (new.raw_user_meta_data ->> 'role')::app_role,
    'client'::app_role
  );
  
  v_first_name := NULLIF(TRIM(new.raw_user_meta_data ->> 'first_name'), '');
  v_last_name := NULLIF(TRIM(new.raw_user_meta_data ->> 'last_name'), '');
  
  -- Generate unique username from first_name or fallback to 'user'
  v_username := generate_unique_username(COALESCE(v_first_name, 'user'));
  
  -- Create display_name: use full name if provided, otherwise capitalize username
  IF v_first_name IS NOT NULL THEN
    v_display_name := TRIM(CONCAT(v_first_name, ' ', COALESCE(v_last_name, '')));
  ELSE
    -- Capitalize username as fallback (e.g., user47 -> User47)
    v_display_name := initcap(v_username);
  END IF;
  
  -- Create unified user profile with display_name always set
  INSERT INTO public.user_profiles (user_id, username, first_name, last_name, display_name)
  VALUES (new.id, v_username, v_first_name, v_last_name, v_display_name)
  RETURNING id INTO v_user_profile_id;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, user_role);
  
  IF user_role = 'client' THEN
    -- For clients, first_name is used for display, so ensure it's set
    INSERT INTO public.client_profiles (user_id, username, first_name, last_name, user_profile_id)
    VALUES (new.id, v_username, COALESCE(v_first_name, v_display_name), v_last_name, v_user_profile_id);
  ELSIF user_role = 'coach' THEN
    -- For coaches, display_name is used
    INSERT INTO public.coach_profiles (user_id, username, display_name, user_profile_id)
    VALUES (new.id, v_username, v_display_name, v_user_profile_id);
  ELSIF user_role IN ('admin', 'manager', 'staff') THEN
    INSERT INTO public.admin_profiles (user_id, username, first_name, last_name, display_name, user_profile_id)
    VALUES (new.id, v_username, v_first_name, v_last_name, v_display_name, v_user_profile_id);
  END IF;
  
  RETURN new;
END;
$$;

-- Part 2: Repair existing broken records

-- Fix user_profiles: Set display_name from username if missing
UPDATE user_profiles
SET display_name = initcap(username)
WHERE display_name IS NULL OR TRIM(display_name) = '';

-- Fix client_profiles: Set first_name from user_profiles username if missing
UPDATE client_profiles cp
SET first_name = (
  SELECT initcap(up.username)
  FROM user_profiles up
  WHERE up.user_id = cp.user_id
)
WHERE first_name IS NULL OR TRIM(first_name) = '';

-- Fix coach_profiles: Set display_name from user_profiles username if missing
UPDATE coach_profiles cp
SET display_name = (
  SELECT initcap(up.username)
  FROM user_profiles up
  WHERE up.user_id = cp.user_id
)
WHERE display_name IS NULL OR TRIM(display_name) = '';

-- Fix admin_profiles: Set display_name from user_profiles username if missing
UPDATE admin_profiles ap
SET display_name = (
  SELECT initcap(up.username)
  FROM user_profiles up
  WHERE up.user_id = ap.user_id
)
WHERE display_name IS NULL OR TRIM(display_name) = '';