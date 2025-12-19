-- Add session duration to packages
ALTER TABLE coach_packages ADD COLUMN IF NOT EXISTS session_duration_minutes INTEGER DEFAULT 60;

-- Add cancellation policy to coach profiles
ALTER TABLE coach_profiles ADD COLUMN IF NOT EXISTS min_cancellation_hours INTEGER DEFAULT 24;

-- Add package reference and token tracking to coaching_sessions
ALTER TABLE coaching_sessions ADD COLUMN IF NOT EXISTS package_purchase_id UUID REFERENCES client_package_purchases(id);
ALTER TABLE coaching_sessions ADD COLUMN IF NOT EXISTS token_returned BOOLEAN DEFAULT FALSE;
ALTER TABLE coaching_sessions ADD COLUMN IF NOT EXISTS token_returned_by UUID;
ALTER TABLE coaching_sessions ADD COLUMN IF NOT EXISTS token_return_reason TEXT;

-- Create session token history table for detailed tracking
CREATE TABLE IF NOT EXISTS session_token_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_purchase_id UUID REFERENCES client_package_purchases(id) ON DELETE CASCADE,
  session_id UUID REFERENCES coaching_sessions(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('used', 'returned', 'expired', 'manual_return')),
  reason TEXT,
  performed_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on session_token_history
ALTER TABLE session_token_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for session_token_history
CREATE POLICY "Coaches can view their token history"
ON session_token_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM client_package_purchases cpp
    JOIN coach_profiles cp ON cp.id = cpp.coach_id
    WHERE cpp.id = session_token_history.package_purchase_id
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Clients can view their own token history"
ON session_token_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM client_package_purchases cpp
    JOIN client_profiles clp ON clp.id = cpp.client_id
    WHERE cpp.id = session_token_history.package_purchase_id
    AND clp.user_id = auth.uid()
  )
);

CREATE POLICY "Coaches can insert token history"
ON session_token_history FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM client_package_purchases cpp
    JOIN coach_profiles cp ON cp.id = cpp.coach_id
    WHERE cpp.id = package_purchase_id
    AND cp.user_id = auth.uid()
  )
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_session_token_history_package ON session_token_history(package_purchase_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_package ON coaching_sessions(package_purchase_id);