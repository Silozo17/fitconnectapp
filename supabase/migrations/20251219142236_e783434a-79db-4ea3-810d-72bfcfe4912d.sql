-- Enable RLS on email_verifications table
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- No policies needed - edge functions use service role key which bypasses RLS
-- This prevents direct access from client-side while allowing edge functions to work
-- Edge functions that manage OTP verification already use SUPABASE_SERVICE_ROLE_KEY

-- Add comment explaining the security model
COMMENT ON TABLE public.email_verifications IS 'OTP verification codes for email verification. Protected by RLS with no client-side policies - only accessible via edge functions using service role.';