-- Create gym-assets storage bucket (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gym-assets', 
  'gym-assets', 
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Public can view gym assets" ON storage.objects;
DROP POLICY IF EXISTS "Gym owners can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Gym owners can update assets" ON storage.objects;
DROP POLICY IF EXISTS "Gym owners can delete assets" ON storage.objects;

-- Allow public read access
CREATE POLICY "Public can view gym assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'gym-assets');

-- Allow gym owners to upload assets
CREATE POLICY "Gym owners can upload assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gym-assets' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.gym_profiles gp
    WHERE gp.id::text = (storage.foldername(name))[1]
    AND gp.user_id = auth.uid()
  )
);

-- Allow gym owners to update their assets
CREATE POLICY "Gym owners can update assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'gym-assets' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.gym_profiles gp
    WHERE gp.id::text = (storage.foldername(name))[1]
    AND gp.user_id = auth.uid()
  )
);

-- Allow gym owners to delete their assets
CREATE POLICY "Gym owners can delete assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gym-assets' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.gym_profiles gp
    WHERE gp.id::text = (storage.foldername(name))[1]
    AND gp.user_id = auth.uid()
  )
);