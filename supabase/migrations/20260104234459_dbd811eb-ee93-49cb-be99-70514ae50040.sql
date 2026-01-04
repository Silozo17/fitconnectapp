-- Create storage bucket for showcase transformation photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'showcase-photos', 
  'showcase-photos', 
  true,
  1048576, -- 1MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Allow public read access to showcase photos
CREATE POLICY "Showcase photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'showcase-photos');

-- Allow coaches to upload showcase photos
CREATE POLICY "Coaches can upload showcase photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'showcase-photos' 
  AND EXISTS (
    SELECT 1 FROM coach_profiles 
    WHERE user_id = auth.uid()
  )
);

-- Allow coaches to update their own showcase photos
CREATE POLICY "Coaches can update their own showcase photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'showcase-photos' 
  AND EXISTS (
    SELECT 1 FROM coach_profiles 
    WHERE user_id = auth.uid()
  )
);

-- Allow coaches to delete their own showcase photos
CREATE POLICY "Coaches can delete their own showcase photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'showcase-photos' 
  AND EXISTS (
    SELECT 1 FROM coach_profiles 
    WHERE user_id = auth.uid()
  )
);