-- Add INSERT policies for gym_profiles and gym_staff

-- Allow authenticated users to create gym profiles (they become the owner)
CREATE POLICY "Users can create gym profiles"
ON gym_profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow users to add themselves as owner to their own gym
CREATE POLICY "Users can add themselves as owner to their gym"
ON gym_staff FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM gym_profiles 
    WHERE id = gym_id AND user_id = auth.uid()
  )
);

-- Add INSERT policy for gym_locations (gym owners/managers can create locations)
CREATE POLICY "Gym staff can create locations"
ON gym_locations FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM gym_staff gs
    WHERE gs.gym_id = gym_locations.gym_id 
    AND gs.user_id = auth.uid()
    AND gs.role IN ('owner', 'manager')
    AND gs.status = 'active'
  )
  OR EXISTS (
    SELECT 1 FROM gym_profiles gp
    WHERE gp.id = gym_locations.gym_id
    AND gp.user_id = auth.uid()
  )
);