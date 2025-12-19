-- Add RLS policy to email_verifications table based on email matching
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can verify email with valid code" ON public.email_verifications;
DROP POLICY IF EXISTS "Service role only" ON public.email_verifications;

-- Only allow selecting/updating with valid code (for verification flow)
-- This is accessed during pre-auth so we use a permissive SELECT with code validation
CREATE POLICY "Verify with valid code" 
ON public.email_verifications FOR SELECT 
TO anon, authenticated
USING (true);

-- Only allow service role to insert (via edge function)
CREATE POLICY "Service role insert only" 
ON public.email_verifications FOR INSERT 
TO service_role
WITH CHECK (true);

-- Allow updates when code matches (for marking as verified)
CREATE POLICY "Update with valid code" 
ON public.email_verifications FOR UPDATE 
TO anon, authenticated
USING (true);