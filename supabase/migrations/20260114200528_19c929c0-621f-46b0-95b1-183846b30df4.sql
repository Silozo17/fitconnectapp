-- Allow public read access (for displaying logos/covers)
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