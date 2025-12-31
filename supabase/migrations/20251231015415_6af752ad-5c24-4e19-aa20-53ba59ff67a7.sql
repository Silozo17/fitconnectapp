-- Add missing cron jobs for the 3 non-functional automations

-- 1. Process client reminders every 5 minutes
SELECT cron.schedule(
  'process-client-reminders-job',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url') || '/functions/v1/process-client-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 2. Detect client dropoff daily at 6:00 AM UTC
SELECT cron.schedule(
  'detect-client-dropoff-job',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url') || '/functions/v1/detect-client-dropoff',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 3. Detect milestones daily at 7:00 AM UTC
SELECT cron.schedule(
  'detect-milestones-job',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url') || '/functions/v1/detect-milestones',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Create unified automation execution logs table for observability
CREATE TABLE IF NOT EXISTS public.automation_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_type TEXT NOT NULL, -- 'scheduled_checkin', 'client_reminder', 'dropoff_rescue', 'milestone'
  automation_id UUID, -- FK to the specific automation record
  run_id UUID NOT NULL DEFAULT gen_random_uuid(), -- Groups multiple clients in same batch
  coach_id UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES client_profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'skipped'
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  notification_sent BOOLEAN DEFAULT false,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_automation_execution_logs_coach_id ON automation_execution_logs(coach_id);
CREATE INDEX IF NOT EXISTS idx_automation_execution_logs_run_id ON automation_execution_logs(run_id);
CREATE INDEX IF NOT EXISTS idx_automation_execution_logs_automation_type ON automation_execution_logs(automation_type);
CREATE INDEX IF NOT EXISTS idx_automation_execution_logs_created_at ON automation_execution_logs(created_at DESC);

-- Enable RLS
ALTER TABLE automation_execution_logs ENABLE ROW LEVEL SECURITY;

-- Coaches can view their own logs
CREATE POLICY "Coaches can view their own automation logs"
ON automation_execution_logs
FOR SELECT
USING (
  coach_id IN (
    SELECT id FROM coach_profiles WHERE user_id = auth.uid()
  )
);

-- Service role can insert (edge functions)
CREATE POLICY "Service role can insert automation logs"
ON automation_execution_logs
FOR INSERT
WITH CHECK (true);

-- Add realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE automation_execution_logs;