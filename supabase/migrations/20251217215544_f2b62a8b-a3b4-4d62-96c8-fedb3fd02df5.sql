-- Add RLS policy for coaches to view client profiles when they have messages with that client
CREATE POLICY "Coaches can view client profiles from messages via profile id"
ON client_profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM messages m
    WHERE (m.sender_id = client_profiles.id OR m.receiver_id = client_profiles.id)
    AND (
      m.sender_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid())
      OR m.receiver_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid())
    )
  )
);