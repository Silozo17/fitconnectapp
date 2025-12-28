-- Update handle_new_user to create all 3 profiles for team members
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    -- For team members, create ALL 3 profiles so they can switch views
    -- Admin profile (primary)
    INSERT INTO public.admin_profiles (user_id, username, first_name, last_name, display_name, user_profile_id)
    VALUES (new.id, v_username, v_first_name, v_last_name, v_display_name, v_user_profile_id);
    
    -- Client profile (with onboarding NOT completed - they must go through it)
    INSERT INTO public.client_profiles (user_id, username, first_name, last_name, user_profile_id, onboarding_completed)
    VALUES (new.id, v_username, COALESCE(v_first_name, v_display_name), v_last_name, v_user_profile_id, false);
    
    -- Coach profile (with onboarding NOT completed - they must go through it)
    INSERT INTO public.coach_profiles (user_id, username, display_name, user_profile_id, onboarding_completed)
    VALUES (new.id, v_username, v_display_name, v_user_profile_id, false);
    
    -- Add client and coach roles so they can access those views
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'client');
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'coach');
  END IF;
  
  RETURN new;
END;
$function$;

-- Fix existing team members: Add missing client and coach profiles
-- First, create missing client_profiles for team members
INSERT INTO client_profiles (user_id, username, first_name, last_name, user_profile_id, onboarding_completed)
SELECT 
  ap.user_id, 
  ap.username, 
  COALESCE(ap.first_name, ap.display_name, 'Team Member'), 
  ap.last_name, 
  ap.user_profile_id, 
  false
FROM admin_profiles ap
WHERE NOT EXISTS (
  SELECT 1 FROM client_profiles cp WHERE cp.user_id = ap.user_id
)
ON CONFLICT (user_id) DO NOTHING;

-- Create missing coach_profiles for team members
INSERT INTO coach_profiles (user_id, username, display_name, user_profile_id, onboarding_completed)
SELECT 
  ap.user_id, 
  ap.username, 
  COALESCE(ap.display_name, ap.first_name, 'Team Member'), 
  ap.user_profile_id, 
  false
FROM admin_profiles ap
WHERE NOT EXISTS (
  SELECT 1 FROM coach_profiles co WHERE co.user_id = ap.user_id
)
ON CONFLICT (user_id) DO NOTHING;

-- Add missing client roles for team members
INSERT INTO user_roles (user_id, role)
SELECT ap.user_id, 'client'::app_role
FROM admin_profiles ap
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = ap.user_id AND ur.role = 'client'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Add missing coach roles for team members
INSERT INTO user_roles (user_id, role)
SELECT ap.user_id, 'coach'::app_role
FROM admin_profiles ap
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = ap.user_id AND ur.role = 'coach'
)
ON CONFLICT (user_id, role) DO NOTHING;