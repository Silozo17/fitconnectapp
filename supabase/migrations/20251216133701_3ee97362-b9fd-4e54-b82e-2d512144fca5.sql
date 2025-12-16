-- Fix RLS policy for coach_profiles to allow public viewing
-- Drop the restrictive policy and create a permissive one

DROP POLICY IF EXISTS "Anyone can view coach profiles" ON public.coach_profiles;

-- Create a PERMISSIVE policy for public SELECT access to completed coach profiles
CREATE POLICY "Public can view completed coach profiles"
ON public.coach_profiles
FOR SELECT
USING (onboarding_completed = true);