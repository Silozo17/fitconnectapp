-- Remove redundant public role policies that are duplicates of authenticated policies
-- These policies expose client_profiles to public role evaluation unnecessarily
-- The equivalent authenticated policies already handle the same access patterns

DROP POLICY IF EXISTS "Admins can view client profiles" ON client_profiles;
DROP POLICY IF EXISTS "Coaches can view client profiles from messages" ON client_profiles;