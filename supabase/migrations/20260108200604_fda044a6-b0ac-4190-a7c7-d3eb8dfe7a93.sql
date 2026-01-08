-- Create debug logs table for comprehensive user action tracking
CREATE TABLE public.user_debug_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  event_type text NOT NULL,
  event_name text NOT NULL,
  event_data jsonb DEFAULT '{}',
  component text,
  route text,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Index for fast querying by user and time
CREATE INDEX idx_debug_logs_user_time ON public.user_debug_logs(user_id, timestamp DESC);
CREATE INDEX idx_debug_logs_session ON public.user_debug_logs(session_id, timestamp DESC);
CREATE INDEX idx_debug_logs_event_type ON public.user_debug_logs(event_type, timestamp DESC);

-- Enable RLS
ALTER TABLE public.user_debug_logs ENABLE ROW LEVEL SECURITY;

-- Users can insert their own logs (or anonymous logs)
CREATE POLICY "Users can insert own debug logs"
  ON public.user_debug_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins can read all debug logs
CREATE POLICY "Admins can read all debug logs"
  ON public.user_debug_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'manager', 'staff')
    )
  );

-- Admins can delete debug logs (for cleanup)
CREATE POLICY "Admins can delete debug logs"
  ON public.user_debug_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );