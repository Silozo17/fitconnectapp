-- Allow clients to view their own coaching sessions
CREATE POLICY "Clients can view their own sessions"
ON public.coaching_sessions
FOR SELECT
USING (client_id IN (
  SELECT id FROM client_profiles WHERE user_id = auth.uid()
));