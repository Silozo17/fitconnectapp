-- Create unified user_profiles table for shared identity
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  location TEXT,
  city TEXT,
  county TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT
USING (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (user_id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all user profiles"
ON public.user_profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Coaches can view their clients' profiles
CREATE POLICY "Coaches can view connected clients profiles"
ON public.user_profiles FOR SELECT
USING (
  user_id IN (
    SELECT cp.user_id FROM client_profiles cp
    JOIN coach_clients cc ON cc.client_id = cp.id
    JOIN coach_profiles cop ON cc.coach_id = cop.id
    WHERE cop.user_id = auth.uid()
  )
);

-- Public can view profiles for leaderboard users
CREATE POLICY "Public can view leaderboard user profiles"
ON public.user_profiles FOR SELECT
USING (
  user_id IN (
    SELECT user_id FROM client_profiles WHERE leaderboard_visible = true
  )
);

-- Add user_profile_id to role tables
ALTER TABLE public.client_profiles ADD COLUMN user_profile_id UUID REFERENCES public.user_profiles(id);
ALTER TABLE public.coach_profiles ADD COLUMN user_profile_id UUID REFERENCES public.user_profiles(id);
ALTER TABLE public.admin_profiles ADD COLUMN user_profile_id UUID REFERENCES public.user_profiles(id);

-- Migrate existing data to user_profiles
INSERT INTO public.user_profiles (user_id, username, display_name, first_name, last_name, avatar_url, location, city, county, country)
SELECT 
  cp.user_id,
  cp.username,
  COALESCE(cp.first_name || ' ' || cp.last_name, cp.first_name),
  cp.first_name,
  cp.last_name,
  cp.avatar_url,
  cp.location,
  cp.city,
  cp.county,
  cp.country
FROM client_profiles cp
ON CONFLICT (user_id) DO NOTHING;

-- Migrate coach profiles (update existing or insert new)
INSERT INTO public.user_profiles (user_id, username, display_name, first_name, last_name, avatar_url, location)
SELECT 
  cop.user_id,
  cop.username,
  cop.display_name,
  NULL,
  NULL,
  cop.profile_image_url,
  cop.location
FROM coach_profiles cop
ON CONFLICT (user_id) DO UPDATE SET
  display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name),
  avatar_url = COALESCE(EXCLUDED.avatar_url, user_profiles.avatar_url),
  location = COALESCE(EXCLUDED.location, user_profiles.location);

-- Migrate admin profiles
INSERT INTO public.user_profiles (user_id, username, display_name, first_name, last_name, avatar_url)
SELECT 
  ap.user_id,
  ap.username,
  ap.display_name,
  ap.first_name,
  ap.last_name,
  ap.avatar_url
FROM admin_profiles ap
ON CONFLICT (user_id) DO UPDATE SET
  display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name),
  first_name = COALESCE(EXCLUDED.first_name, user_profiles.first_name),
  last_name = COALESCE(EXCLUDED.last_name, user_profiles.last_name),
  avatar_url = COALESCE(EXCLUDED.avatar_url, user_profiles.avatar_url);

-- Update references in role tables
UPDATE client_profiles cp SET user_profile_id = up.id FROM user_profiles up WHERE cp.user_id = up.user_id;
UPDATE coach_profiles cop SET user_profile_id = up.id FROM user_profiles up WHERE cop.user_id = up.user_id;
UPDATE admin_profiles ap SET user_profile_id = up.id FROM user_profiles up WHERE ap.user_id = up.user_id;

-- Update is_username_available function to check only user_profiles
CREATE OR REPLACE FUNCTION public.is_username_available(check_username text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE username = check_username
  );
$$;

-- Update generate_unique_username to work with user_profiles
CREATE OR REPLACE FUNCTION public.generate_unique_username(base_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  candidate TEXT;
  suffix INT := 0;
  clean_name TEXT;
BEGIN
  clean_name := lower(regexp_replace(COALESCE(base_name, 'user'), '[^a-zA-Z0-9]', '', 'g'));
  
  IF length(clean_name) < 3 THEN
    clean_name := clean_name || 'user';
  END IF;
  
  IF length(clean_name) > 25 THEN
    clean_name := substring(clean_name, 1, 25);
  END IF;
  
  candidate := clean_name;
  
  IF is_username_available(candidate) THEN
    RETURN candidate;
  END IF;
  
  LOOP
    suffix := suffix + 1 + floor(random() * 99)::int;
    candidate := clean_name || suffix::text;
    
    IF suffix > 10000 THEN
      candidate := clean_name || floor(random() * 999999)::int::text;
    END IF;
    
    EXIT WHEN is_username_available(candidate);
  END LOOP;
  
  RETURN candidate;
END;
$$;

-- Update handle_new_user to create user_profile first
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role app_role;
  v_username TEXT;
  v_first_name TEXT;
  v_user_profile_id UUID;
BEGIN
  user_role := COALESCE(
    (new.raw_user_meta_data ->> 'role')::app_role,
    'client'::app_role
  );
  
  v_first_name := COALESCE(new.raw_user_meta_data ->> 'first_name', 'user');
  v_username := generate_unique_username(v_first_name);
  
  -- Create unified user profile first
  INSERT INTO public.user_profiles (user_id, username, first_name, display_name)
  VALUES (new.id, v_username, new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'first_name')
  RETURNING id INTO v_user_profile_id;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, user_role);
  
  IF user_role = 'client' THEN
    INSERT INTO public.client_profiles (user_id, username, first_name, user_profile_id)
    VALUES (new.id, v_username, new.raw_user_meta_data ->> 'first_name', v_user_profile_id);
  ELSIF user_role = 'coach' THEN
    INSERT INTO public.coach_profiles (user_id, username, display_name, user_profile_id)
    VALUES (new.id, v_username, new.raw_user_meta_data ->> 'first_name', v_user_profile_id);
  ELSIF user_role IN ('admin', 'manager', 'staff') THEN
    INSERT INTO public.admin_profiles (user_id, username, first_name, user_profile_id)
    VALUES (new.id, v_username, new.raw_user_meta_data ->> 'first_name', v_user_profile_id);
  END IF;
  
  RETURN new;
END;
$$;

-- Create trigger to update updated_at
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();