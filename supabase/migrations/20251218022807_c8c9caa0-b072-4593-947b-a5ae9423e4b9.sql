-- GDPR COMPLIANCE: Create secure public views with only safe columns

-- 1. Create public_coach_profiles view for marketplace (SAFE COLUMNS ONLY)
CREATE OR REPLACE VIEW public.public_coach_profiles AS
SELECT 
  id,
  display_name,
  bio,
  coach_types,
  certifications,
  experience_years,
  hourly_rate,
  currency,
  location,
  online_available,
  in_person_available,
  profile_image_url,
  card_image_url,
  booking_mode,
  is_verified,
  gym_affiliation,
  marketplace_visible,
  selected_avatar_id,
  created_at,
  onboarding_completed
FROM public.coach_profiles
WHERE onboarding_completed = true 
  AND marketplace_visible = true
  AND (status IS NULL OR status = 'active');

-- 2. Create public_leaderboard_profiles view (SAFE COLUMNS ONLY - NO HEALTH DATA)
CREATE OR REPLACE VIEW public.public_leaderboard_profiles AS
SELECT 
  id,
  COALESCE(leaderboard_display_name, first_name, 'Anonymous') as display_name,
  city,
  county,
  country,
  selected_avatar_id
FROM public.client_profiles
WHERE leaderboard_visible = true;

-- 3. Grant SELECT on views to anon and authenticated roles
GRANT SELECT ON public.public_coach_profiles TO anon, authenticated;
GRANT SELECT ON public.public_leaderboard_profiles TO anon, authenticated;

-- 4. Drop overly permissive RLS policy on client_profiles that exposed ALL columns
DROP POLICY IF EXISTS "Public can view leaderboard profiles" ON public.client_profiles;

-- 5. Drop overly permissive RLS policy on coach_profiles (if it exists)
DROP POLICY IF EXISTS "Public can view completed coach profiles" ON public.coach_profiles;

-- 6. Fix user_avatars overly permissive policy - restrict to only leaderboard-visible users
DROP POLICY IF EXISTS "Users can view others unlocked avatars for leaderboard" ON public.user_avatars;

CREATE POLICY "Users can view avatars for leaderboard profiles only"
ON public.user_avatars
FOR SELECT
USING (
  user_id IN (
    SELECT user_id FROM public.client_profiles WHERE leaderboard_visible = true
  )
  OR user_id = auth.uid()
);

-- 7. Restrict boost_settings to authenticated users only (remove public read)
DROP POLICY IF EXISTS "Anyone can view boost settings" ON public.boost_settings;

CREATE POLICY "Authenticated users can view boost settings"
ON public.boost_settings
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 8. Restrict platform_features to authenticated users only
DROP POLICY IF EXISTS "Anyone can view active features" ON public.platform_features;

CREATE POLICY "Authenticated users can view active features"
ON public.platform_features
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 9. Restrict tier_features to authenticated users only
DROP POLICY IF EXISTS "Anyone can view tier features" ON public.tier_features;

CREATE POLICY "Authenticated users can view tier features"
ON public.tier_features
FOR SELECT
USING (auth.uid() IS NOT NULL);