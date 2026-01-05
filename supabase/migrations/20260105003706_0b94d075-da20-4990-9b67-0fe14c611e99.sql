-- Allow coaches to upload transformation photos
CREATE POLICY "Coaches can upload transformation photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'transformation-photos' 
  AND EXISTS (
    SELECT 1 FROM coach_profiles 
    WHERE coach_profiles.user_id = auth.uid()
  )
);