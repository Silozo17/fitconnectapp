-- Allow clients to update consent status on their own showcase records
CREATE POLICY "Clients can update consent on their showcases"
ON public.coach_outcome_showcases
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT client_profiles.user_id
    FROM client_profiles
    WHERE client_profiles.id = coach_outcome_showcases.client_id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT client_profiles.user_id
    FROM client_profiles
    WHERE client_profiles.id = coach_outcome_showcases.client_id
  )
);