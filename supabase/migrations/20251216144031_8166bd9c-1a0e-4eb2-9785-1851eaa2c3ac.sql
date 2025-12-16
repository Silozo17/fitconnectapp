-- Add location to client_profiles
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS location TEXT;

-- Create coach_leads table for sales pipeline
CREATE TABLE public.coach_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  stage TEXT NOT NULL DEFAULT 'new_lead',
  source TEXT,
  notes TEXT,
  offer_sent_at TIMESTAMPTZ,
  deal_closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(coach_id, client_id)
);

-- Enable RLS
ALTER TABLE public.coach_leads ENABLE ROW LEVEL SECURITY;

-- RLS policies for coach_leads
CREATE POLICY "Coaches can view their own leads"
ON public.coach_leads FOR SELECT
USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can insert their own leads"
ON public.coach_leads FOR INSERT
WITH CHECK (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can update their own leads"
ON public.coach_leads FOR UPDATE
USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can delete their own leads"
ON public.coach_leads FOR DELETE
USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

-- Create index for performance
CREATE INDEX idx_coach_leads_coach_id ON public.coach_leads(coach_id);
CREATE INDEX idx_coach_leads_stage ON public.coach_leads(stage);

-- Enable realtime for pipeline updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.coach_leads;