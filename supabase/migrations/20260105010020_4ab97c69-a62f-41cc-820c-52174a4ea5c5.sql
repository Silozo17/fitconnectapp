-- Allow coaches to read files they uploaded (coach-uploads folder)
CREATE POLICY "Coaches can read their own uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'transformation-photos' 
  AND (storage.foldername(name))[1] = 'coach-uploads'
  AND (storage.foldername(name))[2] = auth.uid()::text
);