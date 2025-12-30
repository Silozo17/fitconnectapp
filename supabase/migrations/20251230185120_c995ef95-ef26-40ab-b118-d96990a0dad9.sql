-- Function to auto-create client_xp record when a new client_profiles entry is created
CREATE OR REPLACE FUNCTION public.handle_new_client_profile_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.client_xp (client_id, total_xp, current_level, xp_to_next_level)
  VALUES (NEW.id, 0, 1, 100)
  ON CONFLICT (client_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop trigger if it exists (idempotent)
DROP TRIGGER IF EXISTS on_client_profile_created_xp ON public.client_profiles;

-- Create trigger to run after client_profiles insert
CREATE TRIGGER on_client_profile_created_xp
  AFTER INSERT ON public.client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_client_profile_xp();