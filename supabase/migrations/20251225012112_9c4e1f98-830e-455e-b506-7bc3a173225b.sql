-- Allow clients to view training plans that have been assigned to them
CREATE POLICY "Clients can view their assigned plans"
ON public.training_plans
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT plan_id FROM public.plan_assignments
    WHERE client_id IN (
      SELECT id FROM public.client_profiles
      WHERE user_id = auth.uid()
    )
  )
);