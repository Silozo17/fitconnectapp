-- Add policy for public access to marketplace-visible coach profiles
CREATE POLICY "Public can view marketplace visible coach profiles"
ON public.coach_profiles
FOR SELECT
TO public
USING (
  marketplace_visible = true 
  AND status = 'active' 
  AND onboarding_completed = true
);