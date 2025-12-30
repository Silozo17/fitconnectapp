-- Allow external transformations (no consent_id for external clients)
ALTER TABLE coach_outcome_showcases 
  ALTER COLUMN consent_id DROP NOT NULL;

-- Add columns to track external transformations
ALTER TABLE coach_outcome_showcases 
  ADD COLUMN IF NOT EXISTS is_external BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS external_client_name TEXT,
  ADD COLUMN IF NOT EXISTS coach_consent_acknowledged BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS coach_consent_acknowledged_at TIMESTAMPTZ;