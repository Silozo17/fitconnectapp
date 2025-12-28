-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Coaches can delete their custom foods" ON foods;
DROP POLICY IF EXISTS "Coaches can update their custom foods" ON foods;

-- Create new DELETE policy that allows deleting custom OR fatsecret foods
CREATE POLICY "Coaches can delete their custom or fatsecret foods" ON foods
FOR DELETE
TO authenticated
USING (
  (coach_id IN (
    SELECT coach_profiles.id 
    FROM coach_profiles 
    WHERE coach_profiles.user_id = auth.uid()
  )) 
  AND (is_custom = true OR source = 'fatsecret')
);

-- Create new UPDATE policy that allows updating custom OR fatsecret foods
CREATE POLICY "Coaches can update their custom or fatsecret foods" ON foods
FOR UPDATE
TO authenticated
USING (
  (coach_id IN (
    SELECT coach_profiles.id 
    FROM coach_profiles 
    WHERE coach_profiles.user_id = auth.uid()
  )) 
  AND (is_custom = true OR source = 'fatsecret')
)
WITH CHECK (
  (coach_id IN (
    SELECT coach_profiles.id 
    FROM coach_profiles 
    WHERE coach_profiles.user_id = auth.uid()
  )) 
  AND (is_custom = true OR source = 'fatsecret')
);