-- Drop the overly permissive public policy that exposes ALL client data
DROP POLICY IF EXISTS "Anyone can view basic client info" ON public.client_profiles;

-- Drop and recreate the public leaderboard view with proper columns
DROP VIEW IF EXISTS public.public_leaderboard_profiles;

CREATE VIEW public.public_leaderboard_profiles AS
SELECT 
  cp.id,
  cp.username,
  cp.leaderboard_display_name,
  cp.leaderboard_visible,
  cp.avatar_url,
  cp.selected_avatar_id,
  cp.city,
  cp.county,
  cp.country,
  cx.total_xp,
  cx.current_level
FROM public.client_profiles cp
LEFT JOIN public.client_xp cx ON cx.client_id = cp.id
WHERE cp.leaderboard_visible = true
  AND (cp.status IS NULL OR cp.status = 'active');

-- Grant select on the view to anon and authenticated
GRANT SELECT ON public.public_leaderboard_profiles TO anon, authenticated;