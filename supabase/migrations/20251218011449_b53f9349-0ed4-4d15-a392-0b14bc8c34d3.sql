-- Add RLS policy allowing users to delete accepted connections (friends)
CREATE POLICY "Users can delete accepted connections"
ON public.user_connections FOR DELETE
TO authenticated
USING (
  (requester_user_id = auth.uid() OR addressee_user_id = auth.uid())
  AND status = 'accepted'
);