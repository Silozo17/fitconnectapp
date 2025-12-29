-- Create coach_client_reports table for storing AI-generated reports
CREATE TABLE public.coach_client_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  
  -- Report content
  title TEXT NOT NULL,
  report_data JSONB NOT NULL,
  
  -- Photo comparisons (before/after URLs, dates, AI analysis)
  photo_comparison JSONB,
  
  -- Measurements comparison over time
  measurements_comparison JSONB,
  
  -- Wearable data summary
  wearable_summary JSONB,
  
  -- Coach's personal notes added to report
  coach_notes TEXT,
  
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'sent')),
  sent_to_client_at TIMESTAMPTZ,
  
  -- AI disclaimer acknowledgment
  ai_disclaimer_acknowledged BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX idx_coach_client_reports_coach_id ON public.coach_client_reports(coach_id);
CREATE INDEX idx_coach_client_reports_client_id ON public.coach_client_reports(client_id);
CREATE INDEX idx_coach_client_reports_status ON public.coach_client_reports(status);
CREATE INDEX idx_coach_client_reports_created_at ON public.coach_client_reports(created_at DESC);

-- Enable RLS
ALTER TABLE public.coach_client_reports ENABLE ROW LEVEL SECURITY;

-- Coaches can CRUD their own reports
CREATE POLICY "Coaches can view their own reports"
ON public.coach_client_reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM coach_profiles cp
    WHERE cp.id = coach_client_reports.coach_id
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Coaches can create reports for their clients"
ON public.coach_client_reports
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM coach_profiles cp
    WHERE cp.id = coach_client_reports.coach_id
    AND cp.user_id = auth.uid()
  )
  AND
  EXISTS (
    SELECT 1 FROM coach_clients cc
    WHERE cc.coach_id = coach_client_reports.coach_id
    AND cc.client_id = coach_client_reports.client_id
    AND cc.status = 'active'
  )
);

CREATE POLICY "Coaches can update their own reports"
ON public.coach_client_reports
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM coach_profiles cp
    WHERE cp.id = coach_client_reports.coach_id
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Coaches can delete their own reports"
ON public.coach_client_reports
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM coach_profiles cp
    WHERE cp.id = coach_client_reports.coach_id
    AND cp.user_id = auth.uid()
  )
);

-- Clients can view reports sent to them
CREATE POLICY "Clients can view reports sent to them"
ON public.coach_client_reports
FOR SELECT
USING (
  sent_to_client_at IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM client_profiles cp
    WHERE cp.id = coach_client_reports.client_id
    AND cp.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_coach_client_reports_updated_at
BEFORE UPDATE ON public.coach_client_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();