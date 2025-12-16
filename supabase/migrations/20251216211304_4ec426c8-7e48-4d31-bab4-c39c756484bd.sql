-- Backfill usernames for existing users who don't have one

-- Generate usernames for existing client profiles without one
UPDATE client_profiles 
SET username = generate_unique_username(COALESCE(first_name, 'user'))
WHERE username IS NULL;

-- Generate usernames for existing coach profiles without one  
UPDATE coach_profiles
SET username = generate_unique_username(COALESCE(display_name, 'coach'))
WHERE username IS NULL;

-- Generate usernames for existing admin profiles without one
UPDATE admin_profiles
SET username = generate_unique_username(COALESCE(first_name, display_name, 'admin'))
WHERE username IS NULL;

-- Now make username NOT NULL on all profile tables
ALTER TABLE client_profiles ALTER COLUMN username SET NOT NULL;
ALTER TABLE coach_profiles ALTER COLUMN username SET NOT NULL;
ALTER TABLE admin_profiles ALTER COLUMN username SET NOT NULL;