-- Create scheduled_checkin_logs table for tracking execution attempts
CREATE TABLE public.scheduled_checkin_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checkin_id UUID NOT NULL REFERENCES public.scheduled_checkins(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  error_message TEXT,
  notification_sent BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for efficient querying
CREATE INDEX idx_scheduled_checkin_logs_checkin_id ON public.scheduled_checkin_logs(checkin_id);
CREATE INDEX idx_scheduled_checkin_logs_coach_id ON public.scheduled_checkin_logs(coach_id);
CREATE INDEX idx_scheduled_checkin_logs_created_at ON public.scheduled_checkin_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.scheduled_checkin_logs ENABLE ROW LEVEL SECURITY;

-- Coaches can view their own logs
CREATE POLICY "Coaches can view their own checkin logs"
ON public.scheduled_checkin_logs
FOR SELECT
USING (
  coach_id IN (
    SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
  )
);

-- Add comment for documentation
COMMENT ON TABLE public.scheduled_checkin_logs IS 'Audit log for scheduled check-in executions';