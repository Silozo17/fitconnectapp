-- Create table for storing external calendar events (for 2-way sync / availability blocking)
CREATE TABLE IF NOT EXISTS public.external_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  calendar_connection_id UUID REFERENCES public.calendar_connections ON DELETE CASCADE,
  external_event_id TEXT NOT NULL,
  title TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_all_day BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'apple_calendar',
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(calendar_connection_id, external_event_id)
);

-- Enable RLS
ALTER TABLE public.external_calendar_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own external events
CREATE POLICY "Users can view own external events"
  ON public.external_calendar_events FOR SELECT
  USING (auth.uid() = user_id);

-- Users can manage their own external events
CREATE POLICY "Users can manage own external events"
  ON public.external_calendar_events FOR ALL
  USING (auth.uid() = user_id);

-- Create index for fast querying by user and time range
CREATE INDEX idx_external_calendar_events_user_time 
  ON public.external_calendar_events (user_id, start_time, end_time);

-- Add last_inbound_sync_at to calendar_connections for tracking 2-way sync
ALTER TABLE public.calendar_connections 
  ADD COLUMN IF NOT EXISTS last_inbound_sync_at TIMESTAMPTZ;