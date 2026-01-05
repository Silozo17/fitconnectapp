-- Allow clients to insert their own health data
CREATE POLICY "Clients can insert own health data"
ON health_data_sync
FOR INSERT
TO authenticated
WITH CHECK (
  client_id IN (
    SELECT id FROM client_profiles WHERE user_id = auth.uid()
  )
);

-- Allow clients to update their own health data
CREATE POLICY "Clients can update own health data"
ON health_data_sync
FOR UPDATE
TO authenticated
USING (
  client_id IN (
    SELECT id FROM client_profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  client_id IN (
    SELECT id FROM client_profiles WHERE user_id = auth.uid()
  )
);