-- Add document_url and verification_status columns to coach_qualifications table
ALTER TABLE coach_qualifications 
ADD COLUMN IF NOT EXISTS document_url TEXT,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

-- Add check constraint for verification_status
ALTER TABLE coach_qualifications
DROP CONSTRAINT IF EXISTS coach_qualifications_verification_status_check;

ALTER TABLE coach_qualifications
ADD CONSTRAINT coach_qualifications_verification_status_check 
CHECK (verification_status IN ('pending', 'approved', 'rejected'));

-- Update existing qualifications to set verification_status based on is_verified
UPDATE coach_qualifications 
SET verification_status = CASE WHEN is_verified = true THEN 'approved' ELSE 'pending' END
WHERE verification_status IS NULL;