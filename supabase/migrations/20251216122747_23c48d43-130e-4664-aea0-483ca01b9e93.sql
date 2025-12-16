-- Create enum for wearable providers
CREATE TYPE wearable_provider AS ENUM ('google_fit', 'fitbit', 'garmin', 'apple_health');

-- Create enum for video providers
CREATE TYPE video_provider AS ENUM ('zoom', 'google_meet');

-- Create enum for calendar providers
CREATE TYPE calendar_provider AS ENUM ('google_calendar', 'apple_calendar');

-- Create wearable_connections table
CREATE TABLE public.wearable_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  provider wearable_provider NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  provider_user_id TEXT,
  scopes TEXT[],
  last_synced_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(client_id, provider)
);

-- Create health_data_sync table
CREATE TABLE public.health_data_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  wearable_connection_id UUID REFERENCES public.wearable_connections(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL, -- steps, heart_rate, sleep, calories, distance, active_minutes
  recorded_at DATE NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  source wearable_provider NOT NULL,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(client_id, data_type, recorded_at, source)
);

-- Create video_conference_settings table (for coaches)
CREATE TABLE public.video_conference_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  provider video_provider NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  provider_user_id TEXT,
  is_active BOOLEAN DEFAULT true,
  auto_create_meetings BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(coach_id, provider)
);

-- Create calendar_connections table
CREATE TABLE public.calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider calendar_provider NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  calendar_id TEXT, -- specific calendar to sync to
  sync_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Add video conferencing columns to coaching_sessions
ALTER TABLE public.coaching_sessions 
ADD COLUMN IF NOT EXISTS video_meeting_url TEXT,
ADD COLUMN IF NOT EXISTS video_meeting_id TEXT,
ADD COLUMN IF NOT EXISTS video_provider video_provider,
ADD COLUMN IF NOT EXISTS external_calendar_event_id TEXT;

-- Enable RLS on new tables
ALTER TABLE public.wearable_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_data_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_conference_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies for wearable_connections
CREATE POLICY "Clients can manage their own wearable connections"
ON public.wearable_connections FOR ALL
USING (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

-- RLS policies for health_data_sync
CREATE POLICY "Clients can view their own health data"
ON public.health_data_sync FOR SELECT
USING (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can insert health data"
ON public.health_data_sync FOR INSERT
WITH CHECK (true);

CREATE POLICY "Coaches can view their clients health data"
ON public.health_data_sync FOR SELECT
USING (client_id IN (
  SELECT cc.client_id FROM coach_clients cc
  JOIN coach_profiles cp ON cc.coach_id = cp.id
  WHERE cp.user_id = auth.uid()
));

-- RLS policies for video_conference_settings
CREATE POLICY "Coaches can manage their video settings"
ON public.video_conference_settings FOR ALL
USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

-- RLS policies for calendar_connections
CREATE POLICY "Users can manage their own calendar connections"
ON public.calendar_connections FOR ALL
USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_wearable_connections_client ON public.wearable_connections(client_id);
CREATE INDEX idx_health_data_sync_client_date ON public.health_data_sync(client_id, recorded_at);
CREATE INDEX idx_health_data_sync_type ON public.health_data_sync(data_type);
CREATE INDEX idx_video_settings_coach ON public.video_conference_settings(coach_id);
CREATE INDEX idx_calendar_connections_user ON public.calendar_connections(user_id);

-- Add updated_at triggers
CREATE TRIGGER update_wearable_connections_updated_at
BEFORE UPDATE ON public.wearable_connections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_conference_settings_updated_at
BEFORE UPDATE ON public.video_conference_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_connections_updated_at
BEFORE UPDATE ON public.calendar_connections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();