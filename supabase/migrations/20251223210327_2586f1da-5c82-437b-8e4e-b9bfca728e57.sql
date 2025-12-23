-- Create App Review test account data
-- Note: The actual auth user must be created via the auth API, but we can prepare the profile data

-- First, check if we have an existing demo coach to connect to
-- We'll use the first verified coach, or create sample data

DO $$
DECLARE
    demo_coach_id UUID;
    demo_client_user_id UUID := 'a0000000-0000-0000-0000-000000000001'::UUID; -- Placeholder for App Review user
    demo_client_profile_id UUID;
BEGIN
    -- Get a verified coach to connect with
    SELECT id INTO demo_coach_id 
    FROM public.coach_profiles 
    WHERE is_verified = true 
    AND marketplace_visible = true 
    LIMIT 1;

    -- If no verified coach exists, we'll skip the coach connection
    IF demo_coach_id IS NOT NULL THEN
        RAISE NOTICE 'Found verified coach: %', demo_coach_id;
    ELSE
        RAISE NOTICE 'No verified coach found - demo account will not have a coach connection';
    END IF;
END $$;

-- Create a comment to document the App Review credentials
COMMENT ON SCHEMA public IS 'App Review Test Account: Email: appstore.review@fitconnect.app, Password: FitConnect2024!Review';