-- Drop the buggy policies and recreate with correct reference
DROP POLICY IF EXISTS "Gym owners can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Gym owners can update assets" ON storage.objects;
DROP POLICY IF EXISTS "Gym owners can delete assets" ON storage.objects;

-- Recreate with correct reference to storage object name (not gym profile name)
CREATE POLICY "Gym owners can upload assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gym-assets' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.gym_profiles
    WHERE id::text = (storage.foldername(objects.name))[1]
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Gym owners can update assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'gym-assets' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.gym_profiles
    WHERE id::text = (storage.foldername(objects.name))[1]
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Gym owners can delete assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gym-assets' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.gym_profiles
    WHERE id::text = (storage.foldername(objects.name))[1]
    AND user_id = auth.uid()
  )
);