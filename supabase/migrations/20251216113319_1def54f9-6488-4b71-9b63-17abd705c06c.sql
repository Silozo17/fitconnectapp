-- Add verification columns to coach_profiles
ALTER TABLE public.coach_profiles
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'not_submitted',
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS verified_by uuid,
ADD COLUMN IF NOT EXISTS verification_notes text;

-- Create coach verification documents table
CREATE TABLE public.coach_verification_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id uuid NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL, -- 'identity', 'certification', 'insurance', 'qualification'
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coach_verification_documents ENABLE ROW LEVEL SECURITY;

-- Coaches can view and manage their own documents
CREATE POLICY "Coaches can view their own documents"
ON public.coach_verification_documents
FOR SELECT
USING (coach_id IN (
  SELECT id FROM coach_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Coaches can insert their own documents"
ON public.coach_verification_documents
FOR INSERT
WITH CHECK (coach_id IN (
  SELECT id FROM coach_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Coaches can delete their pending documents"
ON public.coach_verification_documents
FOR DELETE
USING (
  coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid())
  AND status = 'pending'
);

-- Admins can manage all documents
CREATE POLICY "Admins can view all documents"
ON public.coach_verification_documents
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all documents"
ON public.coach_verification_documents
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_coach_verification_documents_updated_at
BEFORE UPDATE ON public.coach_verification_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage policies for verification documents folder
CREATE POLICY "Coaches can upload verification documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'verification'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Coaches can view their verification documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'verification'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Admins can view all verification documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'verification'
  AND has_role(auth.uid(), 'admin'::app_role)
);