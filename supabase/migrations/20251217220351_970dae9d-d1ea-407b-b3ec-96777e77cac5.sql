-- Create a SECURITY DEFINER function to check if a client has messaged another client
CREATE OR REPLACE FUNCTION public.client_can_view_client_profile(target_client_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM messages m
    JOIN client_profiles cp ON cp.user_id = auth.uid()
    WHERE (
      (m.sender_id = target_client_profile_id AND m.receiver_id = cp.id)
      OR (m.receiver_id = target_client_profile_id AND m.sender_id = cp.id)
    )
  )
$$;

-- Create the policy for clients to view other clients they've messaged
CREATE POLICY "Clients can view client profiles they messaged with"
ON client_profiles FOR SELECT
TO authenticated
USING (public.client_can_view_client_profile(id));