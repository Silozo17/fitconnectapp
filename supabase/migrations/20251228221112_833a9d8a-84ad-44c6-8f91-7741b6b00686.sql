-- Create coach_qualifications table for storing coach credentials
CREATE TABLE public.coach_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuing_authority TEXT,
  issue_date DATE,
  expiry_date DATE,
  document_number TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_source TEXT, -- 'ai' | 'manual' | null
  verification_document_id UUID REFERENCES public.coach_verification_documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coach_qualifications ENABLE ROW LEVEL SECURITY;

-- Coaches can view their own qualifications
CREATE POLICY "Coaches can view own qualifications"
ON public.coach_qualifications
FOR SELECT
USING (
  coach_id IN (
    SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
  )
);

-- Coaches can insert their own qualifications
CREATE POLICY "Coaches can insert own qualifications"
ON public.coach_qualifications
FOR INSERT
WITH CHECK (
  coach_id IN (
    SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
  )
);

-- Coaches can update their own qualifications
CREATE POLICY "Coaches can update own qualifications"
ON public.coach_qualifications
FOR UPDATE
USING (
  coach_id IN (
    SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
  )
);

-- Coaches can delete their own qualifications
CREATE POLICY "Coaches can delete own qualifications"
ON public.coach_qualifications
FOR DELETE
USING (
  coach_id IN (
    SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
  )
);

-- Public can view qualifications (for coach profiles)
CREATE POLICY "Public can view coach qualifications"
ON public.coach_qualifications
FOR SELECT
USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_coach_qualifications_updated_at
BEFORE UPDATE ON public.coach_qualifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_coach_qualifications_coach_id ON public.coach_qualifications(coach_id);
CREATE INDEX idx_coach_qualifications_verified ON public.coach_qualifications(is_verified);