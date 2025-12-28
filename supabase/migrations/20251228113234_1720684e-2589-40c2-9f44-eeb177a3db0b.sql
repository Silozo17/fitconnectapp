-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Coaches can create custom foods" ON foods;

-- Create new policy that allows both custom and fatsecret foods
CREATE POLICY "Coaches can create custom or fatsecret foods" ON foods
FOR INSERT
TO authenticated
WITH CHECK (
  (coach_id IN (
    SELECT coach_profiles.id 
    FROM coach_profiles 
    WHERE coach_profiles.user_id = auth.uid()
  )) 
  AND (is_custom = true OR source = 'fatsecret')
);