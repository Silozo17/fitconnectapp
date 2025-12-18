-- Create table for external (non-platform) session clients
CREATE TABLE public.external_session_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.external_session_clients ENABLE ROW LEVEL SECURITY;

-- Coaches can manage their own external clients
CREATE POLICY "Coaches can view their own external clients"
ON public.external_session_clients
FOR SELECT
USING (
  coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Coaches can insert their own external clients"
ON public.external_session_clients
FOR INSERT
WITH CHECK (
  coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Coaches can update their own external clients"
ON public.external_session_clients
FOR UPDATE
USING (
  coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Coaches can delete their own external clients"
ON public.external_session_clients
FOR DELETE
USING (
  coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
);

-- Add external_client_id to coaching_sessions
ALTER TABLE public.coaching_sessions
ADD COLUMN external_client_id UUID REFERENCES public.external_session_clients(id);

-- Make client_id nullable (but keep the constraint that at least one must be set)
ALTER TABLE public.coaching_sessions
ALTER COLUMN client_id DROP NOT NULL;

-- Add constraint: must have either client_id OR external_client_id
ALTER TABLE public.coaching_sessions
ADD CONSTRAINT session_must_have_client 
CHECK (client_id IS NOT NULL OR external_client_id IS NOT NULL);