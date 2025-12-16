-- Add cancellation fields to coaching_sessions
ALTER TABLE public.coaching_sessions 
ADD COLUMN IF NOT EXISTS cancellation_reason text,
ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS cancelled_by uuid,
ADD COLUMN IF NOT EXISTS rescheduled_from timestamp with time zone;

-- Create index for faster session queries
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_scheduled_at 
ON public.coaching_sessions(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_coaching_sessions_status 
ON public.coaching_sessions(status);