-- Create discipline_events table for logging manual/coach/wearable discipline-specific events
CREATE TABLE public.discipline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discipline_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'session', 'rounds', 'sparring', 'lift_pb', 'belt_awarded', etc.
  value_json JSONB NOT NULL DEFAULT '{}', -- flexible payload for metric values
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'wearable', 'coach'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for fast queries
CREATE INDEX idx_discipline_events_user ON public.discipline_events(user_id);
CREATE INDEX idx_discipline_events_discipline ON public.discipline_events(user_id, discipline_id);
CREATE INDEX idx_discipline_events_type ON public.discipline_events(user_id, discipline_id, event_type);
CREATE INDEX idx_discipline_events_recorded ON public.discipline_events(user_id, recorded_at DESC);

-- Enable RLS
ALTER TABLE public.discipline_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for discipline_events
CREATE POLICY "Users can view their own discipline events"
ON public.discipline_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own discipline events"
ON public.discipline_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own discipline events"
ON public.discipline_events FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own discipline events"
ON public.discipline_events FOR DELETE
USING (auth.uid() = user_id);

-- Create discipline_requests table for "Request more disciplines" feature
CREATE TABLE public.discipline_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discipline_name TEXT NOT NULL,
  requested_metrics TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discipline_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policy for discipline_requests (users can only insert their own)
CREATE POLICY "Users can create discipline requests"
ON public.discipline_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own discipline requests"
ON public.discipline_requests FOR SELECT
USING (auth.uid() = user_id);

-- Add selected_discipline column to client_profiles
ALTER TABLE public.client_profiles
ADD COLUMN selected_discipline TEXT;