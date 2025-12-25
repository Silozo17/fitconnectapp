-- Add review request settings columns to coach_profiles
ALTER TABLE public.coach_profiles
ADD COLUMN IF NOT EXISTS auto_review_requests boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS review_request_delay_hours integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS custom_review_message text,
ADD COLUMN IF NOT EXISTS review_request_mode text DEFAULT 'auto';

-- Add check constraint for review_request_mode
ALTER TABLE public.coach_profiles
ADD CONSTRAINT coach_profiles_review_request_mode_check 
CHECK (review_request_mode IN ('auto', 'manual'));

-- Add comment for documentation
COMMENT ON COLUMN public.coach_profiles.review_request_mode IS 'auto: send after session completion, manual: coach triggers manually';
COMMENT ON COLUMN public.coach_profiles.review_request_delay_hours IS 'Hours to wait before sending review request (0 = immediately)';
COMMENT ON COLUMN public.coach_profiles.custom_review_message IS 'Optional custom message to include in review request email';