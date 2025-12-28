-- Allow admins to insert qualifications for any coach
CREATE POLICY "Admins can insert qualifications"
  ON coach_qualifications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

-- Allow admins to update qualifications for any coach
CREATE POLICY "Admins can update qualifications"
  ON coach_qualifications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

-- Allow admins to delete qualifications for any coach
CREATE POLICY "Admins can delete qualifications"
  ON coach_qualifications
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

-- Allow admins to view all qualifications
CREATE POLICY "Admins can view all qualifications"
  ON coach_qualifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );