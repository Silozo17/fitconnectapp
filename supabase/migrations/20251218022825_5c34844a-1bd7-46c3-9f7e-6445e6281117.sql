-- Fix SECURITY DEFINER warning: Set views to use SECURITY INVOKER
-- This ensures the views respect RLS policies of the querying user

ALTER VIEW public.public_coach_profiles SET (security_invoker = on);
ALTER VIEW public.public_leaderboard_profiles SET (security_invoker = on);