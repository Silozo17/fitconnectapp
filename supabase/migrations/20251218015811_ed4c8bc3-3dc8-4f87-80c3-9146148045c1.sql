-- Fix the SECURITY DEFINER view issue by making it SECURITY INVOKER
DROP VIEW IF EXISTS public.leaderboard_profiles;

CREATE VIEW public.leaderboard_profiles 
WITH (security_invoker = true)
AS
SELECT 
  cp.id,
  cp.user_id,
  COALESCE(cp.leaderboard_display_name, cp.first_name, 'Anonymous') as display_name,
  cp.city,
  cp.county,
  cp.country,
  cp.selected_avatar_id,
  cp.leaderboard_visible
FROM client_profiles cp
WHERE cp.leaderboard_visible = true;

-- Grant access to the view
GRANT SELECT ON public.leaderboard_profiles TO authenticated;
GRANT SELECT ON public.leaderboard_profiles TO anon;