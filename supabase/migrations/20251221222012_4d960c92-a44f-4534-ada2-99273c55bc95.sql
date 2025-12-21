-- =============================================
-- SECURITY FIX 1: Remove overly permissive email_verifications RLS policies
-- These policies exposed verification codes publicly
-- =============================================

-- Drop the permissive policies that allow reading verification codes
DROP POLICY IF EXISTS "Verify with valid code" ON public.email_verifications;
DROP POLICY IF EXISTS "Update with valid code" ON public.email_verifications;

-- =============================================
-- SECURITY FIX 2: Recreate views with SECURITY INVOKER
-- This ensures RLS policies of the querying user are respected
-- =============================================

-- Drop and recreate public_coach_profiles view with security_invoker
DROP VIEW IF EXISTS public.public_coach_profiles;

CREATE OR REPLACE VIEW public.public_coach_profiles
WITH (security_invoker = true)
AS
SELECT 
  id,
  username,
  display_name,
  bio,
  profile_image_url,
  card_image_url,
  coach_types,
  primary_coach_type,
  hourly_rate,
  currency,
  location,
  location_city,
  location_country,
  location_country_code,
  location_lat,
  location_lng,
  experience_years,
  gym_affiliation,
  certifications,
  in_person_available,
  online_available,
  is_verified,
  verification_status,
  marketplace_visible,
  created_at,
  who_i_work_with,
  instagram_url,
  facebook_url,
  youtube_url,
  tiktok_url,
  x_url,
  linkedin_url,
  threads_url
FROM public.coach_profiles
WHERE marketplace_visible = true 
  AND status = 'active'
  AND onboarding_completed = true;

-- Drop and recreate leaderboard_profiles view with security_invoker
DROP VIEW IF EXISTS public.leaderboard_profiles;

CREATE OR REPLACE VIEW public.leaderboard_profiles
WITH (security_invoker = true)
AS
SELECT 
  cp.id,
  cp.username,
  cp.first_name,
  cp.last_name,
  cp.leaderboard_display_name,
  cp.avatar_url,
  cp.city,
  cp.county,
  cp.country,
  cp.leaderboard_visible,
  COALESCE(cx.total_xp, 0) as total_xp,
  COALESCE(cx.current_level, 1) as current_level
FROM public.client_profiles cp
LEFT JOIN public.client_xp cx ON cp.id = cx.client_id
WHERE cp.leaderboard_visible = true
  AND cp.status = 'active';

-- Drop and recreate public_leaderboard_profiles view with security_invoker  
DROP VIEW IF EXISTS public.public_leaderboard_profiles;

CREATE OR REPLACE VIEW public.public_leaderboard_profiles
WITH (security_invoker = true)
AS
SELECT 
  id,
  leaderboard_display_name,
  avatar_url,
  city,
  county,
  country,
  total_xp,
  current_level
FROM public.leaderboard_profiles;

-- =============================================
-- SECURITY FIX 4: Document oauth_temp_tokens intentional pattern
-- =============================================

COMMENT ON TABLE public.oauth_temp_tokens IS 
'OAuth temporary tokens for wearable device authentication flows. 
SECURITY NOTE: This table intentionally has RLS enabled with NO policies.
Access is restricted to service_role only (via edge functions).
This prevents any client-side access to OAuth tokens during the auth flow.';