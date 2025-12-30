-- Add scheduling and consent status columns to coach_outcome_showcases
ALTER TABLE coach_outcome_showcases
ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS consent_status TEXT DEFAULT 'pending';

-- Add check constraint for consent_status
ALTER TABLE coach_outcome_showcases
DROP CONSTRAINT IF EXISTS coach_outcome_showcases_consent_status_check;

ALTER TABLE coach_outcome_showcases
ADD CONSTRAINT coach_outcome_showcases_consent_status_check 
CHECK (consent_status IN ('pending', 'requested', 'granted', 'denied'));

-- Make consent_id nullable (showcases can be created before consent is granted)
ALTER TABLE coach_outcome_showcases
ALTER COLUMN consent_id DROP NOT NULL;