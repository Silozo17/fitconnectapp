-- Create storage buckets for profile images, documents, and transformation photos

-- Profile images bucket (public - anyone can view)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Documents bucket (private - for certifications, ID verification)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Transformation photos bucket (private - client progress photos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('transformation-photos', 'transformation-photos', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for profile-images bucket (public viewing, owner upload/delete)
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own profile image"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile image"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile image"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policies for documents bucket (private, owner + admin access)
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policies for transformation-photos bucket
CREATE POLICY "Clients can view their own transformation photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'transformation-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Coaches can view their clients transformation photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'transformation-photos' 
  AND EXISTS (
    SELECT 1 FROM public.coach_clients cc
    JOIN public.coach_profiles cp ON cc.coach_id = cp.id
    JOIN public.client_profiles clp ON cc.client_id = clp.id
    WHERE cp.user_id = auth.uid()
    AND clp.user_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can upload their own transformation photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'transformation-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own transformation photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'transformation-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add avatar_url column to client_profiles if it doesn't exist
ALTER TABLE public.client_profiles 
ADD COLUMN IF NOT EXISTS avatar_url text;