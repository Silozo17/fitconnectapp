-- Allow coaches to view profiles of their clients
CREATE POLICY "Coaches can view their clients profiles" 
ON public.client_profiles 
FOR SELECT 
USING (
  id IN (
    SELECT cc.client_id 
    FROM coach_clients cc
    INNER JOIN coach_profiles cp ON cc.coach_id = cp.id
    WHERE cp.user_id = auth.uid()
  )
);