-- Add payment configuration to session_types (coach controls payment requirements)
ALTER TABLE session_types 
ADD COLUMN IF NOT EXISTS payment_required TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS deposit_type TEXT DEFAULT 'percentage',
ADD COLUMN IF NOT EXISTS deposit_value NUMERIC DEFAULT 0;

-- Add check constraints
ALTER TABLE session_types 
ADD CONSTRAINT session_types_payment_required_check 
CHECK (payment_required IN ('none', 'deposit', 'full'));

ALTER TABLE session_types 
ADD CONSTRAINT session_types_deposit_type_check 
CHECK (deposit_type IN ('percentage', 'fixed'));

-- Add payment tracking to booking_requests
ALTER TABLE booking_requests
ADD COLUMN IF NOT EXISTS payment_required TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'not_required',
ADD COLUMN IF NOT EXISTS amount_due NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;

ALTER TABLE booking_requests 
ADD CONSTRAINT booking_requests_payment_status_check 
CHECK (payment_status IN ('not_required', 'pending', 'deposit_paid', 'fully_paid', 'refunded'));

-- Add payment tracking to coaching_sessions
ALTER TABLE coaching_sessions
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS remaining_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

ALTER TABLE coaching_sessions 
ADD CONSTRAINT coaching_sessions_payment_status_check 
CHECK (payment_status IN ('pending', 'deposit_paid', 'fully_paid', 'refunded'));