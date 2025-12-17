-- Allow admins to view all messages for "View as" functionality
CREATE POLICY "Admins can view all messages"
ON public.messages
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update all messages (for marking as read when viewing as another user)
CREATE POLICY "Admins can update all messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));