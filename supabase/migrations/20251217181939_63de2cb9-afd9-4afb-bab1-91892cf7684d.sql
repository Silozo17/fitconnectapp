-- Allow users to view admin profiles when they have a connection with them
CREATE POLICY "Users can view admin profiles for connections"
ON admin_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_connections uc
    WHERE (
      (uc.requester_user_id = admin_profiles.user_id AND uc.addressee_user_id = auth.uid())
      OR
      (uc.addressee_user_id = admin_profiles.user_id AND uc.requester_user_id = auth.uid())
    )
    AND uc.status IN ('pending', 'accepted')
  )
);

-- Allow users to view client profiles when they have a connection with them
CREATE POLICY "Users can view client profiles for connections"
ON client_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_connections uc
    WHERE (
      (uc.requester_user_id = client_profiles.user_id AND uc.addressee_user_id = auth.uid())
      OR
      (uc.addressee_user_id = client_profiles.user_id AND uc.requester_user_id = auth.uid())
    )
    AND uc.status IN ('pending', 'accepted')
  )
);

-- Allow users to view coach profiles when they have a connection with them
CREATE POLICY "Users can view coach profiles for connections"
ON coach_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_connections uc
    WHERE (
      (uc.requester_user_id = coach_profiles.user_id AND uc.addressee_user_id = auth.uid())
      OR
      (uc.addressee_user_id = coach_profiles.user_id AND uc.requester_user_id = auth.uid())
    )
    AND uc.status IN ('pending', 'accepted')
  )
);