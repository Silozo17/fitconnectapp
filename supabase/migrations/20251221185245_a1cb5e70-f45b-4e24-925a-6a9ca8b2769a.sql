-- Step 1: Update Magdalena's structured location fields
UPDATE coach_profiles
SET 
  location = TRIM(location),
  location_city = 'Rzeszów',
  location_country = 'Poland',
  location_country_code = 'PL'
WHERE id = '03f0b8a2-8c14-44dc-a00b-942e772de45b';

-- Step 2: Trim whitespace from all location fields
UPDATE coach_profiles
SET location = TRIM(location)
WHERE location IS NOT NULL AND location != TRIM(location);

-- Step 3: Ensure all country codes are uppercase
UPDATE coach_profiles
SET location_country_code = UPPER(location_country_code)
WHERE location_country_code IS NOT NULL AND location_country_code != UPPER(location_country_code);