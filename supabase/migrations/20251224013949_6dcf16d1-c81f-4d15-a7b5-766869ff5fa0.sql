-- Fix immediate issue: Create missing client_profile for affected user
INSERT INTO public.client_profiles (user_id, username, first_name, user_profile_id, onboarding_completed)
SELECT 
  'e6ca5f47-011a-4e64-9364-0a7d12e1d65a',
  COALESCE(up.username, 'user_' || substr('e6ca5f47-011a-4e64-9364-0a7d12e1d65a'::text, 1, 8)),
  up.first_name,
  up.id,
  false
FROM public.user_profiles up 
WHERE up.user_id = 'e6ca5f47-011a-4e64-9364-0a7d12e1d65a'
ON CONFLICT (user_id) DO NOTHING;

-- Backfill: Create client_profiles for any users with client role but no profile
INSERT INTO public.client_profiles (user_id, username, first_name, user_profile_id, onboarding_completed)
SELECT 
  ur.user_id,
  COALESCE(up.username, 'user_' || substr(ur.user_id::text, 1, 8)),
  up.first_name,
  up.id,
  false
FROM public.user_roles ur
LEFT JOIN public.client_profiles cp ON ur.user_id = cp.user_id
LEFT JOIN public.user_profiles up ON ur.user_id = up.user_id
WHERE ur.role = 'client' AND cp.id IS NULL
ON CONFLICT (user_id) DO NOTHING;