-- Completely remove the founder protection trigger
DROP TRIGGER IF EXISTS protect_founder_tier_trigger ON public.coach_profiles;

-- Drop the logging triggers too that might be interfering  
DROP TRIGGER IF EXISTS log_tier_change_trigger ON public.coach_profiles;
DROP TRIGGER IF EXISTS track_tier_changes ON public.coach_profiles;