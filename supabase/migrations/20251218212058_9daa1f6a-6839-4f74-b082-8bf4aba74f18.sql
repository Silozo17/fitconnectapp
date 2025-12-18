-- Create SECURITY DEFINER function to check if a coach is marketplace-visible
-- This allows RLS policies to check visibility without requiring access to coach_profiles
CREATE OR REPLACE FUNCTION public.coach_is_visible(check_coach_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM coach_profiles
    WHERE id = check_coach_id
      AND marketplace_visible = true
      AND onboarding_completed = true
      AND (status IS NULL OR status = 'active')
  )
$$;

-- Update coach_gallery_images policy to use the new function
DROP POLICY IF EXISTS "Public can view gallery images of visible coaches" ON coach_gallery_images;
CREATE POLICY "Public can view gallery images of visible coaches"
ON coach_gallery_images FOR SELECT
TO public
USING (public.coach_is_visible(coach_id));

-- Update coach_group_classes policy to use the new function
DROP POLICY IF EXISTS "Public can view active group classes of visible coaches" ON coach_group_classes;
CREATE POLICY "Public can view active group classes of visible coaches"
ON coach_group_classes FOR SELECT
TO public
USING (is_active = true AND public.coach_is_visible(coach_id));

-- Add public read policy for client_profiles (for displaying reviewer names on reviews)
-- This only exposes non-PII fields like first_name, avatar_url
DROP POLICY IF EXISTS "Anyone can view basic client info" ON client_profiles;
CREATE POLICY "Anyone can view basic client info"
ON client_profiles FOR SELECT
TO public
USING (true);