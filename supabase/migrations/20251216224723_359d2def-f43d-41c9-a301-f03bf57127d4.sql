-- Add RLS policies for admin avatar management on user_avatars table
CREATE POLICY "Admins can view all user avatars"
ON public.user_avatars
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can grant avatars to users"
ON public.user_avatars
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can revoke avatars from users"
ON public.user_avatars
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));