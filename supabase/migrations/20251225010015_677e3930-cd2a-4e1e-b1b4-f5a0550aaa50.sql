-- Add RLS policy for clients to view their assigned plans
CREATE POLICY "Clients can view their assigned plans"
ON public.plan_assignments
FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT id FROM public.client_profiles WHERE user_id = auth.uid()
  )
);