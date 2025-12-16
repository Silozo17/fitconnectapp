-- Add username columns to all profile tables
ALTER TABLE public.client_profiles 
ADD COLUMN IF NOT EXISTS username TEXT;

ALTER TABLE public.coach_profiles 
ADD COLUMN IF NOT EXISTS username TEXT;

ALTER TABLE public.admin_profiles 
ADD COLUMN IF NOT EXISTS username TEXT;

-- Create function to check username availability across all profile tables
CREATE OR REPLACE FUNCTION public.is_username_available(check_username TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM client_profiles WHERE username = check_username
    UNION ALL
    SELECT 1 FROM coach_profiles WHERE username = check_username
    UNION ALL
    SELECT 1 FROM admin_profiles WHERE username = check_username
  );
$$;

-- Create function to generate unique username from base name
CREATE OR REPLACE FUNCTION public.generate_unique_username(base_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  candidate TEXT;
  suffix INT := 0;
  clean_name TEXT;
BEGIN
  -- Clean the base name (lowercase, alphanumeric only, min 3 chars)
  clean_name := lower(regexp_replace(COALESCE(base_name, 'user'), '[^a-zA-Z0-9]', '', 'g'));
  
  -- Ensure minimum length
  IF length(clean_name) < 3 THEN
    clean_name := clean_name || 'user';
  END IF;
  
  -- Truncate if too long (max 25 chars to leave room for numbers)
  IF length(clean_name) > 25 THEN
    clean_name := substring(clean_name, 1, 25);
  END IF;
  
  candidate := clean_name;
  
  -- Check if base username is available
  IF is_username_available(candidate) THEN
    RETURN candidate;
  END IF;
  
  -- Add random numbers until unique
  LOOP
    suffix := suffix + 1 + floor(random() * 99)::int;
    candidate := clean_name || suffix::text;
    
    -- Safety check to prevent infinite loop
    IF suffix > 10000 THEN
      candidate := clean_name || floor(random() * 999999)::int::text;
    END IF;
    
    EXIT WHEN is_username_available(candidate);
  END LOOP;
  
  RETURN candidate;
END;
$$;

-- Update handle_new_user to generate username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
  v_username TEXT;
  v_first_name TEXT;
BEGIN
  user_role := COALESCE(
    (new.raw_user_meta_data ->> 'role')::app_role,
    'client'::app_role
  );
  
  -- Get first name from metadata for username generation
  v_first_name := COALESCE(new.raw_user_meta_data ->> 'first_name', 'user');
  v_username := generate_unique_username(v_first_name);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, user_role);
  
  IF user_role = 'client' THEN
    INSERT INTO public.client_profiles (user_id, username, first_name)
    VALUES (new.id, v_username, new.raw_user_meta_data ->> 'first_name');
  ELSIF user_role = 'coach' THEN
    INSERT INTO public.coach_profiles (user_id, username, display_name)
    VALUES (new.id, v_username, new.raw_user_meta_data ->> 'first_name');
  ELSIF user_role IN ('admin', 'manager', 'staff') THEN
    INSERT INTO public.admin_profiles (user_id, username, first_name)
    VALUES (new.id, v_username, new.raw_user_meta_data ->> 'first_name');
  END IF;
  
  RETURN new;
END;
$$;

-- Create unique indexes on username columns
CREATE UNIQUE INDEX IF NOT EXISTS client_profiles_username_unique ON public.client_profiles(username) WHERE username IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS coach_profiles_username_unique ON public.coach_profiles(username) WHERE username IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS admin_profiles_username_unique ON public.admin_profiles(username) WHERE username IS NOT NULL;

-- Create user_connections table for friend connections
CREATE TABLE IF NOT EXISTS public.user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id UUID NOT NULL,
  requester_profile_type TEXT NOT NULL CHECK (requester_profile_type IN ('client', 'coach', 'admin')),
  addressee_user_id UUID NOT NULL,
  addressee_profile_type TEXT NOT NULL CHECK (addressee_profile_type IN ('client', 'coach', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  UNIQUE(requester_user_id, addressee_user_id)
);

-- Enable RLS on user_connections
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_connections
CREATE POLICY "Users can view their own connections"
ON public.user_connections
FOR SELECT
USING (requester_user_id = auth.uid() OR addressee_user_id = auth.uid());

CREATE POLICY "Users can create connection requests"
ON public.user_connections
FOR INSERT
WITH CHECK (requester_user_id = auth.uid());

CREATE POLICY "Addressee can update connection status"
ON public.user_connections
FOR UPDATE
USING (addressee_user_id = auth.uid());

CREATE POLICY "Users can delete their own requests"
ON public.user_connections
FOR DELETE
USING (requester_user_id = auth.uid() AND status = 'pending');

-- Create notification functions for connections
CREATE OR REPLACE FUNCTION public.notify_user_connection_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_name TEXT;
BEGIN
  -- Get requester name based on profile type
  IF NEW.requester_profile_type = 'client' THEN
    SELECT COALESCE(first_name, 'Someone') INTO requester_name FROM client_profiles WHERE user_id = NEW.requester_user_id;
  ELSIF NEW.requester_profile_type = 'coach' THEN
    SELECT COALESCE(display_name, 'Someone') INTO requester_name FROM coach_profiles WHERE user_id = NEW.requester_user_id;
  ELSE
    SELECT COALESCE(first_name, display_name, 'Someone') INTO requester_name FROM admin_profiles WHERE user_id = NEW.requester_user_id;
  END IF;
  
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.addressee_user_id,
    'connection_request',
    'New Friend Request',
    requester_name || ' wants to connect with you.',
    jsonb_build_object('connection_id', NEW.id::text, 'requester_user_id', NEW.requester_user_id::text)
  );
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_connection_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  accepter_name TEXT;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Get accepter name based on profile type
    IF NEW.addressee_profile_type = 'client' THEN
      SELECT COALESCE(first_name, 'Someone') INTO accepter_name FROM client_profiles WHERE user_id = NEW.addressee_user_id;
    ELSIF NEW.addressee_profile_type = 'coach' THEN
      SELECT COALESCE(display_name, 'Someone') INTO accepter_name FROM coach_profiles WHERE user_id = NEW.addressee_user_id;
    ELSE
      SELECT COALESCE(first_name, display_name, 'Someone') INTO accepter_name FROM admin_profiles WHERE user_id = NEW.addressee_user_id;
    END IF;
    
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.requester_user_id,
      'connection_accepted',
      'Friend Request Accepted',
      accepter_name || ' accepted your friend request.',
      jsonb_build_object('connection_id', NEW.id::text, 'friend_user_id', NEW.addressee_user_id::text)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for notifications
DROP TRIGGER IF EXISTS on_connection_request_notify ON public.user_connections;
CREATE TRIGGER on_connection_request_notify
  AFTER INSERT ON public.user_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_user_connection_request();

DROP TRIGGER IF EXISTS on_connection_accepted_notify ON public.user_connections;
CREATE TRIGGER on_connection_accepted_notify
  AFTER UPDATE ON public.user_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_connection_accepted();