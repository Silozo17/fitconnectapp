-- Create function to handle new user creation (runs as SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Get role from user metadata, default to 'client'
  user_role := COALESCE(
    (new.raw_user_meta_data ->> 'role')::app_role,
    'client'::app_role
  );
  
  -- Insert into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, user_role);
  
  -- Create profile based on role
  IF user_role = 'client' THEN
    INSERT INTO public.client_profiles (user_id)
    VALUES (new.id);
  ELSIF user_role = 'coach' THEN
    INSERT INTO public.coach_profiles (user_id)
    VALUES (new.id);
  END IF;
  
  RETURN new;
END;
$$;

-- Create trigger that fires when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();