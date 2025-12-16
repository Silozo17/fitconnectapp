-- Make coach_id nullable so clients can self-log progress
ALTER TABLE public.client_progress ALTER COLUMN coach_id DROP NOT NULL;

-- Add photo_urls column for progress photos
ALTER TABLE public.client_progress ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT '{}';

-- Add RLS policies for clients to manage their own progress
CREATE POLICY "Clients can view their own progress"
ON public.client_progress
FOR SELECT
USING (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can insert their own progress"
ON public.client_progress
FOR INSERT
WITH CHECK (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can update their own progress"
ON public.client_progress
FOR UPDATE
USING (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can delete their own progress"
ON public.client_progress
FOR DELETE
USING (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

-- Create storage policies for transformation-photos bucket
CREATE POLICY "Users can upload their own progress photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'transformation-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own progress photos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'transformation-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own progress photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'transformation-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Coaches can view their clients progress photos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'transformation-photos' 
  AND EXISTS (
    SELECT 1 FROM coach_clients cc
    JOIN coach_profiles cp ON cc.coach_id = cp.id
    JOIN client_profiles clp ON cc.client_id = clp.id
    WHERE cp.user_id = auth.uid()
    AND clp.user_id::text = (storage.foldername(name))[1]
  )
);