-- Fix legacy coach profiles that were incorrectly marked as onboarded
-- These profiles have onboarding_completed = true but empty/null onboarding_progress
UPDATE coach_profiles 
SET onboarding_completed = false
WHERE onboarding_completed = true 
AND (onboarding_progress IS NULL OR onboarding_progress = '{}');